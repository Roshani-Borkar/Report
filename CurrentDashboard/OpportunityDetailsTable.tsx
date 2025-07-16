import * as React from "react";
import { useEffect, useState } from "react";
// Remove SharePoint imports (spfi, SPFI, SPFx)

interface OpportunityDetailsTableProps {
  salesRecords: any[]; // Changed prop
}

const OpportunityDetailsTable: React.FC<OpportunityDetailsTableProps> = ({ salesRecords }) => {
  const [data, setData] = useState<any[]>([]);
  // Remove spfi initialization

  useEffect(() => {
    setData(salesRecords); // The data is already filtered, just set it
  }, [salesRecords]); // Re-run when salesRecords change


  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB"); // DD/MM/YYYY
  };

  return (
    <div style={{ marginTop: 24 }}>
      <h4 style={{ fontWeight: 400, fontSize: 15, color: "#555" }}>
        Opportunity Details
      </h4>
      <div style={{
        maxHeight: 400,
        overflowY: "auto",
        border: "1px solid #ddd",
        borderRadius: 4
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ position: "sticky", top: 0, background: "#f6f8fa", zIndex: 1 }}>
            <tr>
              <th style={thStyle}>Customer</th>
              <th style={thStyle}>Opportunity Name</th>
              <th style={thStyle}>Size (€)</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Start Date</th>
              <th style={thStyle}>Decision Date</th>
              <th style={thStyle}>Report Date</th>
              <th style={thStyle}>Title</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: "1px solid #eee" }}>
                <td style={tdStyle}>{item.Customer || "-"}</td>
                <td style={tdStyle}>{item.OpportunityID || "-"}</td>
                <td style={tdStyle}>{item.OppAmount ? `€ ${Number(item.OppAmount).toLocaleString()}` : "-"}</td>
                <td style={tdStyle}>{item.OpportunityStatus || "-"}</td>
                <td style={tdStyle}>{formatDate(item.TentativeStartDate)}</td>
                <td style={tdStyle}>{formatDate(item.TentativeDecisionDate)}</td>
                <td style={tdStyle}>{formatDate(item.ReportDate)}</td>
                <td style={tdStyle}>{item.Title || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "8px",
  borderBottom: "1px solid #ccc",
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "8px",
  whiteSpace: "nowrap",
  fontSize: "14px"
};

export default OpportunityDetailsTable;