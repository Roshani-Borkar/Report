import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LabelList, Legend
} from "recharts";
// Remove SharePoint imports (spfi, SPFI, SPFx)

// Format euro value (remains the same)
function formatEuro(value: number) {
  if (value >= 1_000_000) return `€${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `€${Math.round(value / 1_000)}K`;
  return `€${value}`;
}

// Custom label for value display (remains the same)
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
  salesRecords: any[]; // Changed prop
  statusOrder: string[]; // New prop
  statusColors: Record<string, string>; // New prop
}

const CustomerOpportunityStatusChart: React.FC<ICustomerOpportunityStatusChartProps> = ({ salesRecords, statusOrder, statusColors }) => {
  const [data, setData] = useState<any[]>([]);
  // Remove spfi initialization and useEffect for fetching statuses/colors

  // Fetch chart data logic now uses 'salesRecords' prop
  useEffect(() => {
    if (!statusOrder.length) {
      // If statusOrder is not yet available, don't process data
      setData([]);
      return;
    }

    const grouped: Record<string, Record<string, number>> = {};
    const usedStatusSet = new Set<string>();

    salesRecords.forEach((item: any) => { // Use salesRecords prop
      const customer = item.Customer || "Unknown";
      const status = item.OpportunityStatus || "Unknown";
      const amount = Number(item.OppAmount) || 0;

      if (!grouped[customer]) grouped[customer] = {};
      grouped[customer][status] = (grouped[customer][status] || 0) + amount;

      if (amount > 0) usedStatusSet.add(status);
    });

    // Filter statusOrder to only include statuses that actually have data in the current selection
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
  }, [salesRecords, statusOrder, statusColors]); // Re-run when salesRecords, statusOrder or statusColors change

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