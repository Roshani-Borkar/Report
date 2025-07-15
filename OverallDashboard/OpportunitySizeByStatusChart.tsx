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
import { spfi, SPFI } from "@pnp/sp";
import { SPFx } from "@pnp/sp/presets/all";

// Format euro values
function formatEuro(value: number) {
  if (value >= 1_000_000) return `€ ${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `€ ${(value / 1_000).toFixed(2)}K`;
  return `€ ${value}`;
}

interface OpportunitySizeByStatusChartProps {
  context: any;
  startDate?: Date | null;
  endDate?: Date | null;
}

const OpportunitySizeByStatusChart: React.FC<OpportunitySizeByStatusChartProps> = ({
  context,
  startDate,
  endDate
}) => {
  const [data, setData] = useState<any[]>([]);
  const [statusColors, setStatusColors] = useState<Record<string, string>>({});
  const [statusOrder, setStatusOrder] = useState<string[]>([]);
  const sp: SPFI = spfi().using(SPFx(context));

  useEffect(() => {
    async function fetchStatuses() {
      const statusItems = await sp.web.lists
        .getByTitle("CWSalesOpportunityStatus")
        .items.select("Title")
        .orderBy("ID")();

      const statuses = statusItems.map((item: any) => item.Title).filter(Boolean);
      setStatusOrder(statuses);

      const palette = [
        "#00bcd4", "#ffc107", "#8bc34a", "#f44336", "#9c27b0",
        "#ff9800", "#607d8b", "#3f51b5", "#795548", "#009688"
      ];
      const colors: Record<string, string> = {};
      statuses.forEach((status, index) => {
        colors[status] = palette[index % palette.length];
      });
      setStatusColors(colors);
    }

    fetchStatuses();
  }, [context]);

  useEffect(() => {
    if (!statusOrder.length) return;

    async function fetchData() {
      const list = sp.web.lists.getByTitle("CWSalesRecords").items.select("OpportunityStatus", "OppAmount", "ReportDate");

      const filters: string[] = [];

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

      const grouped: Record<string, number> = {};
      items.forEach((item: any) => {
        const status = item.OpportunityStatus || "(Blank)";
        const amount = Number(item.OppAmount) || 0;
        grouped[status] = (grouped[status] || 0) + amount;
      });

      const chartData = statusOrder
        .map(status => ({
          status,
          amount: grouped[status] || 0
        }))
        .filter(entry => entry.amount > 0); // ✅ Hide 0-amount statuses

      // Optional: include (Blank) if it has value
      if (grouped["(Blank)"] && grouped["(Blank)"] > 0) {
        chartData.unshift({
          status: "(Blank)",
          amount: grouped["(Blank)"]
        });
      }

      setData(chartData);
    }

    fetchData();
  }, [context, startDate, endDate, statusOrder]);

  return (
    <div>
      <h4 style={{ fontWeight: 400, fontSize: 15, color: "#888", marginBottom: 10 }}>
        Opportunity Size by Status
      </h4>
      <div style={{ width: "100%", height: "400px", overflowX: "auto" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="status" angle={-30} textAnchor="end" height={70} interval={0} />
            <YAxis tickFormatter={formatEuro} />
            <Tooltip formatter={formatEuro} />
            <Bar dataKey="amount" radius={4} isAnimationActive={false}>
              <LabelList dataKey="amount" position="top" formatter={formatEuro} />
              {data.map((entry) => (
                <Cell key={entry.status} fill={statusColors[entry.status] || "#aaa"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default OpportunitySizeByStatusChart;
