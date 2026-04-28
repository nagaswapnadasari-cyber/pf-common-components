"use client";

import {
  ColumnDef,
  RowSelectionState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Text } from "../ui/text";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

import ClearAll from "../assets/ClearAll";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

import DropDown from "../assets/DropDown";
import { useTranslation } from "react-i18next";
import { debounce } from "lodash";
interface IBaseTable<TData, TValue> {
  /**
   * Columns defined for the table
   */
  columns: ColumnDef<TData, TValue>[];

  /**
   * Array of data objects to be displayed in the table
   */
  data: TData[];
  /**
   * Flag to enable Excel export selection logic (new logic)
   * @default false
   * @description This is a temporary prop introduced to facilitate migration from the legacy row selection approach
   * (rowSelection/setRowSelection) to the new Excel export selection logic (selectedIds, unselectedIds, selectAllParent).
   *
   * The legacy approach required useEffect hooks and added complexity for state synchronization. This flag allows gradual
   * migration: when true, uses the new approach with selectedIds, unselectedIds, selectAllParent, setSelectedIds,
   * setUnselectedIds, and setSelectAllParent; when false, uses legacy React Table selection logic
   * (rowSelection/setRowSelection).
   *
   * This prop will be removed once all usages are migrated from the legacy approach and rowSelection/setRowSelection
   * are fully deprecated . The new props (selectedIds, unselectedIds, selectAllParent,
   * setSelectedIds, setUnselectedIds, setSelectAllParent) are permanent replacements and will remain.
   */
  isExcelExport?: boolean;
  /**
   * Flag to indicate whether select all checkbox is checked (only used when isExcelExport is true)
   */
  selectAllParent?: boolean;
  /**
   * Array of selected ids (only used when isExcelExport is true)
   */
  selectedIds?: number[];
  /**
   * Array of unselected ids (only used when isExcelExport is true)
   */
  unselectedIds?: number[];
  /**
   * Function to update the selected ids
   */
  setSelectedIds?: (value: React.SetStateAction<number[]>) => void;
  /**
   * Function to update the unselected ids
   */
  setUnselectedIds?: (value: React.SetStateAction<number[]>) => void;
  /**
   * Function to update the select all parent
   */
  setSelectAllParent?: (value: React.SetStateAction<boolean>) => void;
  /**
   * Additional CSS classes to apply to the table
   */
  tableStyles?: {
    /**
     * Additional CSS classes to pass to the table container
     */
    table?: string;
    /**
     * Additional CSS classes to pass to each row
     */
    rowStyles?: string;
    /**
     * Additional CSS classes to pass to table container
     */
    tableContainer?: string;
    /**
     * Additional CSS classes to pass to table header
     */
    tableHeader?: string;
    /**
     * Additional Css classes to pass to each cell in the table header
     */
    tableHeaderCell?: string;
    /**
     * Additional Css classes to pass to each cell in the table body
     */
    tableBodyCell?: string;
  };
  /**
   * When there are no results then we have to show this placeholder
   */
  noRecordsPlaceholder?: string;
  /**

  /**
   * Function to update the current page number
   */
  setCurrent?: (value: React.SetStateAction<number>) => void;

  /**
   * The current page
   */
  current?: number;

  /**
   * Total number of pages
   */
  pageCount?: number;

  /**
   * Function to update the page size
   */
  setPageSize?: (value: React.SetStateAction<number>) => void;

  /**
   * Number of items to display per page
   */
  pageSize?: number;

  /**
   * Total number of items in the dataset
   */
  total?: number;

  /**
   * Flag to indicate whether pagination controls should be displayed
   */
  pagination?: boolean;

  /**
   * Flag to indicate whether checkboxes should be displayed
   */
  checkboxSelection?: boolean;

  /**
   * Flag to indicate whether sticky coulmns should be displayed
   */
  columnPinning?: boolean;

  /**
   * It is used to send the default columns to be selected
   */
  defaultColumns?: string[];

  /**
   * Row selection state
   * @deprecated Use selectedIds, unselectedIds, and selectAllParent instead (with isExcelExport flag enabled)
   * @description Previously we used rowSelection and setRowSelection, which required useEffect hooks and added complexity to manage state synchronization. The new approach uses: isExcelExport (enable new logic), selectedIds, unselectedIds, selectAllParent, setSelectedIds, setUnselectedIds, and setSelectAllParent which provides better control without the need for useEffect and reduces complexity.
   */
  rowSelection?: RowSelectionState;

  /**
   * Function to update the row selection state to track the selected rows
   * @deprecated Use setSelectedIds, setUnselectedIds, and setSelectAllParent instead (with isExcelExport flag enabled)
   * @description Previously we used rowSelection and setRowSelection, which required useEffect hooks and added complexity to manage state synchronization. The new approach uses: isExcelExport (enable new logic), selectedIds, unselectedIds, selectAllParent, setSelectedIds, setUnselectedIds, and setSelectAllParent which provides better control without the need for useEffect and reduces complexity.
   */
  setRowSelection?: (value: React.SetStateAction<RowSelectionState>) => void;
  /**
   * Flag to indicate whether the column selector need to be displayed or not
   */
  columnSelector?: boolean;

  setSorting?: any;

  sorting?: SortingState;

  /**
   * This variable is used to display the loader in middle of the page and while filtering ideally we dont need to click anything
   */
  isFiltering?: boolean;
  /**
   * This variable is used to disabled the horizontal scrolling.
   */
  noScroll?: boolean;

  /**
   * This variable is used pass action component if any. E.g: Bulk Actions in participant listing home page.
   */
  actionComponent?: React.ReactNode;

  /**
   * This variable is used to pass the columns preferences selected by the logged in user
   */
  userColumnPreferences?: { [key: string]: boolean } | null;

  tableContainerId?: string;

  /**
   * Function to update the columns selected and applied by the user
   */
  handleUserColumnPreferences?: (
    userColumnPreferences: { [key: string]: boolean } | null
  ) => void;

  /**
   * This is used to export the table for export excel and csv functionality
   */
  tableId?: string;
}

export function BaseTable<TData, TValue>({
  columns,
  data,
  tableStyles,
  current,
  setCurrent = () => {},
  pageCount,
  total = 0,
  setPageSize = () => {},
  pageSize = 0,
  pagination = false,
  checkboxSelection,
  columnPinning = false,
  defaultColumns = [],
  rowSelection,
  setRowSelection,
  columnSelector,
  sorting,
  setSorting,
  noRecordsPlaceholder = "No results",
  isFiltering = false,
  noScroll,
  actionComponent,
  userColumnPreferences,
  tableContainerId = "base-table-container",
  handleUserColumnPreferences,
  tableId = "",
  isExcelExport = false,
  selectAllParent = false,
  selectedIds = [],
  unselectedIds = [],
  setSelectedIds = () => {},
  setUnselectedIds = () => {},
  setSelectAllParent = () => {},
}: IBaseTable<TData, TValue>) {
  const { t } = useTranslation(["common", "course.find_course", "bx_v1"]);
  /**
   * Merges user column preferences with UI columns (UNION operation)
   * - Takes all keys from both UI columns and preferences
   * - If key exists in preferences: use preference value
   * - If key doesn't exist in preferences: default to true
   *
   * Examples:
   * - UI: 10, Preferences: null → Returns 10 columns (all true)
   * - UI: 12, Preferences: 10 → Returns 12 (10 from preferences + 2 new with true)
   * - UI: 7, Preferences: 12 → Returns 12 (7 from preferences if match UI, + 5 from preferences, missing UI columns default to true)
   */
  const mergeColumnsWithUserPreferences = (
    columns: any[],
    userPreferences: { [key: string]: boolean } | undefined
  ): { [key: string]: boolean } => {
    // Extract keys from columns (accessorKey)
    const columnKeys = columns
      .map((col) => col.accessorKey)
      .filter(Boolean) as string[];

    // Get all keys from preferences (if exists)
    const preferenceKeys = userPreferences ? Object.keys(userPreferences) : [];

    // Union: Combine all keys from both UI columns and preferences
    const allKeys = [...new Set([...columnKeys, ...preferenceKeys])];

    // For each key: use preference value if exists, otherwise default to true
    return allKeys.reduce(
      (acc, key) => {
        acc[key] = userPreferences?.hasOwnProperty(key)
          ? userPreferences[key]
          : true;
        return acc;
      },
      {} as Record<string, boolean>
    );
  };

  // Initial visibility state for column selector
  const initialColumnVisibilityChanges: { [key: string]: boolean } =
    columns.reduce(
      (acc: Record<string, boolean>, { accessorKey, enableHiding }: any) => {
        if (accessorKey) {
          // Determine initial visibility for the current column
          acc[accessorKey] =
            // If the defaultColumns array is empty or includes the current column's accessorKey, set visibility to true
            defaultColumns.length === 0 || defaultColumns.includes(accessorKey)
              ? true
              : // If enableHiding is true for the current column, set visibility to false, otherwise set it to true
                enableHiding
                ? false
                : true;
        }
        return acc;
      },
      {}
    );

  // Merge user preferences with UI columns (UNION operation)
  // This handles:
  // - UI has more columns than preferences: adds missing columns with default true
  // - UI has fewer columns than preferences: includes all preferences
  const mergedPreferences = React.useMemo(
    () => mergeColumnsWithUserPreferences(columns, userColumnPreferences!),
    [columns, userColumnPreferences]
  );

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(
      mergedPreferences || initialColumnVisibilityChanges
    );

  //Local state for column selector to apply chnages when we click on apply button
  const [columnVisibilityChanges, setColumnVisibilityChanges] =
    useState<VisibilityState>(
      mergedPreferences || initialColumnVisibilityChanges
    );

  useEffect(() => {
    // Update state when merged preferences change
    setColumnVisibility(mergedPreferences as VisibilityState);
    setColumnVisibilityChanges(mergedPreferences as VisibilityState);
  }, [mergedPreferences]);

  //initial state for select all checkbox
  const initialSelectAll =
    Object.keys(columnVisibilityChanges).length > 0 &&
    Object.values(columnVisibilityChanges).every(Boolean);

  const [selectAll, setSelectAll] = useState(initialSelectAll);

  /**
   * @function getRowId
   * @description this function return id if the row have the id else it will return the index as id
   * @param originalRow
   * @param index
   * @returns index in string format
   */
  const getRowId = (originalRow: any, index: number) => {
    if (checkboxSelection) {
      return originalRow.id.toString();
    } else {
      return index.toString();
    }
  };
  // table hook
  const table = useReactTable({
    data,
    columns: columns,
    enableSortingRemoval: true,
    sortDescFirst: false,
    getCoreRowModel: getCoreRowModel(),
    // getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getRowId,
    manualSorting: true,
    state: {
      columnVisibility,
      rowSelection,
      sorting,
    },
    onSortingChange: setSorting,
  });

  /**
   * Function to handle the select all checkbox changes
   */
  const handleSelectAllChange = (checked: boolean) => {
    setSelectAll(checked);

    const newColumnVisibilityChanges: VisibilityState = {};

    //Logic for not uncheck the columns which cannot be hidden they should be always true
    Object.keys(columnVisibilityChanges).forEach((columnId) => {
      const column = columns?.find(
        (column: any) => column.accessorKey === columnId
      );
      const canHide = column?.enableHiding;
      newColumnVisibilityChanges[columnId] = canHide === false ? true : checked;
    });

    setColumnVisibilityChanges(newColumnVisibilityChanges);
  };

  /**
   * function to handle the columns in column selector
   */
  const handleColumnVisibilityChange = (
    columnId: string,
    isVisible: boolean
  ) => {
    setColumnVisibilityChanges((prevState) => ({
      ...prevState,
      [columnId]: isVisible,
    }));

    // when i uncheck the individual check box we need to see if all checkboxes or checked or not and we have to update the select all
    const allChecked = Object.values({
      ...columnVisibilityChanges,
      [columnId]: isVisible,
    }).every(Boolean);
    setSelectAll(allChecked);
  };

  /**
   * function to handle the columns in column selector
   */
  const applyColumnVisibilityChanges = () => {
    table.setColumnVisibility(columnVisibilityChanges);
    handleUserColumnPreferences?.(columnVisibilityChanges);
    setOpen(false);

    requestAnimationFrame(() => {
      handleScroll(); // Recalculate scroll position after layout change
    });
  };

  /**
   * functions to clear the columns in column selector
   */
  const clearColumnVisibilityChanges = () => {
    const finalColumnVisibilityChanges = columns.reduce(
      (acc: Record<string, boolean>, column: any) => {
        //When clearing we need to make sure that columns which are not been hidden need to be true always
        if (column.accessorKey) {
          if (column.enableHiding == false) {
            acc[column.accessorKey] = true;
          } else {
            acc[column.accessorKey] = false;
          }
        }
        return acc;
      },
      {}
    );

    setColumnVisibilityChanges(finalColumnVisibilityChanges);
    setColumnVisibility(finalColumnVisibilityChanges);
    handleUserColumnPreferences?.(finalColumnVisibilityChanges);
    setSelectAll(false);

    requestAnimationFrame(() => {
      handleScroll(); // Recalculate scroll position after layout change
    });
  };

  const [scrollLeft, setScrollLeft] = useState(0);
  const tableRef = useRef<HTMLDivElement>(null);

  /**
   * function to move the scroll bar to left using controls in action
   */
  const handlePrevButtonClick = () => {
    if (tableRef.current) {
      tableRef.current.scrollLeft -= 250;
      setScrollLeft(tableRef.current.scrollLeft);
    }
  };

  /**
   * function to move the scroll bar to right using controls in action
   */
  const handleNextButtonClick = () => {
    if (tableRef.current) {
      tableRef.current.scrollLeft += 250;
      setScrollLeft(
        tableRef.current.scrollWidth - tableRef.current.clientWidth
      );
    }
  };

  //state variable to control the opening and closing of the column selector
  const [open, setOpen] = useState(false);
  const resolvedNoRecordsPlaceholder =
    noRecordsPlaceholder || t("bx_v1:cm_no_results");

  /**
   * This function will set the drop down to open or close
   * ColumnVisibilityChange is the columns selected in the dropdown
   * While triggering the dropdown we are updated the ColumnVisibilityChange with ColumnVisibility
   * Where ColumnVisibility is the columns selected after the changes are applied
   */
  const handleColumnDropdownChange = () => {
    setOpen(!open);
    setColumnVisibilityChanges({ ...columnVisibility });
    //If all checkboxes are checked or not and Based on that we have to update the select all
    const allChecked = Object.values({
      ...columnVisibility,
    }).every(Boolean);

    setSelectAll(allChecked);
  };

  /**
   *This component manages the scroll state of a scrollable element (referred to as `tableRef`).
   * It tracks whether the element is scrolled to the start (leftmost position) or the end (rightmost position).
   * The `isAtStart` state is true when the scroll position is at the left edge of the element,
   * and the `isAtEnd` state is true when the scroll position is at or beyond the right edge of the element.
   */
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);

  const handleScroll = () => {
    if (tableRef.current) {
      const { scrollLeft, clientWidth, scrollWidth } = tableRef.current;

      const roundedScrollLeft = Math.round(scrollLeft);
      const roundedClientWidth = Math.round(clientWidth);
      const roundedScrollWidth = Math.round(scrollWidth);

      // Add tolerance for floating-point inaccuracies
      const tolerance = 1;

      setIsAtStart(roundedScrollLeft <= tolerance);
      setIsAtEnd(
        roundedScrollLeft + roundedClientWidth >= roundedScrollWidth - tolerance
      );
    }
  };

  const handleResize = debounce(() => {
    handleScroll();
  }, 100);

  useEffect(() => {
    const tableElement = tableRef.current;

    if (tableElement) {
      tableElement.addEventListener("scroll", handleScroll, { passive: true });
      window.addEventListener("resize", handleResize);

      handleScroll(); // Initial scroll state check
    }

    if (isFiltering && tableRef.current) {
      tableRef.current.scrollLeft = 0;
    }

    return () => {
      if (tableElement) {
        tableElement.removeEventListener("scroll", handleScroll);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, [tableRef.current, isFiltering]);

  // Helper function to remove ID from array (reduces nesting)
  const removeIdFromArray = (prev: number[], idToRemove: number): number[] => {
    return prev.filter((id) => id !== idToRemove);
  };

  // Helper function to handle row checkbox change to reduce nesting
  const handleRowCheckboxChange = (row: any, value: boolean): void => {
    if (!isExcelExport) {
      // Legacy logic
      row?.toggleSelected(!!value);
      return;
    }

    // Extract row ID once to reduce nesting
    const rowId = Number(row?.id);

    // Flatten nested conditions to reduce nesting levels
    if (selectAllParent && value) {
      // User CHECKS checkbox → Remove from unselectedIds (row is now selected)
      setUnselectedIds((prev) => removeIdFromArray(prev, rowId));
      return;
    }

    if (selectAllParent && !value) {
      // User UNCHECKS checkbox → Add to unselectedIds (row is now unselected)
      setUnselectedIds((prev) => [...prev, rowId]);
      return;
    }

    if (!selectAllParent && value) {
      // User CHECKS checkbox → Add to selectedIds
      setSelectedIds((prev) => [...prev, rowId]);
      return;
    }

    if (!selectAllParent && !value) {
      // User UNCHECKS checkbox → Remove from selectedIds
      setSelectedIds((prev) => removeIdFromArray(prev, rowId));
    }
  };

  // Helper function to remove IDs from array using a Set (reduces nesting)
  const removeIdsFromArrayUsingSet = (
    prev: number[],
    idsToRemove: Set<number>
  ): number[] => {
    return prev.filter((id) => !idsToRemove.has(id));
  };

  // Helper function to handle select all checkbox change to reduce nesting
  const handleSelectAllCheckboxChange = (value: boolean): void => {
    if (!isExcelExport) {
      // Legacy logic
      table.toggleAllPageRowsSelected(value);
      return;
    }

    // Extract visible IDs once to avoid deep nesting
    const visibleIds = data.map((row: any) => Number(row?.id));
    const visibleIdsSet = new Set(visibleIds);

    // Flatten nested conditions to reduce nesting levels
    if (selectAllParent && value) {
      // User CHECKS "Page Level Select All" → then all the data in table that is present in unselectedIds should be removed
      setUnselectedIds((prev) =>
        removeIdsFromArrayUsingSet(prev, visibleIdsSet)
      );
      return;
    }

    if (selectAllParent && !value) {
      // User UNCHECKS "Page Level Select All" → then  all the data in the table should be added to unselectedIds
      setUnselectedIds((prev) => [...new Set([...prev, ...visibleIds])]);
      return;
    }

    if (!selectAllParent && value) {
      // User CHECKS "Page Level Select All" → Add all the data in the table to selectedIds
      setSelectedIds((prev) => [...new Set([...prev, ...visibleIds])]);
      return;
    }

    if (!selectAllParent && !value) {
      // User UNCHECKS " Page Level Select All" → Remove all the data in the table from selectedIds
      setSelectedIds((prev) => removeIdsFromArrayUsingSet(prev, visibleIdsSet));
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex max-h-[50px] flex-row items-center justify-between">
        <div className="flex flex-row items-center gap-4">
          {columnSelector && (
            <div>
              <DropdownMenu
                open={open}
                onOpenChange={handleColumnDropdownChange}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    onClick={() => setOpen(true)}
                    variant="outline"
                    className="flex h-10 w-[192px] flex-row justify-between rounded-xl hover:border hover:border-solid hover:border-primary"
                    id="base-table-column-selector-button"
                  >
                    {t("course.find_course:columns")}
                    <DropDown />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[192px] rounded-xl pl-3 pt-2.5"
                  align="start"
                >
                  <div>
                    <div className="scrollbar column-selector-responsive-container flex flex-col gap-4 overflow-y-auto text-grey">
                      <div className="flex flex-row items-center gap-4">
                        <Checkbox
                          checked={selectAll}
                          onCheckedChange={handleSelectAllChange}
                          id="base-table-column-selector-select-all-checkbox"
                        />
                        <Text className="text-sm font-bold">
                          {t("course.find_course:select_all")}
                        </Text>
                      </div>
                      {table
                        .getAllColumns()
                        .filter((column) => column?.accessorFn)
                        // Here we are filtering the columns which have accessorKey
                        .map((column: any, index: number) => {
                          if (!column.getCanHide()) {
                            //display the disabled options
                            return (
                              <div
                                className="flex flex-row items-center gap-4"
                                key={index}
                              >
                                <Checkbox
                                  key={column.id}
                                  disabled={!column.getCanHide()}
                                  //Disabling the checkbox if the column cannot be hidden
                                  checked={columnVisibilityChanges[column.id]}
                                  onCheckedChange={(value: boolean) => {
                                    handleColumnVisibilityChange(
                                      column.id,
                                      value
                                    );
                                  }}
                                  id={`column-${column?.columnDef?.column_name}`}
                                />
                                {column?.columnDef?.column_name}
                              </div>
                            );
                          }
                        })}
                      {table
                        .getAllColumns()
                        .filter(
                          (column) => column?.accessorFn && column.getCanHide()
                        )
                        // Here we are filtering the columns which have accessorKey
                        .map((column: any) => {
                          // display the enabled options
                          return (
                            <div
                              className="flex flex-row items-center gap-4"
                              key={column.id}
                            >
                              <Checkbox
                                key={column.id}
                                checked={columnVisibilityChanges[column.id]}
                                onCheckedChange={(value: boolean) => {
                                  handleColumnVisibilityChange(
                                    column.id,
                                    value
                                  );
                                }}
                              />
                              {column?.columnDef?.column_name}
                            </div>
                          );
                        })}
                    </div>

                    <div className="thin-scrollbar relative flex w-full flex-row items-center gap-4 overflow-auto pb-2.5 pt-2">
                      <div
                        onClick={clearColumnVisibilityChanges}
                        className="cursor-pointer rounded-xl border border-primary p-2 hover:border-solid"
                      >
                        <ClearAll />
                      </div>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={applyColumnVisibilityChanges}
                        id="base-table-column-selector-apply-button"
                      >
                        {t("apply_button")}
                      </Button>
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
          {/* column selector  */}

          {actionComponent && actionComponent}
        </div>
        {/* If pagination set true then we have to show pagination  */}
        <div>
          {!isFiltering && pagination && total > pageSize && (
            <DataPagination
              setCurrent={setCurrent}
              current={current}
              pageCount={pageCount}
              total={total}
            />
          )}
        </div>
      </div>

      {/* Table */}
      <div>
        <div className="h-full overflow-hidden rounded-xl border">
          <div
            ref={tableRef}
            className={`w-full ${tableStyles?.tableContainer} scrollbar ${
              isFiltering
                ? "overflow-x-hidden"
                : "overflow-x-auto overflow-y-hidden"
            } relative overflow-x-auto overflow-y-hidden`}
          >
            <Table id={tableId} className={`${tableStyles?.table}`}>
              <TableHeader
                className={`w-full bg-primary-light ${tableStyles?.tableHeader}`}
              >
                {table &&
                  table?.getHeaderGroups()?.map((headerGroup) => (
                    <TableRow
                      className="w-full border-none text-base font-bold"
                      key={headerGroup?.id}
                    >
                      {/* If the checkboxSelection is true then we need to show checkboxes  */}
                      {checkboxSelection && (
                        <TableHead
                          className={`${
                            columnPinning && "sticky left-0 bg-primary-light"
                          }`}
                        >
                          <Checkbox
                            checked={(() => {
                              /*
                            if isExcelExport is true then we are using the new logic
                            if  selectAllParent is true then  whatever  the data in table that is not present in unselectedIds  then it should be checked
                            if selectAllParent is not true then all the data in table should be present in selectedIds then it should be checked
                              */
                              if (!isExcelExport) {
                                return table.getIsAllPageRowsSelected(); // Legacy logic
                              }

                              if (selectAllParent) {
                                // If selectAllParent is true, check if no rows in data are in unselectedIds
                                return (
                                  total > 0 &&
                                  !data.some((row: any) =>
                                    unselectedIds.includes(Number(row?.id))
                                  )
                                );
                              }

                              // If selectAllParent is false, check if all rows in data are in selectedIds
                              return (
                                total > 0 &&
                                data.every((row: any) =>
                                  selectedIds.includes(Number(row?.id))
                                )
                              );
                            })()}
                            onCheckedChange={(value: boolean) => {
                              handleSelectAllCheckboxChange(value);
                            }}
                            aria-label={t("course.find_course:select_all")}
                            id="base-table-select-all-checkbox"
                          />
                        </TableHead>
                      )}
                      {headerGroup?.headers?.map((header, index) => {
                        return (
                          <TableHead
                            //If we have column pinning true then we have to make the first and last column sticky
                            className={`${
                              columnPinning &&
                              index === 0 &&
                              `sticky ${
                                checkboxSelection ? "left-12" : "left-0"
                              } bg-primary-light drop-shadow-right`
                            } ${
                              !noScroll &&
                              columnPinning &&
                              index === headerGroup.headers.length - 1 &&
                              `sticky right-0 w-[50px] bg-primary-light drop-shadow-left`
                            } ${tableStyles?.tableHeaderCell ? tableStyles?.tableHeaderCell : ""} text-grey`}
                            key={header?.id}
                          >
                            {header?.isPlaceholder
                              ? null
                              : flexRender(
                                  header?.column?.columnDef?.header,
                                  header?.getContext()
                                )}

                            {!noScroll &&
                              index === headerGroup.headers.length - 1 &&
                              columnPinning && (
                                <div className="flex flex-row gap-2">
                                  <ChevronLeft
                                    onClick={handlePrevButtonClick}
                                    className={`mr-1 size-6 cursor-pointer rounded-full ${
                                      isAtStart
                                        ? "bg-white text-primary"
                                        : "bg-primary text-white"
                                    }`}
                                  />
                                  <ChevronRight
                                    onClick={handleNextButtonClick}
                                    className={`size-6 cursor-pointer rounded-full ${
                                      isAtEnd
                                        ? "bg-white text-primary"
                                        : "bg-primary text-white"
                                    }`}
                                    id="base-table-columns-right-button"
                                  />
                                </div>
                              )}
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  ))}
              </TableHeader>
              <TableBody>
                {isFiltering ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns?.length}
                      className="h-24 text-center"
                    >
                      <div className="flex w-screen items-center justify-center">
                        <div className="loader"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : table && table?.getRowModel()?.rows?.length ? (
                  <>
                    {table?.getRowModel()?.rows?.map((row) => (
                      <TableRow
                        className={`{${tableStyles?.rowStyles}`}
                        key={row?.id}
                        // data-state={row?.getIsSelected() && "selected"}
                      >
                        {/* If the checkboxSelection is true then we need to show checkboxes  */}
                        {checkboxSelection && (
                          <TableCell
                            className={`${
                              columnPinning && "sticky left-0 bg-white"
                            }`}
                          >
                            <Checkbox
                              checked={
                                /*
                                if isExcelExport is true then we are using the new logic
                                if selectedIds includes the row id then the checkbox should be checked
                                if unselectedIds does not include the row id and selectAllParent is true then the checkbox should be checked
                                */
                                isExcelExport
                                  ? selectedIds.includes(Number(row?.id)) ||
                                    (!unselectedIds.includes(Number(row?.id)) &&
                                      selectAllParent)
                                  : row?.getIsSelected() // Legacy logic
                              }
                              onCheckedChange={(value) => {
                                handleRowCheckboxChange(row, !!value);
                              }}
                              aria-label="Select row"
                            />
                          </TableCell>
                        )}

                        {row?.getVisibleCells().map((cell, index) => (
                          //If we have column pinning true then we have to make the first and last column sticky
                          <TableCell
                            className={` ${
                              columnPinning &&
                              index === 0 &&
                              `sticky ${
                                checkboxSelection ? "left-12" : "left-0"
                              } top-0 bg-white drop-shadow-right`
                            } ${
                              !noScroll &&
                              columnPinning &&
                              index === row.getVisibleCells().length - 1 &&
                              `sticky right-0 top-0 w-[50px] bg-white drop-shadow-left`
                            } ${tableStyles?.tableBodyCell ? tableStyles?.tableBodyCell : ""} text-grey`}
                            key={cell.id}
                          >
                            {flexRender(
                              cell?.column?.columnDef?.cell,
                              cell?.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                    {/* Render Footer Rows within the TableBody */}
                    {table
                      ?.getFooterGroups()
                      ?.some((group) =>
                        group.headers.some(
                          (header) => header.column.columnDef.footer
                        )
                      ) &&
                      table?.getFooterGroups()?.map((row) => (
                        <TableRow key={row.id} className="bg-primary-light">
                          {row?.headers?.map((cell, index) => (
                            <TableCell
                              key={cell.id}
                              className={`${
                                columnPinning && index === 0
                                  ? "sticky left-0 bg-primary-light drop-shadow-right"
                                  : ""
                              } ${
                                !noScroll &&
                                columnPinning &&
                                index === row.headers.length - 1
                                  ? "sticky right-0 bg-white drop-shadow-left"
                                  : ""
                              } ${tableStyles?.tableBodyCell ? tableStyles?.tableBodyCell : ""} text-grey`}
                            >
                              {flexRender(
                                cell?.column?.columnDef?.footer,
                                cell?.getContext()
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                  </>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns?.length}
                      className="h-24 text-left"
                    >
                      {resolvedNoRecordsPlaceholder}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        {!isFiltering && pagination && (
          <div className="my-6 flex justify-center">
            <div className="w-1/3"></div>
            <div className="flex w-1/3 items-center justify-center">
              {/* When there is more than 1 page then only we need to render this */}
              {total > pageSize && (
                <DataPagination
                  setCurrent={setCurrent}
                  current={current}
                  pageCount={pageCount}
                  total={total}
                  pageSize={pageSize}
                />
              )}
            </div>
            {total >= 10 && (
              <div
                className="flex w-1/3 items-center justify-end space-x-2"
                id="base-table-pagination-dropdown"
              >
                <Select
                  value={pageSize}
                  onValueChange={(value) => {
                    setCurrent(1);
                    setPageSize(Number(value));
                    table?.setPageSize(Number(value));
                  }}
                >
                  <SelectTrigger
                    className="h-8 w-[131px]"
                    id="base-table-page-size"
                  >
                    <Text className="text-grey1">
                      {t("course.find_course:showing")}
                    </Text>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {/* Updated pageSize options to include [10, 25, 50, 100]. */}
                    {[10, 25, 50, 100].map(
                      (
                        pageSize // Till now there is no limit will change after confirming TODO
                      ) => (
                        <SelectItem
                          key={pageSize}
                          value={`${pageSize}`}
                          id={`base-table-${pageSize}`}
                        >
                          {pageSize}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
                <Text className="text-sm font-normal">
                  {t("course.find_course:of")} {total}
                </Text>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface DataPaginationProps {
  setCurrent?: (value: React.SetStateAction<number>) => void;
  current?: number;
  pageCount?: number;
  total?: number;
  pageSize?: number;
}

const DataPagination = ({
  setCurrent = () => {},
  total = 0,
  current = 1,
  pageCount = 1,
  pageSize = 0,
}: DataPaginationProps) => {
  const { t } = useTranslation(["common", "bx_v1"]);
  const PagesArray = [];
  const DOTS = ". . .";
  if (pageCount <= 4) {
    // If there are 4 or fewer pages, show all pages without ellipses
    for (let i = 1; i <= pageCount; i++) {
      PagesArray.push(i);
    }
  } else {
    if (current <= 3) {
      // If current page is 4 or less, show pages 1 to 4, then ellipses, then last page
      PagesArray.push(1, 2, 3, 4, DOTS, pageCount);
    } else if (current >= pageCount - 2) {
      // If current page is near the end, show first page, ellipses, and last 4 pages
      PagesArray.push(
        1,
        DOTS,
        pageCount - 3,
        pageCount - 2,
        pageCount - 1,
        pageCount
      );
    } else {
      // Otherwise,first page , ellipses, current page, ellipses, and last page
      PagesArray.push(
        1,
        DOTS,
        current - 1,
        current,
        current + 1,
        DOTS,
        pageCount
      );
    }
  }

  return (
    <div className="flex flex-row items-center space-x-2 self-center p-2 text-xs">
      {/* prev button */}
      {/* Check if there are more than one page, and if so, display a button for navigating to the previous page. */}
      {pageCount > 1 && (
        <Button
          variant="outline"
          className={`h-8 min-w-8 rounded-sm border-none p-0 text-xs !font-semibold ${current <= 1 ? "text-grey2-light-active" : " "}`}
          onClick={() => setCurrent(current - 1)}
          disabled={current <= 1}
          id="base-table-pagination-prev-button"
        >
          {t("bx_v1:cm_prev")}
        </Button>
      )}
      {/* pages buttons */}
      {total > pageSize &&
        PagesArray.map((page: any, index: any) => (
          <div key={index}>
            {/* Check if the current page is a placeholder for ellipsis.If yes, display the ellipsis.Otherwise, display a button for the page. */}
            {page === DOTS ? (
              <span className="p-2 text-xs">{DOTS}</span>
            ) : (
              <Button
                variant={page === current ? "primary" : "outline"}
                onClick={() => {
                  setCurrent(page);
                }}
                className="size-8 rounded-lg p-3 text-xs"
                id={`base-table-pagination-page-${page}-button`}
              >
                {page}
              </Button>
            )}
          </div>
        ))}
      {/* next button */}
      {/* Check if there are more than one page, and if so, display a button for navigating to the next page. */}
      {pageCount > 1 && (
        <Button
          variant="outline"
          className={`h-8 min-w-8 rounded-sm border-none p-0 text-xs !font-semibold ${current >= pageCount ? "text-grey2-light-active" : " "}`}
          onClick={() => setCurrent(current + 1)}
          disabled={current >= pageCount}
          id="base-table-pagination-next-button"
        >
          {t("next")}
        </Button>
      )}
    </div>
  );
};
