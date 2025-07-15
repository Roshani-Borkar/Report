import * as React from "react";
import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, LabelList, CartesianGrid
} from "recharts";
import { spfi, SPFI } from "@pnp/sp";
import { SPFx } from "@pnp/sp/presets/all";

interface ICustomerOpportunitySizeChartProps {
  context: any;
  customers?: string[];
  startDate?: Date | null;
  endDate?: Date | null;
}

const formatEuro = (value: number) => {
  if (value >= 1_000_000) return `€${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `€${Math.round(value / 1_000)}K`;
  return `€${value}`;
};

const SideBySideWonLostChart: React.FC<ICustomerOpportunitySizeChartProps> = ({ context, customers = [], startDate, endDate }) => {
  const [wonData, setWonData] = useState<any[]>([]);
  const [lostData, setLostData] = useState<any[]>([]);
  const sp: SPFI = spfi().using(SPFx(context));

  useEffect(() => {
    async function fetchData() {
      const customerItems = await sp.web.lists
        .getByTitle("CWSalesCustomer")
        .items.select("Title", "Account").top(4999)();

      const customerMap: Record<string, string> = {};
      customerItems.forEach(cust => {
        customerMap[cust.Title] = cust.Account || "Unknown";
      });

      const recordsList = sp.web.lists.getByTitle("CWSalesRecords").items
        .select("Customer", "OppAmount", "OpportunityStatus", "ReportDate");

      const filters: string[] = [];
      if (customers.length > 0) {
        const customerFilter = customers.map(c => `Customer eq '${c.replace(/'/g, "''")}'`).join(' or ');
        filters.push(`(${customerFilter})`);
      }
      if (startDate) {
        filters.push(`ReportDate ge '${startDate.toISOString()}'`);
      }
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        filters.push(`ReportDate le '${endOfDay.toISOString()}'`);
      }

      const records = filters.length > 0
        ? await recordsList.filter(filters.join(' and '))()
        : await recordsList();

      const wonGroup: Record<string, number> = {};
      const lostGroup: Record<string, number> = {};

      records.forEach(item => {
        const customerId = item.Customer;
        const account = customerMap[customerId] || "Unknown";
        const status = item.OpportunityStatus || "";
        const amount = parseFloat(item.OppAmount) || 0;

        if (status === "Won" || status === "Quoted") {
          wonGroup[account] = (wonGroup[account] || 0) + amount;
        } else if (status === "Lost") {
          lostGroup[account] = (lostGroup[account] || 0) + amount;
        }
      });

      const wonChartData = Object.entries(wonGroup).map(([account, value]) => ({ Account: account, Won: value }));
      const lostChartData = Object.entries(lostGroup).map(([account, value]) => ({ Account: account, Lost: value }));

      setWonData(wonChartData);
      setLostData(lostChartData);
    }

    fetchData();
  }, [context, customers, startDate, endDate]);

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 400, paddingRight: 20 }}>
          <h4 style={{ color: "#888", fontWeight: 400, fontSize: 15, marginBottom: 8 }}>
            Business Won by Account and Status
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={wonData} margin={{ top: 20, right: 40, left: 30, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="Account" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={formatEuro} />
              <Tooltip formatter={(val: number) => formatEuro(val)} />
              <Legend />
              <Bar dataKey="Won" fill="#8bc34a">
                <LabelList dataKey="Won" position="insideTop" formatter={formatEuro} style={{ fill: "#fff", fontWeight: "bold" }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ flex: 1, minWidth: 400 }}>
          <h4 style={{ color: "#888", fontWeight: 400, fontSize: 15, marginBottom: 8 }}>
            Business Lost by Account and Status
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={lostData} margin={{ top: 20, right: 40, left: 30, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="Account" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={formatEuro} />
              <Tooltip formatter={(val: number) => formatEuro(val)} />
              <Legend />
              <Bar dataKey="Lost" fill="#e3242b">
                <LabelList dataKey="Lost" position="insideTop" formatter={formatEuro} style={{ fill: "#fff", fontWeight: "bold" }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default SideBySideWonLostChart;
