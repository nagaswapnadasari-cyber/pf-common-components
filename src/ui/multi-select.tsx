"use client";

import GetScrollTypesAlert from "../ui/GetScrollAlert";
import DropDown from "src/assets/DropDown";
import { uniqBy } from "lodash";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import * as React from "react";
import { useEffect, useState } from "react";
import { Badge } from "./badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";
import { cn } from "../lib/utils";
import { ccn } from "../lib/CommonComponentsUtil";
import DropDownArrow from "../assets/DropDown";

// Define the shape of each data item
export type DataItem = Record<"value" | "label", string>;

// Main MultiSelect component
export function MultiSelect({
  placeholder = "Select an item",
  data = [],
  onBottomReached,
  onSearch,
  onChange,
  value: propValue = [],
  getOptionProps,
  error,
  selectBoxStyles,
  searchBar = true,
  variant = "standard",
  isInitialLoading = false,
  isFiltering = false,
  disabled = false,
  secured = false,
  name = "",
  minLenToSearch = 1,
  searchPlaceholder,
}: {
  placeholder?: string;
  data: DataItem[];
  onBottomReached: () => void;
  onSearch: (query: string) => void;
  onChange: any;
  value?: any;
  getOptionProps?: any;
  error?: any;
  selectBoxStyles?: any;
  secured?: boolean;
  minLenToSearch?: number;
  searchPlaceholder?: string;
  /**
   * To hide search bar for mutli select dropdowns we can use this prop
   * True: by default it will be true only no need to pass
   * False: it will not display search bar
   */
  searchBar?: boolean;
  /**
   * To add placeholder to "+add" or "dropdown icon" button for open dropdown popover
   * standard: by default it will be standard only no need to pass (only clickable +add icon)
   * basic: it will display dropdown icon and (clickable any where in select)
   * secured: for some dropdowns we don't need to display the options initially, display options only  when user start entering in the search bar
   */
  variant?: "basic" | "standard";

  /**
   * is initial Loading to run a loader until we get the data initially from respective DB
   */
  isInitialLoading?: boolean;
  /**
   * is Filtering to run a loader until we fetch the data from respective DB when we search in the search input
   */
  isFiltering?: boolean;
  /**
   * disabled is used to disable the component so that not to perform any functionality
   */
  disabled?: boolean;
  /**
   * Name is used as an pre ID for the component items
   */
  name?: string;
}) {
  const { t } = useTranslation(["common", "bx_v1"]);
  /**
   * with cmdk package it's not possible pass value as object or array of object expect number | string
   * So to override this we are going to stringify options whatever we are passing with the below conditions
   */
  let modifiedData = data?.map((obj) => {
    return {
      label: obj.label,
      value:
        typeof obj.value === "string" ? obj.value : JSON.stringify(obj.value),
    };
  });
  const filteredData = uniqBy(modifiedData, "value");

  // Refs to manage focus and detect clicks outside the component
  const dropdownRef = React.useRef<(HTMLElement | null)[]>([]);
  const popoverDropdownRef = React.useRef<(HTMLElement | null)[]>([]);

  /**
   * Allows to manage multiple references using a single ref handler.
   * Here the add ref and popover ref are array of references
   * Since each ref is a array, they can manage multiple references
   * This function checks if the ref is not null and is not already included in the array before adding it.
   * If the ref is not included, then it will be pushed into array
   */
  const addRef = (ref: HTMLElement | null) => {
    if (ref && !dropdownRef.current.includes(ref)) {
      dropdownRef.current.push(ref);
    }
  };

  const popoverRef = (ref: HTMLElement | null) => {
    if (ref && !popoverDropdownRef.current.includes(ref)) {
      popoverDropdownRef.current.push(ref);
    }
  };

  // States to manage the component's behavior
  const [open, setOpen] = React.useState(false);
  const [popoverOpen, setPopoverOpen] = React.useState(false);

  /**
   * selected variable contains the selected values from multi select
   * it holds array of value howevr user is passing from outside
   * if user sends array or object it holds the same type
   */
  const [selected, setSelected] = React.useState<any[]>(propValue);

  const [searchValue, setSearchValue] = React.useState<string>("");

  const headerStyles = selectBoxStyles?.header || "";
  const dropdownStyles = selectBoxStyles?.dropdown || "";

  // Requirement: Whenever the modal is closed, we need to clear the search value
  // for this we can use useEffect
  // and we are taking internal state variable to control the search bar
  useEffect(() => {
    if (open === false) {
      onSearch("");
      setSearchValue("");
    }
  }, [open]);

  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Handling the is Loading More state variable to loading when ever we reach the bottom, Until data is fetched
  useEffect(() => {
    if (isFiltering === false && isLoadingMore) {
      setIsLoadingMore(false);
    }
  }, [isFiltering]);

  // Handle unselecting an item from the selected list
  const handleUnselect = (item: number) => {
    setSelected((prev) => prev.filter((s) => s !== item));
    onChange(selected?.filter((s) => s !== item));
  };

  const handleOnSelect = (option: any) => {
    onChange([...selected, option]);
    setSelected((prev) => [...prev, option]);
  };

  //When prop values changes from external functions, we have to keep the selected state and prop value in sync.
  //How use effect will work was when dependency was changed, it will run
  //here we are doing stringify of propvalue becuase of below reasons
  // reason 1: initially propValue is an empty array []==[] is false it will think like false so it willrun again and again.
  // solution 1: keeping JSON.stringify(propValue) it means "[]"=="[]" is true it will not run again.
  // solution 2: //TODO: In FUTURE we will do complete controlled component without any useEffects
  useEffect(() => {
    setSelected(propValue);
  }, [JSON.stringify(propValue)]);

  // Handle clicks outside the dropdown to close it

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.some(
          (ref) => ref && ref.contains(event.target as Node)
        ) &&
        popoverDropdownRef.current &&
        !popoverDropdownRef.current.some(
          (ref) => ref && ref.contains(event.target as Node)
        )
      ) {
        setOpen(false);
        setPopoverOpen(false); // Close the popover as well
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, popoverOpen]);

  const findObjectById = (id: any): DataItem | undefined => {
    // Find the object with the given id
    return filteredData.find(
      (obj) => obj.value == (typeof id === "string" ? id : JSON.stringify(id))
    );
  };

  // Filter out selected values from the dropdown
  const selectables = filteredData.filter(
    (obj) =>
      !selected.find((selectedObj) => {
        selectedObj =
          typeof selectedObj === "string"
            ? selectedObj
            : JSON.stringify(selectedObj);

        return obj.value === selectedObj;
      })
  );

  return (
    <div className="grid w-full items-center font-medium">
      <Command className="overflow-visible bg-transparent">
        <div
          className={cn(
            `relative flex h-[40px] items-center justify-between px-4 py-[10px] ${headerStyles}`,
            variant === "basic" && "cursor-pointer",
            disabled && "!cursor-not-allowed bg-grey2-light placeholder-grey2",
            ccn(error, propValue)
          )}
          // The dropdown should be clickable in the entire field space in the basic variant
          onClick={() => {
            if (variant === "basic" && !disabled) {
              setOpen(!open);
              setPopoverOpen(false);
            }
          }}
          ref={addRef}
          id={`${name}-multi-select`}
        >
          {selected?.length == 0 ? (
            <div>
              {selected?.length <= 0 && (
                <div className="font-normal text-[#999999]">{placeholder}</div>
              )}
            </div>
          ) : (
            //Display selected items and provide options to remove them
            <div className="flex items-center gap-2">
              {/* Display up to two selected items with a badge */}
              {selected?.map((item, index) => {
                // Extracting option properties, including 'noIcon' to determine if a cross icon should be displayed
                const optionProps = getOptionProps
                  ? getOptionProps(item)
                  : {
                      noIcon: false,
                    };
                const { disable: noIcon } = optionProps;
                if (index > 1) return null;

                return (
                  <Badge
                    key={item}
                    variant="outline"
                    className="flex h-6 w-[92px] items-center border border-[#D6D7D8]"
                    // When the user clicks on the selected chips, stop the click event from propagating to parent elements.
                    // This prevents the dropdown from toggling open/closed when clicking on a chip.
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <div className="max-w-[63px] truncate">
                      <abbr
                        className="text-3 font-bold leading-4 text-[#333333] no-underline"
                        title={findObjectById(item)?.label}
                      >
                        {findObjectById(item)?.label}
                      </abbr>
                    </div>
                    <button
                      type="button"
                      className={cn(
                        "ml-1 flex items-center rounded-full outline-none",
                        disabled && "cursor-not-allowed"
                      )}
                      onClick={() => handleUnselect(item)}
                      disabled={disabled}
                    >
                      {!noIcon && (
                        <X
                          onClick={() => handleUnselect(item)}
                          className="h-[14px] w-[14px]"
                          stroke="#7677F4"
                          strokeWidth={2.5}
                        />
                      )}
                    </button>
                  </Badge>
                );
              })}

              {/* Display a count badge for additional selected items */}
              {selected?.length > 2 && (
                <div
                  className={`flex h-6 w-[29px] cursor-pointer items-center justify-center rounded-full bg-[#7677F4]/20 px-2 ${
                    disabled ? "disabled" : ""
                  }`}
                  ref={popoverRef}
                  onClick={(e) => {
                    setPopoverOpen(!popoverOpen);
                    setOpen(false);
                    e.stopPropagation();
                  }}
                >
                  <div className="flex h-4 w-4 items-center justify-center text-[12px] font-bold text-[#7677F4]">{`+${selected?.length - 2}`}</div>
                </div>
              )}
            </div>
          )}

          <div>
            {/* Display placeholder or "Add" button */}
            {variant === "basic" ? (
              <div className="w-full" ref={addRef}>
                <div className="flex w-full flex-row justify-between">
                  <button
                    type="button"
                    disabled={disabled}
                    className={`h-5 h-fit w-5 w-fit focus:outline-keyboardTab ${disabled && "cursor-not-allowed"} `}
                  >
                    <DropDownArrow />
                  </button>
                </div>
              </div>
            ) : (
              <div ref={addRef}>
                <button
                  type="button"
                  className={`ml-1 rounded-full text-[14px] font-medium leading-[18px] text-[#7677F4] ${
                    disabled && "cursor-not-allowed"
                  }`}
                  onClick={() => {
                    setOpen(!open);
                    setPopoverOpen(false);
                  }}
                  disabled={disabled}
                >
                  <span className="text-[16px] leading-none">+</span>{" "}
                  {t("add_button")}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Selected Items List (Popover) */}
        <div className="relative mt-[2px]" ref={popoverRef}>
          {popoverOpen && selected?.length > 0 ? (
            <div
              className={`absolute z-50 w-full overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-md outline-none animate-in ${dropdownStyles}`}
            >
              <CommandGroup className="max-h-[224px] overflow-y-auto">
                {selected?.map((item, index) => {
                  // Extracting option properties, including 'noIcon' to determine if a cross icon should be displayed
                  const optionProps = getOptionProps
                    ? getOptionProps(item)
                    : {
                        noIcon: false,
                      };
                  const { disable: noIcon } = optionProps;
                  return (
                    <div key={item}>
                      <div className="flex min-h-[44px] flex-row items-center justify-between gap-1 py-2 pl-2 pr-3">
                        <div className="line-clamp-2 text-[14px] text-[#333333]">
                          {findObjectById(item)?.label}
                        </div>
                        <div>
                          {!noIcon && (
                            <X
                              onClick={() => handleUnselect(item)}
                              className={cn(
                                "h-[14px] w-[14px] cursor-pointer",
                                disabled &&
                                  "pointer-events-none cursor-not-allowed"
                              )}
                              aria-disabled={disabled}
                              stroke="#7677F4"
                              strokeWidth={2.5}
                            />
                          )}
                        </div>
                      </div>
                      {/* Add a horizontal line for all items except the last one */}
                      {index < selected?.length - 1 && (
                        <hr className="border-[#D6D7D8]" />
                      )}{" "}
                    </div>
                  );
                })}
              </CommandGroup>
            </div>
          ) : null}
        </div>

        {/* Items to be selected list (Dropdown) */}
        <div className="relative z-50 rounded-xl" ref={addRef}>
          {open && (
            <div className="absolute w-full overflow-hidden rounded-xl border bg-[#FFFFFF] text-popover-foreground shadow-md outline-none animate-in">
              {/* Search input */}
              {(searchBar && data.length > 5) || searchValue || secured ? (
                <div className="rounded-[12px] border-b border-gray-200">
                  <CommandInput
                    onChange={(e: any) => {
                      onSearch(e.target.value);
                      setSearchValue(e.target.value);
                    }}
                    autoFocus
                    className="h-[44px] border-none text-[#999999] focus-visible:outline-none"
                    placeholder={
                      searchPlaceholder
                        ? searchPlaceholder
                        : t("bx_v1:cm_search")
                    }
                    value={searchValue}
                  />
                </div>
              ) : null}
              <div>
                {/* TODO: when user remove whole search then we are getting no data but need to display loader will do that */}
                {/* priority 1.- variant secured and no search value we need not to display anything in the dropdown */}
                {/* priority 2.- initially we need to display loader until getting the data */}
                {/* priority 3.- if there is no selectables data and variant is not secured and no search value then we need to display "No Data" in dropdown */}
                {/* priority 4.- if there is search value and is filtering then loader need to display */}
                {/* priority 5.- if there is search value and no selectables data then we need to display "No search results found" in dropdown */}

                {secured && searchValue?.length < minLenToSearch ? (
                  <div></div>
                ) : isInitialLoading ||
                  (isFiltering && isLoadingMore === false) ? (
                  <div className="flex h-16 items-center justify-center">
                    <div className="loader-small">
                      <div className="loader"></div>
                    </div>
                  </div>
                ) : (
                  <>
                    <CommandList className="max-h-[224px]">
                      <CommandEmpty>
                        {searchValue
                          ? t("bx_v1:cm_no_search_results_found")
                          : t("bx_v1:cm_no_data")}
                      </CommandEmpty>
                      <GetScrollTypesAlert
                        id={"multiselect"}
                        onBottom={() => {
                          onBottomReached();
                          setIsLoadingMore(true);
                        }}
                      >
                        <CommandGroup
                          id={"multiselect"}
                          className="max-h-[224px] overflow-y-auto text-[#333333]"
                          forceMount={true}
                        >
                          {selectables?.map((option: any, index: number) => {
                            return (
                              <div key={index}>
                                <CommandItem
                                  key={option.value}
                                  onSelect={(value) => {
                                    let selectedValue = option.value;
                                    try {
                                      selectedValue = JSON.parse(selectedValue);
                                    } catch (error) {
                                      console.log("it is already string");
                                    }

                                    handleOnSelect(selectedValue);
                                  }}
                                  value={
                                    typeof option.value === "string"
                                      ? option.value
                                      : JSON.stringify(option.value)
                                  }
                                  className="px-5 hover:cursor-pointer"
                                >
                                  <div className="line-clamp-2">
                                    {option.label}
                                  </div>
                                </CommandItem>

                                {index < selectables?.length - 1 && (
                                  <hr className="mx-[5px] bg-border" />
                                )}
                              </div>
                            );
                          })}
                        </CommandGroup>
                      </GetScrollTypesAlert>
                    </CommandList>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </Command>
    </div>
  );
}
