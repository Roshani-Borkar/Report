/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/prefer-as-const */
/* eslint-disable no-sequences */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable max-lines */
/* eslint-disable dot-notation */
/* eslint-disable react/self-closing-comp */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @rushstack/no-new-null */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-floating-promises */
import * as React from "react";
import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, LabelList, Cell
} from "recharts";
// REMOVE: import { spfi, SPFI } from "@pnp/sp";
// REMOVE: import { SPFx } from "@pnp/sp/presets/all";

interface OpportunityCountByStatusChartProps {
  salesRecords: any[]; // NEW PROP
  statusOrder: string[]; // NEW PROP
  statusColors: Record<string, string>; // NEW PROP
  // REMOVE: context: any;
  // REMOVE: startDate?: Date | null;
  // REMOVE: endDate?: Date | null;
}

const OpportunityCountByStatusChart: React.FC<OpportunityCountByStatusChartProps> = ({ salesRecords, statusOrder, statusColors }) => { // Update destructuring

  const [data, setData] = useState<any[]>([]);
  // REMOVE: const [statusColors, setStatusColors] = useState<Record<string, string>>({});
  // REMOVE: const [statusOrder, setStatusOrder] = useState<string[]>([]);
  // REMOVE: const sp: SPFI = spfi().using(SPFx(context));

  // REMOVE: useEffect to fetch statuses (now passed from Report.tsx)

  useEffect(() => {
    if (!statusOrder.length) return; // Ensure statusOrder is available

    // Process salesRecords in-memory
    const grouped: Record<string, number> = {};
    salesRecords.forEach((item: any) => {
      const status = item.OpportunityStatus || "(Blank)";
      grouped[status] = (grouped[status] || 0) + 1;
    });

    const chartData = statusOrder
      .map(status => ({
        status,
        count: grouped[status] || 0
      }))
      .filter(entry => entry.count > 0);

    if (grouped["(Blank)"]) {
      chartData.unshift({
        status: "(Blank)",
        count: grouped["(Blank)"]
      });
    }

    setData(chartData);
  }, [salesRecords, statusOrder, statusColors]); // Update dependencies

  return (
    <div>
      <h4 style={{ fontWeight: 400, fontSize: 15, color: "#888", marginBottom: 10 }}>
        Opportunity Count by Status
      </h4>
      <div style={{ width: "100%", height: "400px", overflowX: "auto" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="status"
              angle={-30}
              textAnchor="end"
              height={70}
              interval={0}
            />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" radius={4} isAnimationActive={false}>
              <LabelList dataKey="count" position="top" />
              {data.map((entry) => (
                <Cell
                  key={`cell-${entry.status}`}
                  fill={statusColors[entry.status] || "#aaa"} // Use passed statusColors
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default OpportunityCountByStatusChart;