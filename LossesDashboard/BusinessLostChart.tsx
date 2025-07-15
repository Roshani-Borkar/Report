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
import { spfi, SPFI } from "@pnp/sp";
import { SPFx } from "@pnp/sp/presets/all";

// Format euro values (like €14.4M, €6.3K)
function formatEuro(value: number) {
  if (value >= 1_000_000) return `€${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `€${Math.round(value / 1_000)}K`;
  return `€${value}`;
}

interface BusinessLostChartProps {
  context: any;
  startDate?: Date | null;
  endDate?: Date | null;
  customers?: string[];
}

const BusinessLostChart: React.FC<BusinessLostChartProps> = ({ context, startDate, endDate, customers = [] }) => {
  const [data, setData] = useState<{ customer: string; amount: number }[]>([]);
  const sp: SPFI = spfi().using(SPFx(context));

  useEffect(() => {
    async function fetchData() {
      const list = sp.web.lists.getByTitle("CWSalesRecords").items.select("Customer", "OppAmount", "OpportunityStatus", "ReportDate");

      const filters: string[] = ["OpportunityStatus eq 'Lost'"];
      if (customers.length > 0) {
        const customerFilter = customers.map(c => `Customer eq '${c.replace(/'/g, "''")}'`).join(" or ");
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

      // Group by customer and sum amounts
      const grouped: Record<string, number> = {};
      items.forEach((item: any) => {
        const customer = item.Customer || "Unknown";
        const amount = Number(item.OppAmount) || 0;
        grouped[customer] = (grouped[customer] || 0) + amount;
      });

      const chartData = Object.entries(grouped)
        .map(([customer, amount]) => ({ customer, amount }))
        .filter(entry => entry.amount > 0)
        .sort((a, b) => b.amount - a.amount);

      setData(chartData);
    }

    fetchData();
  }, [context, startDate, endDate, customers]);

  return (
    <div>
      <h4 style={{ color: "#888", fontWeight: 400, fontSize: 15, marginBottom: 8 }}>
        Business Lost by Customer
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
            <Bar dataKey="amount" fill="#f94449">
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

export default BusinessLostChart;
