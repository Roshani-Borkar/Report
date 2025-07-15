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
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, LabelList, Cell,
} from "recharts";
import { spfi, SPFI } from "@pnp/sp";
import { SPFx } from "@pnp/sp/presets/all";

// Optionally: assign a color for the most frequent status per customer
const statusColors: Record<string, string> = {
  "Open": "#ffc107",       // yellow
  "On Hold": "#FF5F1F",    // gold/orange
  "Won": "#8bc34a",        // green
  "Lost": "#e3242b",       // red
};

interface ICustomerOpportunityCountChartProps {
  context: any;
  customers?: string[];
  startDate?: Date | null;
  endDate?: Date | null;
}

const CustomerOpportunityCountChart: React.FC<ICustomerOpportunityCountChartProps> = ({ context, customers = [], startDate, endDate }) => {
  const [data, setData] = useState<any[]>([]);
  const sp: SPFI = spfi().using(SPFx(context));

  useEffect(() => {
    async function fetchData() {
      // NOTE: This query uses the 'ReportDate' column for date filtering.
      // Please ensure 'ReportDate' is the correct internal name of your date column.
      const list = sp.web.lists.getByTitle("CWSalesRecords").items.select("Customer", "OpportunityStatus", "ReportDate");

      const filters: string[] = [];
      if (customers.length > 0) {
        const customerFilter = customers.map(c => `Customer eq '${c.replace(/'/g, "''")}'`).join(' or ');
        filters.push(`(${customerFilter})`);
      }
      if (startDate) {
        filters.push(`ReportDate ge '${startDate.toISOString()}'`);
      }
      if (endDate) {
        // To include the entire end day, set time to 23:59:59
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        filters.push(`ReportDate le '${endOfDay.toISOString()}'`);
      }

      let items;
      if (filters.length > 0) {
        items = await list.filter(filters.join(' and '))();
      } else {
        items = await list();
      }

      // Group by Customer, count opportunities, and find most frequent status for coloring
      const grouped: Record<string, { Customer: string, count: number, mainStatus: string }> = {};
      const statusCount: Record<string, Record<string, number>> = {};

      items.forEach((item: any) => {
        const customer = item.Customer || "Unknown";
        const status = item.OpportunityStatus || "Unknown";
        if (!grouped[customer]) {
          grouped[customer] = { Customer: customer, count: 0, mainStatus: status };
          statusCount[customer] = {};
        }
        grouped[customer].count += 1;
        statusCount[customer][status] = (statusCount[customer][status] || 0) + 1;
      });

      // Determine the most frequent status for each customer
      Object.keys(grouped).forEach(customer => {
        const counts = statusCount[customer];
        const mainStatus = Object.keys(counts).reduce((a, b) =>
          counts[a] > counts[b] ? a : b
        );
        grouped[customer].mainStatus = mainStatus;
      });

      // Convert to array, sort by count descending
      const chartRows = Object.values(grouped).sort((a, b) => b.count - a.count);

      setData(chartRows);
    }
     fetchData();
  }, [context, customers, startDate, endDate]);

  return (
    <div>
      <h4 style={{ color: "#888", fontWeight: 400, fontSize: 15, marginBottom: 8 }}>
        Opportunity Count by Customer
      </h4>
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
              <XAxis type="number" />
              <YAxis type="category" dataKey="Customer" width={200} />
              <Tooltip />
              <Bar dataKey="count" isAnimationActive={false}>
                <LabelList dataKey="count" position="right" />
                {data.map((entry) => (
                  <Cell
                    key={`cell-${entry.Customer}`}
                    fill={statusColors[entry.mainStatus] || "#aaa"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default CustomerOpportunityCountChart;