/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/prefer-as-const */
/* eslint-disable no-sequences */
/* eslint-disable @typescript-eslint/no-unused-expressions */
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
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
// REMOVE: import { spfi, SPFI } from "@pnp/sp";
// REMOVE: import { SPFx } from "@pnp/sp/presets/all";

// Format euro values like €1.5M
function formatEuro(value: number) {
  if (value >= 1_000_000) return `€${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `€${Math.round(value / 1_000)}K`;
  return `€${value}`;
}

// Convert ISO date to quarter string like "Q1 2024"
function getQuarterLabel(dateStr: string): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "Unknown";
  const quarter = Math.floor(date.getMonth() / 3) + 1;
  return `Q${quarter} ${date.getFullYear()}`;
}

interface BusinessLostByQuarterChartProps {
  salesRecords: any[]; // NEW PROP
  // REMOVE: context: any;
  // REMOVE: customers?: string[];
  // REMOVE: startDate?: Date | null;
  // REMOVE: endDate?: Date | null;
}

const BusinessLostByQuarterChart: React.FC<BusinessLostByQuarterChartProps> = ({
  salesRecords // Update destructuring
}) => {
  const [data, setData] = useState<{ quarter: string; amount: number }[]>([]);
  // REMOVE: const sp: SPFI = spfi().using(SPFx(context));

  useEffect(() => {
    // Filter salesRecords in-memory for 'Lost' status
    const lostItems = salesRecords.filter(item => item.OpportunityStatus === 'Lost');

    // Group by quarter
    const grouped: Record<string, number> = {};
    lostItems.forEach((item: any) => {
      if (!item.ReportDate) return;
      const quarter = getQuarterLabel(item.ReportDate);
      const amount = Number(item.OppAmount) || 0;
      grouped[quarter] = (grouped[quarter] || 0) + amount;
    });

    // Sort by year/quarter
    const sortedData = Object.entries(grouped)
      .map(([quarter, amount]) => ({ quarter, amount }))
      .sort((a, b) => {
        const [qa, ya] = a.quarter.split(" ");
        const [qb, yb] = b.quarter.split(" ");
        return Number(ya) !== Number(yb)
          ? Number(ya) - Number(yb)
          : Number(qa.replace("Q", "")) - Number(qb.replace("Q", ""));
      });

    setData(sortedData);
  }, [salesRecords]); // Depend on salesRecords prop

  return (
    <div>
      <h4 style={{ color: "#88a", fontWeight: 400, fontSize: 15, marginBottom: 8 }}>
        Business Lost by Quarter
      </h4>
      <div style={{ width: "100%", height: 350 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="quarter" tick={{ fontSize: 11 }} interval={0} minTickGap={10} />
            <YAxis tickFormatter={formatEuro} />
            <Tooltip formatter={(value) => formatEuro(Number(value))} />
            <Area type="monotone" dataKey="amount" stroke="#f44336" fill="#ffcdd2" />

          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BusinessLostByQuarterChart;