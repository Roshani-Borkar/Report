import * as React from "react";
import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, LabelList, CartesianGrid
} from "recharts";
// REMOVE: import { spfi, SPFI } from "@pnp/sp";
// REMOVE: import { SPFx } from "@pnp/sp/presets/all";

interface ICustomerOpportunityCountChartProps {
  salesRecords: any[];    // NEW PROP
  salesCustomers: any[];  // NEW PROP (for the customer map)
  statusColors: Record<string, string>; // NEW PROP (for consistent colors)
  // REMOVE context: any;
  // REMOVE customers?: string[];
  // REMOVE startDate?: Date | null;
  // REMOVE endDate?: Date | null;
}

const CustomerOpportunityCountByStatusChart: React.FC<ICustomerOpportunityCountChartProps> = ({
  salesRecords, salesCustomers, statusColors // Update destructuring
}) => {
  const [data, setData] = useState<any[]>([]);
  const [statusKeys, setStatusKeys] = useState<string[]>([]);
  // REMOVE: const [statusColors, setStatusColors] = useState<Record<string, string>>({});
  // REMOVE: const sp: SPFI = spfi().using(SPFx(context)); // REMOVE SharePoint instance

  useEffect(() => {
    // REMOVE fetchData function content as it's no longer fetching from SharePoint
    // Instead, process the salesRecords and salesCustomers props

    const customerMap: Record<string, string> = {};
    salesCustomers.forEach(cust => { // Use salesCustomers prop
      customerMap[cust.Title] = cust.Account || "Unknown";
    });

    const grouped: Record<string, Record<string, number>> = {};
    const statusSet = new Set<string>();

    salesRecords.forEach(item => { // Use salesRecords prop
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
    }).sort((a, b) => b.total - a.total); // Sort by total count

    const uniqueStatuses = Array.from(statusSet);
    setStatusKeys(uniqueStatuses);

    // statusColors is now passed as a prop, no need to generate here
    setData(chartData);
  }, [salesRecords, salesCustomers, statusColors]); // Update dependencies

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
              interval={0} // Show all labels
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
                fill={statusColors[status] || "#aaa"} // Use passed statusColors
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