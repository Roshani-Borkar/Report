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
import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, LabelList
} from "recharts";
// REMOVE: import { spfi, SPFI } from "@pnp/sp";
// REMOVE: import { SPFx } from "@pnp/sp/presets/all";

// Format euro values (like €14.4M, €6.3K)
function formatEuro(value: number) {
  if (value >= 1_000_000) return `€${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `€${Math.round(value / 1_000)}K`;
  return `€${value}`;
}

interface BusinessWonChartProps {
  salesRecords: any[]; // NEW PROP
  // REMOVE: context: any;
  // REMOVE: startDate?: Date | null;
  // REMOVE: endDate?: Date | null;
  // REMOVE: customers?: string[];
}

const BusinessWonChart: React.FC<BusinessWonChartProps> = ({ salesRecords }) => { // Update destructuring
  const [data, setData] = useState<{ customer: string; amount: number }[]>([]);
  // REMOVE: const sp: SPFI = spfi().using(SPFx(context));

  useEffect(() => {
    // Filter salesRecords in-memory for 'Won' status
    const wonItems = salesRecords.filter(item => item.OpportunityStatus === 'Won');

    // Group by customer and sum amounts
    const grouped: Record<string, number> = {};
    wonItems.forEach((item: any) => {
      const customer = item.Customer || "Unknown";
      const amount = Number(item.OppAmount) || 0;
      grouped[customer] = (grouped[customer] || 0) + amount;
    });

    const chartData = Object.entries(grouped)
      .map(([customer, amount]) => ({ customer, amount }))
      .filter(entry => entry.amount > 0)
      .sort((a, b) => b.amount - a.amount);

    setData(chartData);
  }, [salesRecords]); // Depend on salesRecords prop

  return (
    <div>
      <h4 style={{ color: "#888", fontWeight: 400, fontSize: 15, marginBottom: 8 }}>
        Business Won by Customer
      </h4>
      <div style={{ width: "100%", height: "800px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="customer"
              angle={-45}
              textAnchor="end"
              interval={0}
              height={120}
            />
            <YAxis tickFormatter={formatEuro} />
            <Tooltip formatter={formatEuro} />
            <Bar dataKey="amount" fill="#8bc34a">
              <LabelList
                dataKey="amount"
                position="top"
                formatter={formatEuro}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BusinessWonChart;