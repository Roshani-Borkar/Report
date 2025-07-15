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
import {
  Dropdown,
  IDropdownOption,
  IDropdownStyles,
  DatePicker,
  IDatePickerStrings,
  DefaultButton,
  PrimaryButton,
} from "@fluentui/react";

// Period options with separators
const periodOptions: IDropdownOption[] = [
  { key: "all", text: "All" },
  { key: "divider-week", text: "─────────────────", itemType: 0, disabled: true }, // Visual separator
  { key: "week_till_date", text: "Week till date" },
  { key: "last_week", text: "Last Week" },
  { key: "divider-month", text: "─────────────────", itemType: 0, disabled: true }, // Visual separator
  { key: "month_till_date", text: "Month till date" },
  { key: "current_month", text: "Current Month" },
  { key: "last_month", text: "Last Month" },
  { key: "divider-year", text: "─────────────────", itemType: 0, disabled: true }, // Visual separator
  { key: "year_till_date", text: "Year till date" },
  { key: "current_year", text: "Current Year" },
  { key: "last_year", text: "Last Year" },
];

const getDropdownOptions = (customers: string[]): IDropdownOption[] => [
  { key: "all", text: "All" },
  { key: "(Blank)", text: "(Blank)" },
  ...customers.filter((c) => c && c.trim() !== "").map((c) => ({ key: c, text: c })),
];

const dropdownStyles: Partial<IDropdownStyles> = {
  dropdown: { width: "100%" },
  root: { flex: 1, minWidth: 15, maxWidth: 200 },
  callout: {
    selectors: {
      '.ms-Dropdown-item': {
        minHeight: '32px',
      },
      '.ms-Dropdown-item[data-is-focusable="false"]': {
        minHeight: '8px',
        padding: '0 8px',
        fontSize: '12px',
        color: '#666',
        cursor: 'default',
        textAlign: 'center' as const,
      }
    }
  }
};

const datePickerStyles = {
  root: { flex: 1, minWidth: 150, maxWidth: 200 },
};

const DayPickerStrings: IDatePickerStrings = {
  months: [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ],
  shortMonths: [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ],
  days: [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
  ],
  shortDays: ["S", "M", "T", "W", "T", "F", "S"],
  goToToday: "Go to today",
  prevMonthAriaLabel: "Go to previous month",
  nextMonthAriaLabel: "Go to next month",
  prevYearAriaLabel: "Go to previous year",
  nextYearAriaLabel: "Go to next year",
  closeButtonAriaLabel: "Close date picker",
};

// Helper functions for date calculations
// Get Monday of the current week
function getStartOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  // If day is Sunday (0), start from previous Monday (-6)
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Get Sunday of the current week
function getEndOfWeek(date: Date) {
  const startOfWeek = getStartOfWeek(date);
  const d = new Date(startOfWeek);
  d.setDate(startOfWeek.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
}
function getStartOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}
function getEndOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}
function getStartOfQuarter(date: Date) {
  const quarter = Math.floor(date.getMonth() / 3);
  return new Date(date.getFullYear(), quarter * 3, 1, 0, 0, 0, 0);
}
function getEndOfQuarter(date: Date) {
  const quarter = Math.floor(date.getMonth() / 3);
  return new Date(date.getFullYear(), quarter * 3 + 3, 0, 23, 59, 59, 999);
}
function getStartOfYear(date: Date) {
  return new Date(date.getFullYear(), 0, 1, 0, 0, 0, 0);
}
function getEndOfYear(date: Date) {
  return new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999);
}
function getPeriodDates(key: string): { startDate: Date | null; endDate: Date | null } {
  const now = new Date();
  switch (key) {
    case "week_till_date":
      return { startDate: getStartOfWeek(now), endDate: now };
    case "last_week": {
      const lastWeekEnd = getStartOfWeek(now);
      const lastWeekStart = new Date(lastWeekEnd);
      lastWeekStart.setDate(lastWeekEnd.getDate() - 7);
      lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);
      return { startDate: lastWeekStart, endDate: lastWeekEnd };
    }
    case "month_till_date":
      return { startDate: getStartOfMonth(now), endDate: now };
    case "last_month": {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return {
        startDate: getStartOfMonth(lastMonth),
        endDate: getEndOfMonth(lastMonth),
      };
    }
    case "current_month":
      return {
        startDate: getStartOfMonth(now),
        endDate: getEndOfMonth(now),
      };
    case "current_year":
      return {
        startDate: getStartOfYear(now),
        endDate: getEndOfYear(now),
      };
    case "year_till_date":
      return {
        startDate: getStartOfYear(now),
        endDate: now,
      };
    case "last_year": {
      const lastYear = new Date(now.getFullYear() - 1, 0, 1);
      return {
        startDate: getStartOfYear(lastYear),
        endDate: getEndOfYear(lastYear),
      };
    }
    case "all":
    default:
      return { startDate: null, endDate: null };
  }
}

export const FilterPanel: React.FC<{
  customers: string[];
  selectedCustomers: string[];
  setSelectedCustomers: (val: string[]) => void;
  startDate?: Date | null;
  setStartDate: (date: Date | null | undefined) => void;
  endDate?: Date | null;
  setEndDate: (date: Date | null | undefined) => void;
  hideCustomerFilter?: boolean;
  onApplyFilter?: () => void; // New callback for apply filter
}> = ({
  customers,
  selectedCustomers,
  setSelectedCustomers,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  hideCustomerFilter = false,
  onApplyFilter,
}) => {
  const options = getDropdownOptions(customers);

  // Local state for temporary filter values
  const [tempSelectedCustomers, setTempSelectedCustomers] = React.useState<string[]>(selectedCustomers);
  const [tempStartDate, setTempStartDate] = React.useState<Date | null>(startDate || null);
  const [tempEndDate, setTempEndDate] = React.useState<Date | null>(endDate || null);
  const [tempSelectedPeriod, setTempSelectedPeriod] = React.useState<string>("all");

  // Update local state when props change
  React.useEffect(() => {
    setTempSelectedCustomers(selectedCustomers);
  }, [selectedCustomers]);

  React.useEffect(() => {
    setTempStartDate(startDate || null);
  }, [startDate]);

  React.useEffect(() => {
    setTempEndDate(endDate || null);
  }, [endDate]);

  // Period dropdown handler
  const handlePeriodChange = (
    event: React.FormEvent<HTMLDivElement>,
    option?: IDropdownOption
  ) => {
    if (!option) return;
    
    // Prevent selection of dividers (disabled items)
    if (option.disabled || String(option.key).startsWith('divider-')) {
      return;
    }
    
    setTempSelectedPeriod(option.key as string);
    const { startDate, endDate } = getPeriodDates(option.key as string);
    setTempStartDate(startDate);
    setTempEndDate(endDate);
  };

  // Customer dropdown handler
  const handleDropdownChange = (
    event: React.FormEvent<HTMLDivElement>,
    option?: IDropdownOption
  ) => {
    if (!option) return;

    if (String(option.key) === "all") {
      if (option.selected) {
        setTempSelectedCustomers(
          options.filter((o) => o.key !== "all").map((o) => String(o.key))
        );
      } else {
        setTempSelectedCustomers([]);
      }
    } else {
      let newSelected = [...tempSelectedCustomers];
      if (option.selected) {
        newSelected.push(String(option.key));
      } else {
        newSelected = newSelected.filter((k) => k !== String(option.key));
      }
      const otherKeys = options.filter((o) => o.key !== "all").map((o) => String(o.key));
      if (otherKeys.every((k) => newSelected.includes(k))) {
        newSelected = ["all", ...otherKeys];
      } else {
        newSelected = newSelected.filter((k) => k !== "all");
      }
      setTempSelectedCustomers(newSelected);
    }
  };

  // Apply filter handler
  const handleApplyFilter = () => {
    setSelectedCustomers(tempSelectedCustomers);
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    onApplyFilter?.();
  };

  // Clear filter handler
  const handleClearFilter = () => {
    // Clear temporary state
    setTempSelectedCustomers([]);
    setTempStartDate(null);
    setTempEndDate(null);
    setTempSelectedPeriod("all");
    
    // Immediately apply the cleared state
    setSelectedCustomers([]);
    setStartDate(null);
    setEndDate(null);
    onApplyFilter?.();
  };

  // Check if there are any filters applied to enable/disable clear button
  const hasFilters = React.useMemo(() => {
    const hasCustomerFilter = selectedCustomers.length > 0;
    const hasDateFilter = startDate || endDate;
    return hasCustomerFilter || hasDateFilter;
  }, [selectedCustomers, startDate, endDate]);
  // Check if there are any changes to enable/disable apply button
  const hasChanges = React.useMemo(() => {
    const customersChanged = JSON.stringify(tempSelectedCustomers.sort()) !== JSON.stringify(selectedCustomers.sort());
    const startDateChanged = tempStartDate?.getTime() !== startDate?.getTime();
    const endDateChanged = tempEndDate?.getTime() !== endDate?.getTime();
    return customersChanged || startDateChanged || endDateChanged;
  }, [tempSelectedCustomers, selectedCustomers, tempStartDate, startDate, tempEndDate, endDate]);

  return (
    <div
      style={{
        background: "#f6f8fa",
        borderRadius: 8,
        padding: 24,
        boxShadow: "0 2px 8px #0001",
        display: "flex",
        flexDirection: "row",
        gap: 20,
        alignItems: "flex-start",
        flexWrap: "nowrap",
      }}
    >
      {!hideCustomerFilter && (
        <div style={{ minWidth: 180 }}>
          <Dropdown
            placeholder="Select customers..."
            label="Customer"
            multiSelect
            selectedKeys={tempSelectedCustomers.length === 0 ? [] : tempSelectedCustomers}
            options={getDropdownOptions(customers)}
            onChange={handleDropdownChange}
            styles={dropdownStyles}
          />
        </div>
      )}

      <div style={{ minWidth: 220 }}>
        <Dropdown
          placeholder="Select period..."
          label="Period"
          selectedKey={tempSelectedPeriod}
          options={periodOptions}
          onChange={handlePeriodChange}
          styles={dropdownStyles}
        />
      </div>
      
      <div style={{ minWidth: 200 }}>
        <DatePicker
          label="Start Date"
          styles={datePickerStyles}
          strings={DayPickerStrings}
          placeholder="Select a start date..."
          ariaLabel="Select a start date"
          value={tempStartDate ?? undefined}
          onSelectDate={setTempStartDate}
          allowTextInput
        />
      </div>
      
      <div style={{ minWidth: 200 }}>
        <DatePicker
          label="End Date"
          styles={datePickerStyles}
          strings={DayPickerStrings}
          placeholder="Select an end date..."
          ariaLabel="Select an end date"
          value={tempEndDate ?? undefined}
          onSelectDate={setTempEndDate}
          allowTextInput
        />
      </div>
      
      <div style={{ alignSelf: "end", minWidth: 130 }}>
        <DefaultButton
          text="Clear Filter"
          onClick={handleClearFilter}
          disabled={!hasFilters}
        />
      </div>
      
      <div style={{ alignSelf: "end", minWidth: 120 }}>
        <PrimaryButton
          text="Apply Filter"
          onClick={handleApplyFilter}
          disabled={!hasChanges}
        />
      </div>
    </div>
  );
};