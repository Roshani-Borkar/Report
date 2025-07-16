import * as React from "react";
import { useEffect, useState } from "react";
// Remove SharePoint imports (spfi, SPFI, SPFx)

interface OpportunitySummaryCardProps {
  salesRecords: any[]; // Changed prop
  statusMap: Record<string, number>; // New prop
  showProbable?: boolean;
}

// Format like K, L, Cr
function formatNumber(value: number): string {
  if (value >= 10000000) return `${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toString();
}

const OpportunitySummaryCard: React.FC<OpportunitySummaryCardProps> = ({ salesRecords, statusMap, showProbable }) => {
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [probableAmount, setProbableAmount] = useState(0);

  // Removed spfi initialization

  useEffect(() => {
    // Calculations now use the passed salesRecords
    const total = salesRecords.reduce((sum, item) => sum + (Number(item.OppAmount) || 0), 0);
    setTotalAmount(total);
    setTotalCount(salesRecords.length);

    if (showProbable) {
      let probable = 0;
      salesRecords.forEach((item: any) => {
        const amount = Number(item.OppAmount) || 0;
        const status = item.OpportunityStatus;
        const percent = statusMap[status] || 0; // Use statusMap prop
        probable += (amount * percent) / 100;
      });
      setProbableAmount(probable);
    }
  }, [salesRecords, statusMap, showProbable]); // Re-run when salesRecords or statusMap change


  useEffect(() => {
    const match = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDarkMode(match.matches);

    const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    match.addEventListener("change", handler);
    return () => match.removeEventListener("change", handler);
  }, []);

  const kpis = [
    {
      label: "Business Size",
      value: `€ ${formatNumber(totalAmount)}`,
      color: "#00796b"
    },
    {
      label: "Opportunities Count",
      value: totalCount.toString(),
      color: "#1976d2"
    },
    ...(showProbable
      ? [{
        label: "Probable",
        value: `€ ${formatNumber(probableAmount)}`,
        color: "#e65100"
      }]
      : [])
  ];

  const cardStyle = {
    background: isDarkMode ? "#1e1e1e" : "#f6f8fa",
    color: isDarkMode ? "#f0f0f0" : "#000",
    borderRadius: 8,
    padding: "16px 20px",
    boxShadow: isDarkMode ? "0 2px 6px rgba(255,255,255,0.08)" : "0 2px 6px rgba(0,0,0,0.08)"
  };

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "16px",
        marginBottom: 32
      }}
    >
      {kpis.map((kpi, index) => (
        <div
          key={index}
          style={{
            ...cardStyle,
            flex: "1 1 220px",
            minWidth: 220,
            borderLeft: `5px solid ${kpi.color}`
          }}
        >
          <div style={{ fontSize: 13, color: isDarkMode ? "#aaa" : "#777", marginBottom: 6 }}>
            {kpi.label}
          </div>
          <div style={{ fontSize: 20, fontWeight: 600 }}>{kpi.value}</div>
        </div>
      ))}
    </div>
  );
};

export default OpportunitySummaryCard;