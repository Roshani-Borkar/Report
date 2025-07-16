import * as React from "react";
import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, LabelList, Cell,
} from "recharts";
// Remove SharePoint imports (spfi, SPFI, SPFx)

interface ICustomerOpportunityCountChartProps {
  salesRecords: any[]; // Changed prop
  statusColors: Record<string, string>; // New prop, passed from Report.tsx
}

const CustomerOpportunityCountChart: React.FC<ICustomerOpportunityCountChartProps> = ({ salesRecords, statusColors }) => {
  const [data, setData] = useState<any[]>([]);
  // Remove spfi initialization

  useEffect(() => {
    // Group by Customer, count opportunities, and find most frequent status for coloring
    const grouped: Record<string, { Customer: string, count: number, mainStatus: string }> = {};
    const statusCount: Record<string, Record<string, number>> = {};

    salesRecords.forEach((item: any) => { // Use salesRecords prop
      const customer = item.Customer || "Unknown";
      const status = item.OpportunityStatus || "Unknown";
      if (!grouped[customer]) {
        grouped[customer] = { Customer: customer, count: 0, mainStatus: status };
        statusCount[customer] = {};
      }
      grouped[customer].count += 1;
      statusCount[customer][status] = (statusCount[customer][status] || 0) + 1;
    });

    // Determine the most frequent status for each customer
    Object.keys(grouped).forEach(customer => {
      const counts = statusCount[customer];
      const mainStatus = Object.keys(counts).reduce((a, b) =>
        counts[a] > counts[b] ? a : b
      );
      grouped[customer].mainStatus = mainStatus;
    });

    // Convert to array, sort by count descending
    const chartRows = Object.values(grouped).sort((a, b) => b.count - a.count);

    setData(chartRows);
  }, [salesRecords, statusColors]); // Re-run when salesRecords or statusColors change

  return (
    <div>
      <h4 style={{ color: "#888", fontWeight: 400, fontSize: 15, marginBottom: 8 }}>
        Opportunity Count by Customer
      </h4>
      <div style={{ width: "100%", height: "500px", overflowY: "auto" }}>
        <div style={{ height: `${data.length * 35}px`, minHeight: "100%" }}>

          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ left: 30, right: 30, top: 20, bottom: 20 }}
              barGap={2}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="Customer" width={200} />
              <Tooltip />
              <Bar dataKey="count" isAnimationActive={false}>
                <LabelList dataKey="count" position="right" />
                {data.map((entry) => (
                  <Cell
                    key={`cell-${entry.Customer}`}
                    fill={statusColors[entry.mainStatus] || "#aaa"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default CustomerOpportunityCountChart;