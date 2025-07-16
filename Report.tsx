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
import { useEffect, useState, useMemo } from "react";
import { spfi, SPFI } from "@pnp/sp";
import { SPFx } from "@pnp/sp/presets/all";

// Current Dashboard components
import CustomerOpportunityStatusChart from "./CurrentDashboard/CustomerOpportunityStatusChart";
import CustomerOpportunityCountChart from "./CurrentDashboard/CustomerOpportunityCountChart";
import OpportunityDetailsTable from "./CurrentDashboard/OpportunityDetailsTable";
import OpportunitySummaryCard from "./CurrentDashboard/OpportunitySummaryCard";

// Overall Dashboard components
import OpportunitySizeByStatusChart from "./OverallDashboard/OpportunitySizeByStatusChart";
import OpportunityCountByStatusChart from "./OverallDashboard/OpportunityCountByStatusChart";
import OpportunitySizeTable from "./OverallDashboard/OpportunitySizeTable";

// Winnings Dashboard components
import BusinessWonChart from "./WinningsDashboard/BusinessWonChart";
import BusinessWonByQuarterChart from "./WinningsDashboard/BusinessWonByQuarterChart";
import WinningOpportunityCard from "./WinningsDashboard/WinningOpportunityCard";
import WonOpportunityTable from "./WinningsDashboard/WonOpportunityTable";

// Losses Dashboard components
import BusinessLostChart from "./LossesDashboard/BusinessLostChart";
import BusinessLostByQuarterChart from "./LossesDashboard/BusinessLostByQuarterChart";
import LostOpportunityCard from "./LossesDashboard/LostOpportunityCard";
import LostOpportunityTable from "./LossesDashboard/LostOpportunityTable";

// Dashboard (combined metrics) components
import CustomerOpportunitySizeByStatusChart from "./Dashboard/CustomerOpportunitySizeByStatusChart";
import CustomerOpportunityCountByStatusChart from "./Dashboard/CustomerOpportunityCountByStatusChart";
import SideBySideWonLostChart from "./Dashboard/SideBySideWonLostChart";

// Filter Panel
import { FilterPanel } from "./FilterPanel";


const Report: React.FC<{ context: any }> = ({ context }) => {
  const [customers, setCustomers] = useState<string[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date | null | undefined>(null);
  const [endDate, setEndDate] = useState<Date | null | undefined>(null);
  const [activeTab, setActiveTab] = useState<string>("Current");

  const [allSalesRecords, setAllSalesRecords] = useState<any[]>([]);
  const [allSalesCustomers, setAllSalesCustomers] = useState<any[]>([]); // For CWSalesCustomer list
  const [allOpportunityStatuses, setAllOpportunityStatuses] = useState<any[]>([]); // For CWSalesOpportunityStatus list
  const [statusMap, setStatusMap] = useState<Record<string, number>>({});
  const [statusOrder, setStatusOrder] = useState<string[]>([]); // To maintain consistent order and colors

  const sp: SPFI = spfi().using(SPFx(context));

  const tabs = ["Current", "Overall", "Dashboard", "Winnings", "Losses"];

  useEffect(() => {
    async function fetchAllInitialData() {
      try {
        // Fetch all unique customers for the filter panel (from CWSalesRecords)
        const customerRecords = await sp.web.lists.getByTitle("CWSalesRecords").items.select("Customer")();
        const uniqueCustomers = Array.from(new Set(customerRecords.map((item: any) => item.Customer || "Unknown"))).sort();
        setCustomers(uniqueCustomers);

        // Fetch all sales records
        const salesRecords = await sp.web.lists.getByTitle("CWSalesRecords").items.select(
          "Customer", "OpportunityID", "OppAmount", "OpportunityStatus", "TentativeStartDate", "TentativeDecisionDate", "ReportDate", "Title"
        )();
        setAllSalesRecords(salesRecords);

        // Fetch CWSalesCustomer data (for mapping Customer ID to Account Name in some charts)
        const salesCustomers = await sp.web.lists.getByTitle("CWSalesCustomer").items.select("Title", "Account").top(4999)();
        setAllSalesCustomers(salesCustomers);

        // Fetch opportunity statuses and prepare status map and order
        const statusItems = await sp.web.lists.getByTitle("CWSalesOpportunityStatus").items.select("Title", "Percentage").orderBy("ID")();
        const newStatusMap: Record<string, number> = {};
        const newStatusOrder: string[] = [];
        statusItems.forEach((item: any) => {
          newStatusMap[item.Title] = Number(item.Percentage) || 0;
          newStatusOrder.push(item.Title);
        });
        setAllOpportunityStatuses(statusItems);
        setStatusMap(newStatusMap);
        setStatusOrder(newStatusOrder);

      } catch (error) {
        console.error("Error fetching initial data:", error);
        // Handle error appropriately, e.g., show an error message to the user
      }
    }
    fetchAllInitialData();
  }, [context]);

  // Memoize filtered sales records based on selected filters
  const filteredSalesRecords = useMemo(() => {
    let filtered = allSalesRecords;

    const currentChartCustomers = selectedCustomers.includes("all") || selectedCustomers.length === 0
      ? []
      : selectedCustomers.filter(c => c !== "all" && c !== "(Blank)");

    if (currentChartCustomers.length > 0) {
      filtered = filtered.filter(item =>
        currentChartCustomers.includes(item.Customer)
      );
    }

    if (startDate) {
      const startDateTime = startDate.getTime();
      filtered = filtered.filter(item => {
        const reportDate = item.ReportDate ? new Date(item.ReportDate).getTime() : null;
        return reportDate !== null && reportDate >= startDateTime;
      });
    }

    if (endDate) {
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      const endDateTime = endOfDay.getTime();
      filtered = filtered.filter(item => {
        const reportDate = item.ReportDate ? new Date(item.ReportDate).getTime() : null;
        return reportDate !== null && reportDate <= endDateTime;
      });
    }
    return filtered;
  }, [allSalesRecords, selectedCustomers, startDate, endDate]);

  // Generate status colors dynamically, based on fetched status order
  const statusColors = useMemo(() => {
    const generatedColors: Record<string, string> = {};
    const defaultPalette = [
      "#ffc107", "#FF5F1F", "#8bc34a", "#f44336",
      "#03a9f4", "#9c27b0", "#ff9800", "#607d8b", "#00bcd4", "#cddc39"
    ];
    statusOrder.forEach((status, index) => {
      generatedColors[status] = defaultPalette[index % defaultPalette.length];
    });
    return generatedColors;
  }, [statusOrder]);

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

      {/* Scrollable content wrapper */}
      <div
        style={{
          height: "calc(100vh - 50px)",
          overflowY: "auto",
          padding: "16px",
          boxSizing: "border-box",
        }}
      >
        {activeTab === "Current" && (
          <>
            <div style={{ textAlign: "center", marginBottom: 8 }}>
              <h3 style={{ fontSize: 20, color: "#333", margin: 0 }}>
                Current Opportunity Overview
              </h3>
            </div>
            <div style={{
              display: "flex",
              gap: "16px",
              justifyContent: "center",
              flexWrap: "wrap",
              marginBottom: 24
            }}>
              <div style={{ flex: 1 }}>
                <OpportunitySummaryCard
                  salesRecords={filteredSalesRecords}
                  statusMap={statusMap}
                  showProbable={true}
                />
              </div>
            </div>
            <div style={{
              display: "flex",
              gap: "32px",
              flexWrap: "wrap",
              marginBottom: 32
            }}>
              <div style={{ flex: 1, minWidth: "400px" }}>
                <CustomerOpportunityStatusChart
                  salesRecords={filteredSalesRecords}
                  statusOrder={statusOrder}
                  statusColors={statusColors}
                />
              </div>
              <div style={{ flex: 1, minWidth: "400px" }}>
                <CustomerOpportunityCountChart
                  salesRecords={filteredSalesRecords}
                  statusColors={statusColors}
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
              <OpportunityDetailsTable
                salesRecords={filteredSalesRecords}
              />
            </div>
          </>
        )}

        {activeTab === "Overall" && (
          <>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: 20, color: "#333", margin: 0 }}>
                Overall Opportunity Overview
              </h3>
            </div>

            <div style={{ display: "flex", width: "100%", gap: "24px", alignItems: "flex-start" }}>
              <div style={{ flex: 3, display: "flex", flexDirection: "column", gap: "32px" }}>
                <OpportunitySizeByStatusChart
                  salesRecords={filteredSalesRecords}
                  statusOrder={statusOrder}
                  statusColors={statusColors}
                />
                <OpportunityCountByStatusChart
                  salesRecords={filteredSalesRecords}
                  statusOrder={statusOrder}
                  statusColors={statusColors}
                />
              </div>
              <div style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                paddingRight: "16px"
              }}>
                <OpportunitySummaryCard
                  salesRecords={filteredSalesRecords}
                  statusMap={statusMap}
                />
                <OpportunitySizeTable
                  salesRecords={filteredSalesRecords}
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
        )}
        {
          activeTab === "Winnings" && (
            <>
              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <h3 style={{ fontSize: 20, color: "#333", margin: 0 }}>
                  Winnings Opportunity Overview
                </h3>
              </div>

              <div style={{ display: "flex", width: "100%", gap: "24px", alignItems: "flex-start" }}>
                <div style={{ flex: 3, display: "flex", flexDirection: "column", gap: "32px" }}>
                  <BusinessWonChart
                    salesRecords={filteredSalesRecords}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <WinningOpportunityCard
                    salesRecords={filteredSalesRecords}
                    statusMap={statusMap}
                  />
                  <BusinessWonByQuarterChart
                    salesRecords={filteredSalesRecords}
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
                  salesRecords={filteredSalesRecords}
                />
              </div>
            </>
          )
        }
        {
          activeTab === "Losses" && (
            <>
              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <h3 style={{ fontSize: 20, color: "#333", margin: 0 }}>
                  Losses Opportunity Overview
                </h3>
              </div>

              <div style={{ display: "flex", width: "100%", gap: "24px", alignItems: "flex-start" }}>
                <div style={{ flex: 3, display: "flex", flexDirection: "column", gap: "32px" }}>
                  <BusinessLostChart
                    salesRecords={filteredSalesRecords}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <LostOpportunityCard
                    salesRecords={filteredSalesRecords}
                    statusMap={statusMap}
                  />
                  <BusinessLostByQuarterChart
                    salesRecords={filteredSalesRecords}
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
                  salesRecords={filteredSalesRecords}
                />
              </div>
            </>
          )
        }
        {activeTab === "Dashboard" && (
          <>
            <div style={{ textAlign: "center", marginBottom: 8 }}>
              <h3 style={{ fontSize: 20, color: "#333", margin: 0 }}>
                Dashboard Opportunity Overview
              </h3>
            </div>

            <div style={{
              display: "flex",
              gap: "16px",
              justifyContent: "center",
              flexWrap: "wrap",
              marginBottom: 24
            }}>
              <div style={{ flex: 1 }}>
                <WinningOpportunityCard
                  salesRecords={filteredSalesRecords}
                  statusMap={statusMap}
                />
              </div>
              <div style={{ flex: 1 }}>
                <LostOpportunityCard
                  salesRecords={filteredSalesRecords}
                  statusMap={statusMap}
                />
              </div>
            </div>
            <div style={{
              display: "flex",
              gap: "32px",
              flexWrap: "wrap",
              marginBottom: 32
            }}>
              <div style={{ flex: 1, minWidth: "400px" }}>
                <CustomerOpportunitySizeByStatusChart
                  salesRecords={filteredSalesRecords}
                  salesCustomers={allSalesCustomers}
                  statusOrder={statusOrder}
                  statusColors={statusColors}
                />
              </div>
              <div style={{ flex: 1, minWidth: "400px" }}>
                <CustomerOpportunityCountByStatusChart
                  salesRecords={filteredSalesRecords}
                  salesCustomers={allSalesCustomers}
                  statusColors={statusColors}
                />
              </div>
            </div>
            <div style={{ flex: 1, minWidth: "400px" }}>
              <SideBySideWonLostChart
                salesRecords={filteredSalesRecords}
                salesCustomers={allSalesCustomers}
              />
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
          </>
        )}
      </div >
    </div>
  );
}
export default Report;
