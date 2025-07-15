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

interface OpportunitySizeTableProps {
  context: any;
  startDate?: Date | null;
  endDate?: Date | null;
}

const OpportunitySizeTable: React.FC<OpportunitySizeTableProps> = ({ context, startDate, endDate }) => {
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const sp: SPFI = spfi().using(SPFx(context));

  useEffect(() => {
    async function fetchData() {
      const list = sp.web.lists.getByTitle("CWSalesRecords").items.select("OpportunityID", "OppAmount", "ReportDate");

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

      setData(items);

      // Calculate total OppAmount
      const totalAmount = items.reduce((sum, item) => sum + (Number(item.OppAmount) || 0), 0);
      setTotal(totalAmount);
    }

    fetchData();
  }, [context, startDate, endDate]);

  return (
    <div style={{ marginTop: 24 }}>
      <h4 style={{ fontWeight: 400, fontSize: 15, color: "#555" }}>
        Opportunity Size Table
      </h4>

      {/* Table container with scroll */}
      <div style={{
        maxHeight: 600,
        overflowY: "auto",
        border: "1px solid #ddd",
        borderRadius: 4
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ position: "sticky", top: 0, background: "#f6f8fa", zIndex: 1 }}>
            <tr>
              <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #ddd" }}>Opportunity Name</th>
              <th style={{ textAlign: "right", padding: 8, borderBottom: "1px solid #ddd" }}>Opportunity Size (€)</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: 8 }}>{item.OpportunityID || "(No Name)"}</td>
                <td style={{ padding: 8, textAlign: "right" }}>
                  {item.OppAmount ? `€ ${Number(item.OppAmount).toLocaleString()}` : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Total row */}
      <div style={{
        padding: "8px 0",
        borderTop: "1px solid #ddd",
        fontWeight: 500,
        textAlign: "right",
        marginTop: 8
      }}>
        Total: € {total.toLocaleString()}
      </div>
    </div>
  );
};

export default OpportunitySizeTable;
