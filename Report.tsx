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

import CustomerOpportunityStatusChart from "./CurrentDashboard/CustomerOpportunityStatusChart";
import CustomerOpportunityCountChart from "./CurrentDashboard/CustomerOpportunityCountChart";
import { FilterPanel } from "./FilterPanel";
import OpportunityDetailsTable from "./CurrentDashboard/OpportunityDetailsTable";
import OpportunitySizeByStatusChart from "./OverallDashboard/OpportunitySizeByStatusChart";
import OpportunityCountByStatusChart from "./OverallDashboard/OpportunityCountByStatusChart";
import OpportunitySizeTable from "./OverallDashboard/OpportunitySizeTable";
import OpportunitySummaryCard from "./CurrentDashboard/OpportunitySummaryCard";
import BusinessWonChart from "./WinningsDashboard/BusinessWonChart";
import BusinessWonByQuarterChart from "./WinningsDashboard/BusinessWonByQuarterChart";
import BusinessLostChart from "./LossesDashboard/BusinessLostChart";
import BusinessLostByQuarterChart from "./LossesDashboard/BusinessLostByQuarterChart";
import WinningOpportunityCard from "./WinningsDashboard/WinningOpportunityCard";
import LostOpportunityCard from "./LossesDashboard/LostOpportunityCard";
import LostOpportunityTable from "./LossesDashboard/LostOpportunityTable";
import WonOpportunityTable from "./WinningsDashboard/WonOpportunityTable";

import CustomerOpportunitySizeByStatusChart from "./Dashboard/CustomerOpportunitySizeByStatusChart";
import CustomerOpportunityCountByStatusChart from "./Dashboard/CustomerOpportunityCountByStatusChart";
import SideBySideWonLostChart from "./Dashboard/SideBySideWonLostChart";

const Report: React.FC<{ context: any }> = ({ context }) => {
  const [customers, setCustomers] = useState<string[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date | null | undefined>(null);
  const [endDate, setEndDate] = useState<Date | null | undefined>(null);
  const [tableData, setTableData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>("Current");

  const sp: SPFI = spfi().using(SPFx(context));

  const tabs = ["Current", "Overall", "Dashboard", "Winnings", "Losses"];

  useEffect(() => {
    async function fetchCustomers() {
      const items = await sp.web.lists.getByTitle("CWSalesRecords").items.select("Customer")();
      const uniqueCustomers = Array.from(new Set(items.map((item: any) => item.Customer || "Unknown"))).sort();
      setCustomers(uniqueCustomers);
    }
    fetchCustomers();
  }, [context]);

  const chartCustomers = selectedCustomers.includes("all") || selectedCustomers.length === 0
    ? []
    : selectedCustomers.filter(c => c !== "all" && c !== "(Blank)");

  useEffect(() => {
    async function fetchTableData() {
      const list = sp.web.lists.getByTitle("CWSalesRecords").items.select(
        "Customer", "Title", "OppAmount", "OpportunityStatus", "ReportDate"
      );

      const filters: string[] = [];

      if (chartCustomers.length > 0) {
        const customerFilter = chartCustomers.map(c => `Customer eq '${c.replace(/'/g, "''")}'`).join(" or ");
        filters.push(`(${customerFilter})`);
      }

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

      setTableData(items);
    }

    fetchTableData();
  }, [chartCustomers, startDate, endDate, sp]);

  return (
    <div style={{ height: "100%", width: "100%", overflow: "hidden" }}>
      {/* Tabs UI */}
      <div style={{ display: "flex", borderBottom: "1px solid #ccc" }}>
        {tabs.map(tab => (
          <div
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "10px 16px",
              cursor: "pointer",
              borderBottom: activeTab === tab ? "3px solid #00796b" : "3px solid transparent",
              fontWeight: activeTab === tab ? "bold" : "normal",
              color: activeTab === tab ? "#00796b" : "#333"
            }}
          >
            {tab}
          </div>
        ))}
      </div>

      {/* ✅ Scrollable content wrapper */}
      <div
        style={{
          height: "calc(100vh - 50px)", // adjust based on your header height
          overflowY: "auto",
          padding: "16px",
          boxSizing: "border-box",
        }}
      >

        {/* Content per tab */}
        {activeTab === "Current" && (
          <>
            {/* Header Centered + KPI Summary Below */}
            <div style={{ textAlign: "center", marginBottom: 8 }}>
              <h3 style={{ fontSize: 20, color: "#333", margin: 0 }}>
                Current Opportunity Overview
              </h3>
            </div>

            {/* KPI Summary Cards */}
            <div style={{
              display: "flex",
              gap: "16px",
              justifyContent: "center",
              flexWrap: "wrap",
              marginBottom: 24
            }}>
              <div style={{ flex: 1 }}>
                <OpportunitySummaryCard
                  context={context}
                  startDate={startDate}
                  endDate={endDate}
                  showProbable={true} // Show probable amount 
                />
              </div>
            </div>
            {/* Chart Layout: Left and Right */}
            <div style={{
              display: "flex",
              gap: "32px",
              flexWrap: "wrap",
              marginBottom: 32
            }}>
              <div style={{ flex: 1, minWidth: "400px" }}>
                <CustomerOpportunityStatusChart
                  context={context}
                  customers={chartCustomers}
                  startDate={startDate}
                  endDate={endDate}
                />
              </div>
              <div style={{ flex: 1, minWidth: "400px" }}>
                <CustomerOpportunityCountChart
                  context={context}
                  customers={chartCustomers}
                  startDate={startDate}
                  endDate={endDate}
                />
              </div>
            </div>
            {/* Filter Panel */}
            <FilterPanel
              customers={customers}
              selectedCustomers={selectedCustomers}
              setSelectedCustomers={setSelectedCustomers}
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
            />
            {/* Table */}
            <div style={{ marginBottom: 32 }}>
              <OpportunityDetailsTable
                context={context}
                customers={chartCustomers}
                startDate={startDate}
                endDate={endDate}
              />
            </div>


          </>
        )}


        {
          activeTab === "Overall" && (
            <>
              {/* Heading */}
              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <h3 style={{ fontSize: 20, color: "#333", margin: 0 }}>
                  Overall Opportunity Overview
                </h3>
              </div>

              <div style={{ display: "flex", width: "100%", gap: "24px", alignItems: "flex-start" }}>
                {/* Left 3/4: Charts */}
                <div style={{ flex: 3, display: "flex", flexDirection: "column", gap: "32px" }}>
                  <OpportunitySizeByStatusChart
                    context={context}
                    startDate={startDate}
                    endDate={endDate}
                  />

                  <OpportunityCountByStatusChart
                    context={context}
                    startDate={startDate}
                    endDate={endDate}
                  />
                </div>
                <div style={{ 
                  flex: 1, 
                  display: "flex", 
                  flexDirection: "column", 
                  gap: "16px",
                  paddingRight: "16px" // Add right padding to prevent touching screen edge
                }}>
                  <OpportunitySummaryCard
                    context={context}
                    startDate={startDate}
                    endDate={endDate}
                  />

                  <OpportunitySizeTable
                    context={context}
                    startDate={startDate}
                    endDate={endDate}
                  />
                </div>
              </div>

              <FilterPanel
                customers={customers}
                selectedCustomers={selectedCustomers}
                setSelectedCustomers={setSelectedCustomers}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
                hideCustomerFilter={true}
              />
            </>
          )
        }
        {
          activeTab === "Winnings" && (
            <>
              {/* Heading */}
              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <h3 style={{ fontSize: 20, color: "#333", margin: 0 }}>
                  Winnings Opportunity Overview
                </h3>
              </div>

              <div style={{ display: "flex", width: "100%", gap: "24px", alignItems: "flex-start" }}>
                {/* Left 3/4: Charts */}
                <div style={{ flex: 3, display: "flex", flexDirection: "column", gap: "32px" }}>
                  <BusinessWonChart
                    context={context}
                    customers={chartCustomers}
                    startDate={startDate}
                    endDate={endDate}
                  />

                </div>
                <div style={{ flex: 1 }}>
                  <WinningOpportunityCard
                    context={context}
                    customers={chartCustomers}
                    startDate={startDate}
                    endDate={endDate}
                  />

                  <BusinessWonByQuarterChart
                    context={context}
                    customers={chartCustomers}
                    startDate={startDate}
                    endDate={endDate}
                  />
                </div>
              </div>
              <FilterPanel
                customers={customers}
                selectedCustomers={selectedCustomers}
                setSelectedCustomers={setSelectedCustomers}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
              />
              <div style={{ marginBottom: 32 }}>
                <WonOpportunityTable
                  context={context}
                  customers={chartCustomers}
                  startDate={startDate}
                  endDate={endDate}
                />
              </div>

            </>
          )
        }
        {
          activeTab === "Losses" && (
            <>
              {/* Heading */}
              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <h3 style={{ fontSize: 20, color: "#333", margin: 0 }}>
                  Losses Opportunity Overview
                </h3>
              </div>

              <div style={{ display: "flex", width: "100%", gap: "24px", alignItems: "flex-start" }}>
                {/* Left 3/4: Charts */}
                <div style={{ flex: 3, display: "flex", flexDirection: "column", gap: "32px" }}>
                  <BusinessLostChart
                    context={context}
                    customers={chartCustomers}
                    startDate={startDate}
                    endDate={endDate}
                  />

                </div>
                <div style={{ flex: 1 }}>
                  <LostOpportunityCard
                    context={context}
                    customers={chartCustomers}
                    startDate={startDate}
                    endDate={endDate}
                  />

                  <BusinessLostByQuarterChart
                    context={context}
                    customers={chartCustomers}
                    startDate={startDate}
                    endDate={endDate}
                  />
                </div>
              </div>
              <FilterPanel
                customers={customers}
                selectedCustomers={selectedCustomers}
                setSelectedCustomers={setSelectedCustomers}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
              />
              <div style={{ marginBottom: 32 }}>
                <LostOpportunityTable
                  context={context}
                  customers={chartCustomers}
                  startDate={startDate}
                  endDate={endDate}
                />
              </div>

            </>
          )
        }
        {activeTab === "Dashboard" && (
          <>
            {/* Header Centered + KPI Summary Below */}
            <div style={{ textAlign: "center", marginBottom: 8 }}>
              <h3 style={{ fontSize: 20, color: "#333", margin: 0 }}>
                Dashboard Opportunity Overview
              </h3>
            </div>

            {/* KPI Summary Cards */}
            <div style={{
              display: "flex",
              gap: "16px",
              justifyContent: "center",
              flexWrap: "wrap",
              marginBottom: 24
            }}>
              <div style={{ flex: 1 }}>
                <WinningOpportunityCard
                  context={context}
                  startDate={startDate}
                  endDate={endDate}
                />
              </div>
              <div style={{ flex: 1 }}>
                <LostOpportunityCard
                  context={context}
                  startDate={startDate}
                  endDate={endDate}
                />
              </div>
            </div>
            {/* Chart Layout: Left and Right */}
            <div style={{
              display: "flex",
              gap: "32px",
              flexWrap: "wrap",
              marginBottom: 32
            }}>
              <div style={{ flex: 1, minWidth: "400px" }}>
                <CustomerOpportunitySizeByStatusChart
                  context={context}
                  customers={chartCustomers}
                  startDate={startDate}
                  endDate={endDate}
                />
              </div>
              <div style={{ flex: 1, minWidth: "400px" }}>
                <CustomerOpportunityCountByStatusChart
                  context={context}
                  customers={chartCustomers}
                  startDate={startDate}
                  endDate={endDate}
                />
              </div>
            </div>
            <div style={{ flex: 1, minWidth: "400px" }}>
              <SideBySideWonLostChart
                context={context}
                customers={chartCustomers}
                startDate={startDate}
                endDate={endDate}
              />
            </div>
            {/* Filter Panel */}
            <FilterPanel
              customers={customers}
              selectedCustomers={selectedCustomers}
              setSelectedCustomers={setSelectedCustomers}
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
            />

          </>
        )}
      </div >
    </div>
  );
}
export default Report;

