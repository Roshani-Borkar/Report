import * as React from "react";
import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, LabelList, CartesianGrid
} from "recharts";
// REMOVE: import { spfi, SPFI } from "@pnp/sp";
// REMOVE: import { SPFx } from "@pnp/sp/presets/all";

interface ICustomerOpportunitySizeChartProps { // NOTE: This interface name is misleading, should be WonLostChartProps
  salesRecords: any[];    // NEW PROP
  salesCustomers: any[];  // NEW PROP (for the customer map)
  // REMOVE context: any;
  // REMOVE customers?: string[];
  // REMOVE startDate?: Date | null;
  // REMOVE endDate?: Date | null;
}

const formatEuro = (value: number) => {
  if (value >= 1_000_000) return `€${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `€${Math.round(value / 1_000)}K`;
  return `€${value}`;
};

const SideBySideWonLostChart: React.FC<ICustomerOpportunitySizeChartProps> = ({ salesRecords, salesCustomers }) => { // Update destructuring
  const [wonData, setWonData] = useState<any[]>([]);
  const [lostData, setLostData] = useState<any[]>([]);
  // REMOVE: const sp: SPFI = spfi().using(SPFx(context)); // REMOVE SharePoint instance

  useEffect(() => {
    // REMOVE fetchData function content as it's no longer fetching from SharePoint
    // Instead, process the salesRecords and salesCustomers props

    const customerMap: Record<string, string> = {};
    salesCustomers.forEach(cust => { // Use salesCustomers prop
      customerMap[cust.Title] = cust.Account || "Unknown";
    });

    const wonGroup: Record<string, number> = {};
    const lostGroup: Record<string, number> = {};

    salesRecords.forEach(item => { // Use salesRecords prop
      const customerId = item.Customer;
      const account = customerMap[customerId] || "Unknown";
      const status = item.OpportunityStatus || "";
      const amount = parseFloat(item.OppAmount) || 0;

      if (status === "Won" || status === "Quoted") { // Ensure "Quoted" is correctly handled if it implies won
        wonGroup[account] = (wonGroup[account] || 0) + amount;
      } else if (status === "Lost") {
        lostGroup[account] = (lostGroup[account] || 0) + amount;
      }
    });

    const wonChartData = Object.entries(wonGroup)
        .map(([account, value]) => ({ Account: account, Won: value }))
        .sort((a,b) => b.Won - a.Won); // Sort for better visualization
    const lostChartData = Object.entries(lostGroup)
        .map(([account, value]) => ({ Account: account, Lost: value }))
        .sort((a,b) => b.Lost - a.Lost); // Sort for better visualization

    setWonData(wonChartData);
    setLostData(lostChartData);
  }, [salesRecords, salesCustomers]); // Update dependencies

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 400, paddingRight: 20 }}>
          <h4 style={{ color: "#888", fontWeight: 400, fontSize: 15, marginBottom: 8 }}>
            Business Won by Account
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={wonData} margin={{ top: 20, right: 40, left: 30, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="Account" tick={{ fontSize: 12 }} interval={0} angle={-20} textAnchor="end"/>
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
            Business Lost by Account
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={lostData} margin={{ top: 20, right: 40, left: 30, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="Account" tick={{ fontSize: 12 }} interval={0} angle={-20} textAnchor="end"/>
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