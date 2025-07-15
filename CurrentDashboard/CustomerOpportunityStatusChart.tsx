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
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LabelList, Legend
} from "recharts";
import { spfi, SPFI } from "@pnp/sp";
import { SPFx } from "@pnp/sp/presets/all";

// Format euro value
function formatEuro(value: number) {
  if (value >= 1_000_000) return `€${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `€${Math.round(value / 1_000)}K`;
  return `€${value}`;
}

// Custom label for value display
const CustomValueLabel = (props: any) => {
  const { x, y, width, height, value } = props;
  if (!value || value <= 0) return null;
  if (width > 45) {
    return (
      <text
        x={x + width - 6}
        y={y + height / 2 + 5}
        fill="#333"
        fontSize={13}
        textAnchor="end"
        fontWeight="bold"
      >
        {formatEuro(value)}
      </text>
    );
  }
  return (
    <text
      x={x + width + 6}
      y={y + height / 2 + 5}
      fill="#333"
      fontSize={13}
      textAnchor="start"
      fontWeight="bold"
    >
      {formatEuro(value)}
    </text>
  );
};

interface ICustomerOpportunityStatusChartProps {
  context: any;
  customers?: string[];
  startDate?: Date | null;
  endDate?: Date | null;
}

const CustomerOpportunityStatusChart: React.FC<ICustomerOpportunityStatusChartProps> = ({ context, customers = [], startDate, endDate }) => {
  const [data, setData] = useState<any[]>([]);
  const [statusOrder, setStatusOrder] = useState<string[]>([]);
  const [statusColors, setStatusColors] = useState<Record<string, string>>({});
  const sp: SPFI = spfi().using(SPFx(context));

  // Fetch statuses and generate colors
  useEffect(() => {
    async function fetchStatuses() {
      try {
        const statusItems = await sp.web.lists.getByTitle("CWSalesOpportunityStatus").items.select("Title").orderBy("ID")();
        const statuses = statusItems.map((item: any) => item.Title).filter(Boolean);
        setStatusOrder(statuses);

        // Generate colors dynamically
        const generatedColors: Record<string, string> = {};
        const defaultPalette = [
          "#ffc107", "#FF5F1F", "#8bc34a", "#f44336",
          "#03a9f4", "#9c27b0", "#ff9800", "#607d8b", "#00bcd4", "#cddc39"
        ];
        statuses.forEach((status, index) => {
          generatedColors[status] = defaultPalette[index % defaultPalette.length];
        });
        setStatusColors(generatedColors);
      } catch (error) {
        console.error("Error fetching statuses:", error);
      }
    }

    fetchStatuses();
  }, [context]);

  // Fetch chart data
useEffect(() => {
  async function fetchData() {
    if (!statusOrder.length) return;

    const list = sp.web.lists.getByTitle("CWSalesRecords").items.select("Customer", "OppAmount", "OpportunityStatus", "ReportDate");

    const filters: string[] = [];
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

    const grouped: Record<string, Record<string, number>> = {};
    const usedStatusSet = new Set<string>();

    items.forEach((item: any) => {
      const customer = item.Customer || "Unknown";
      const status = item.OpportunityStatus || "Unknown";
      const amount = Number(item.OppAmount) || 0;

      if (!grouped[customer]) grouped[customer] = {};
      grouped[customer][status] = (grouped[customer][status] || 0) + amount;

      if (amount > 0) usedStatusSet.add(status);
    });

    const usedStatuses = statusOrder.filter(status => usedStatusSet.has(status));

    const chartRows = Object.keys(grouped)
      .map(customer => {
        const row: any = { Customer: customer };
        let hasNonZero = false;

        usedStatuses.forEach(status => {
          const val = grouped[customer][status] || 0;
          row[status] = val;
          if (val > 0) hasNonZero = true;
        });

        row.total = usedStatuses.reduce((sum, status) => sum + (row[status] || 0), 0);
        return hasNonZero ? row : null;
      })
      .filter(Boolean)
      .sort((a, b) => b!.total - a!.total);

    setData(chartRows);
  }

  fetchData();
}, [customers, startDate, endDate, statusOrder]); // ← remove 'context' here



  return (
    <div>
      <h4 style={{ color: "#888", fontWeight: 400, fontSize: 15, marginBottom: 8 }}>
        Opportunity Size by Customer and Status
      </h4>
      {statusOrder.length > 0 && Object.keys(statusColors).length > 0 && (
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
                <XAxis type="number" tickFormatter={formatEuro} />
                <YAxis type="category" dataKey="Customer" width={180} />
                <Tooltip formatter={formatEuro} />
                <Legend />
                {statusOrder.map(status => (
                  <Bar
                    key={status}
                    dataKey={status}
                    stackId="a"
                    fill={statusColors[status] || "#aaa"}
                    name={status}
                    isAnimationActive={false}
                  >
                    <LabelList
                      dataKey={status}
                      content={<CustomValueLabel />}
                    />
                  </Bar>
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerOpportunityStatusChart;
