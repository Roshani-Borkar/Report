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
import { spfi, SPFI } from "@pnp/sp";
import { SPFx } from "@pnp/sp/presets/all";

interface WinningOpportunityCardProps {
  context: any;
  startDate?: Date | null;
  endDate?: Date | null;
  customers?: string[]; 
}

// Format like K, L, Cr
function formatNumber(value: number): string {
  if (value >= 10000000) return `${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toString();
}

const WinningOpportunityCard: React.FC<WinningOpportunityCardProps> = ({
  context,
  startDate,
  endDate,
  customers = [] // default to empty
}) => {
  const [winCount, setWinCount] = useState(0);
  const [winAmount, setWinAmount] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const sp: SPFI = spfi().using(SPFx(context));

  useEffect(() => {
    const match = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDarkMode(match.matches);

    const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    match.addEventListener("change", handler);
    return () => match.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    async function fetchWinningData() {
      const list = sp.web.lists.getByTitle("CWSalesRecords").items.select("OpportunityStatus", "OppAmount", "ReportDate", "Customer");

      const filters: string[] = ["OpportunityStatus eq 'Won'"];

      if (customers.length > 0) {
        const customerFilter = customers.map(c => `Customer eq '${c.replace(/'/g, "''")}'`).join(" or ");
        filters.push(`(${customerFilter})`);
      }

      if (startDate) filters.push(`ReportDate ge '${startDate.toISOString()}'`);
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        filters.push(`ReportDate le '${endOfDay.toISOString()}'`);
      }

      const items = await list.filter(filters.join(" and "))();

      const total = items.reduce((sum, item) => sum + (Number(item.OppAmount) || 0), 0);

      setWinCount(items.length);
      setWinAmount(total);
    }

    fetchWinningData();
  }, [context, startDate, endDate, customers]);

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
