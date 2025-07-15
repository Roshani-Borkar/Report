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

interface OpportunitySummaryCardProps {
  context: any;
  startDate?: Date | null;
  endDate?: Date | null;
  showProbable?: boolean;

}

// Format like K, L, Cr
function formatNumber(value: number): string {
  if (value >= 10000000) return `${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toString();
}

const OpportunitySummaryCard: React.FC<OpportunitySummaryCardProps> = ({ context, startDate, endDate,showProbable }) => {
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [probableAmount, setProbableAmount] = useState(0);


  const sp: SPFI = spfi().using(SPFx(context));

  useEffect(() => {
  async function fetchData() {
    const list = sp.web.lists.getByTitle("CWSalesRecords").items.select("OppAmount", "ReportDate", "OpportunityStatus");

    const filters: string[] = [];

    if (startDate) filters.push(`ReportDate ge '${startDate.toISOString()}'`);
    if (endDate) {
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      filters.push(`ReportDate le '${endOfDay.toISOString()}'`);
    }

    const items = filters.length > 0
      ? await list.filter(filters.join(" and "))()
      : await list();

    const total = items.reduce((sum, item) => sum + (Number(item.OppAmount) || 0), 0);
    setTotalAmount(total);
    setTotalCount(items.length);

    // 🟨 Add this block if showProbable is true
    if (showProbable) {
      const statusItems = await sp.web.lists
        .getByTitle("CWSalesOpportunityStatus")
        .items.select("Title", "Percentage")();

      const statusMap: Record<string, number> = {};
      statusItems.forEach((item: any) => {
        statusMap[item.Title] = Number(item.Percentage) || 0;
      });

      let probable = 0;
      items.forEach((item: any) => {
        const amount = Number(item.OppAmount) || 0;
        const status = item.OpportunityStatus;
        const percent = statusMap[status] || 0;
        probable += (amount * percent) / 100;
      });

      setProbableAmount(probable);
    }
  }

  fetchData();
}, [context, startDate, endDate, showProbable]);


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
