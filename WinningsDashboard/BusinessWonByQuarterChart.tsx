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
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { spfi, SPFI } from "@pnp/sp";
import { SPFx } from "@pnp/sp/presets/all";

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

interface BusinessWonByQuarterChartProps {
  context: any;
  customers?: string[];
  startDate?: Date | null;
  endDate?: Date | null;
}

const BusinessWonByQuarterChart: React.FC<BusinessWonByQuarterChartProps> = ({
  context,
  customers = [],
  startDate,
  endDate,
}) => {
  const [data, setData] = useState<{ quarter: string; amount: number }[]>([]);
  const sp: SPFI = spfi().using(SPFx(context));

  useEffect(() => {
    async function fetchData() {
      const list = sp.web.lists.getByTitle("CWSalesRecords").items.select("Customer", "OppAmount", "OpportunityStatus", "ReportDate");

      const filters: string[] = ["OpportunityStatus eq 'Won'"];

      if (customers.length > 0) {
        const customerFilter = customers
          .map(c => `Customer eq '${c.replace(/'/g, "''")}'`)
          .join(" or ");
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

      const items = filters.length > 0
        ? await list.filter(filters.join(" and "))()
        : await list();

      // Group by quarter
      const grouped: Record<string, number> = {};
      items.forEach((item: any) => {
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
    }

    fetchData();
  }, [context, customers, startDate, endDate]);

  return (
    <div>
      <h4 style={{ color: "#88a", fontWeight: 400, fontSize: 15, marginBottom: 8 }}>
        Business Won by Quarter
      </h4>
      <div style={{ width: "100%", height: 350 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="quarter" tick={{ fontSize: 11 }} interval={0} minTickGap={10} />
            <YAxis tickFormatter={formatEuro} />
            <Tooltip formatter={(value) => formatEuro(Number(value))} />
            <Area type="monotone" dataKey="amount" stroke="#7fc241" fill="#c8e6c9" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BusinessWonByQuarterChart;
