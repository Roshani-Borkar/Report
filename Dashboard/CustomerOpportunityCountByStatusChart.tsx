import * as React from "react";
import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, LabelList, CartesianGrid
} from "recharts";
import { spfi, SPFI } from "@pnp/sp";
import { SPFx } from "@pnp/sp/presets/all";

interface ICustomerOpportunityCountChartProps {
  context: any;
  customers?: string[];
  startDate?: Date | null;
  endDate?: Date | null;
}

const CustomerOpportunityCountByStatusChart: React.FC<ICustomerOpportunityCountChartProps> = ({
  context, customers = [], startDate, endDate
}) => {
  const [data, setData] = useState<any[]>([]);
  const [statusKeys, setStatusKeys] = useState<string[]>([]);
  const [statusColors, setStatusColors] = useState<Record<string, string>>({});
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
        .select("Customer", "OpportunityStatus", "ReportDate");

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

      const grouped: Record<string, Record<string, number>> = {};
      const statusSet = new Set<string>();

      records.forEach(item => {
        const customerId = item.Customer;
        const account = customerMap[customerId] || "Unknown";
        const status = item.OpportunityStatus || "Blank";

        if (!grouped[account]) grouped[account] = {};
        if (!grouped[account][status]) grouped[account][status] = 0;

        grouped[account][status] += 1;
        statusSet.add(status);
      });

      const chartData = Object.entries(grouped).map(([account, statuses]) => {
        const total = Object.values(statuses).reduce((sum, v) => sum + v, 0);
        return {
          Account: account,
          ...statuses,
          total
        };
      });

      const uniqueStatuses = Array.from(statusSet);
      setStatusKeys(uniqueStatuses);

      // Dynamically generate colors
      const palette = [
        "#ffc107", "#FF5F1F", "#8bc34a", "#f44336",
        "#03a9f4", "#9c27b0", "#ff9800", "#607d8b", "#00bcd4", "#cddc39"
      ];
      const colorMap: Record<string, string> = {};
      uniqueStatuses.forEach((status, index) => {
        colorMap[status] = palette[index % palette.length];
      });
      setStatusColors(colorMap);
      setData(chartData);
    }

    fetchData();
  }, [context, customers, startDate, endDate]);

  return (
    <div>
      <h4 style={{ color: "#888", fontWeight: 400, fontSize: 15, marginBottom: 8 }}>
        Opportunity Count by Account and Status
      </h4>
      <div style={{ width: "100%", height: "500px", overflowX: "auto" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 40, left: 30, bottom: 60 }}
            barCategoryGap="20%"
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="category"
              dataKey="Account"
              tick={{ fontSize: 12 }}
              angle={-20}
              textAnchor="end"
            />
            <YAxis
              type="number"
              tick={{ fontSize: 12 }}
            />
            <Tooltip />
            <Legend />
            {statusKeys.map((status) => (
              <Bar
                key={status}
                dataKey={status}
                stackId="a"
                fill={statusColors[status] || "#aaa"}
                name={status}
                isAnimationActive={false}
                minPointSize={2}
              >
                <LabelList
                  dataKey={status}
                  position="insideTop"
                  style={{ fill: "#fff", fontSize: 12, fontWeight: 500 }}
                />
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CustomerOpportunityCountByStatusChart;
