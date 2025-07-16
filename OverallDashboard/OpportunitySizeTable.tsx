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

interface OpportunitySizeTableProps {
  salesRecords: any[]; // NEW PROP
  // REMOVE: context: any;
  // REMOVE: startDate?: Date | null;
  // REMOVE: endDate?: Date | null;
}

const OpportunitySizeTable: React.FC<OpportunitySizeTableProps> = ({ salesRecords }) => { // Update destructuring
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  // REMOVE: const sp: SPFI = spfi().using(SPFx(context));

  useEffect(() => {
    // Data is already filtered by Report.tsx, just set it
    setData(salesRecords);

    // Calculate total OppAmount from the passed salesRecords
    const totalAmount = salesRecords.reduce((sum, item) => sum + (Number(item.OppAmount) || 0), 0);
    setTotal(totalAmount);
  }, [salesRecords]); // Depend on salesRecords prop

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