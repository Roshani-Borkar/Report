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
// REMOVE: import { spfi, SPFI } from "@pnp/sp";
// REMOVE: import { SPFx } from "@pnp/sp/presets/all";

interface WinningOpportunityCardProps {
  salesRecords: any[]; // NEW PROP
  statusMap: Record<string, number>; // NEW PROP (used for probable amount in OpportunitySummaryCard, less critical here but good for consistency)
  // REMOVE: context: any;
  // REMOVE: startDate?: Date | null;
  // REMOVE: endDate?: Date | null;
  // REMOVE: customers?: string[];
}

// Format like K, L, Cr
function formatNumber(value: number): string {
  if (value >= 10000000) return `${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toString();
}

const WinningOpportunityCard: React.FC<WinningOpportunityCardProps> = ({
  salesRecords, // Update destructuring
  statusMap // Update destructuring
}) => {
  const [winCount, setWinCount] = useState(0);
  const [winAmount, setWinAmount] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // REMOVE: const sp: SPFI = spfi().using(SPFx(context));

  useEffect(() => {
    const match = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDarkMode(match.matches);

    const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    match.addEventListener("change", handler);
    return () => match.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    // Filter salesRecords in-memory for 'Won' status
    const wonItems = salesRecords.filter(item => item.OpportunityStatus === 'Won');

    const total = wonItems.reduce((sum, item) => sum + (Number(item.OppAmount) || 0), 0);

    setWinCount(wonItems.length);
    setWinAmount(total);
  }, [salesRecords]); // Depend on salesRecords prop

  const cardStyle = {
    background: isDarkMode ? "#1e1e1e" : "#f6f8fa",
    color: isDarkMode ? "#f0f0f0" : "#000",
    borderRadius: 8,
    padding: "16px 20px",
    boxShadow: isDarkMode ? "0 2px 6px rgba(255,255,255,0.08)" : "0 2px 6px rgba(0,0,0,0.08)"
  };

  const kpis = [
    {
      label: "Winning Business Size",
      value: `€ ${formatNumber(winAmount)}`,
      color: "#2e7d32"
    },
    {
      label: "Winning Opportunity Count",
      value: winCount.toString(),
      color: "#388e3c"
    }
  ];

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

export default WinningOpportunityCard;