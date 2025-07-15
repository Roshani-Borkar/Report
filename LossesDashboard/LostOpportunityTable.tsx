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

interface LostOpportunityTableProps {
  context: any;
  startDate?: Date | null;
  endDate?: Date | null;
  customers?: string[];
}

const LostOpportunityTable: React.FC<LostOpportunityTableProps> = ({
  context,
  customers = [],
  startDate,
  endDate
}) => {
  const [data, setData] = useState<any[]>([]);
  const sp: SPFI = spfi().using(SPFx(context));

  useEffect(() => {
    async function fetchData() {
      const list = sp.web.lists
        .getByTitle("CWSalesRecords")
        .items.select(
          "Customer",
          "OpportunityID",
          "OppAmount",
          "OpportunityStatus",
          "TentativeStartDate",
          "TentativeDecisionDate",
          "ReportDate",
          "Title"
        );

      const filters: string[] = ["OpportunityStatus eq 'Lost'"];


      if (customers.length > 0) {
        const customerFilter = customers
          .map(c => `Customer eq '${c.replace(/'/g, "''")}'`)
          .join(" or ");
        filters.push(`(${customerFilter})`);
      }

      if (startDate) filters.push(`ReportDate ge '${startDate.toISOString()}'`);
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        filters.push(`ReportDate le '${endOfDay.toISOString()}'`);
      }

      const items = await list.filter(filters.join(" and "))();
      setData(items);
    }

    fetchData();
  }, [context, customers, startDate, endDate]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB");
  };

  return (
    <div style={{ marginTop: 24 }}>
      <h4 style={{ fontWeight: 400, fontSize: 15, color: "#2e7d32" }}>
        Lost Opportunities
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

export default LostOpportunityTable;
