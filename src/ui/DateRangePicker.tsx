"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "../lib/utils";
import { buttonVariants } from "./button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  formatLocalizedMonth,
  formatLocalizedWeekday,
  getDateFnsLocale,
} from "../lib/i18n";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export type ExtendedCalendarProps = React.ComponentProps<typeof DayPicker> & {
  yearMonthDropdownClassName?: React.ReactNode; // Add customField prop
};

function DateRangePicker({
  className,
  classNames,
  showOutsideDays = false,
  yearMonthDropdownClassName,
  ...props
}: ExtendedCalendarProps) {
  const { i18n } = useTranslation();
  const handleCalendarChange = (
    _value: string | number,
    _e: React.ChangeEventHandler<HTMLSelectElement>
  ) => {
    const _event = {
      target: {
        value: String(_value),
      },
    } as React.ChangeEvent<HTMLSelectElement>;
    _e(_event);
  };

  const locale = i18n?.language ?? "en";

  return (
    <DayPicker
      locale={getDateFnsLocale(locale)}
      formatters={{
        formatWeekdayName: (date) => {
          return formatLocalizedWeekday(date, locale);
        },
      }}
      showOutsideDays={showOutsideDays}
      className={cn("", className)}
      classNames={{
        months:
          "flex flex-col justify-center sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4 border border-stroke min-w-[374px] rounded-3xl",
        caption:
          "flex flex-row relative items-center border-b border-grey-light-hover h-[60px]",
        caption_dropdowns:
          "flex flex-row-reverse justify-center gap-2 grow dropdowns",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 p-2 border border-grey-light-hover"
        ),
        nav_button_previous: "absolute left-5 !text-grey1 w-6 h-6",
        nav_button_next: "absolute right-5 !text-grey1 w-6 h-6",
        table: "w-full border-collapse space-y-2 min-h-[284px]",
        head_row:
          "flex capitalize gap-6 text-grey2 items-center justify-center text-xs h-[44px]",
        head_cell: "text-grey2 rounded-md w-6 font-normal text-xs",
        row: "flex flex-row w-full px-4",
        cell: "h-11 w-12 text-center text-xs p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-primary [&:has([aria-selected])]:bg-primary-light first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 flex justify-center items-center",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-11 w-12  text-xs !rounded-full text-grey font-semibold aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "aria-selected:bg-primary text-white hover:bg-primary focus:bg-primary focus:text-white hover:text-white",
        day_today: "bg-primary-light text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-primary aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-primary-light aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        // IconLeft: ({ ...props }) => <ChevronLeft className="h-5 !w-6" />,
        // IconRight: ({ ...props }) => <ChevronRight className="h-5 !w-6" />,
        Dropdown: ({ ...props }) => {
          const [selectedValue, setSelectedValue] = useState<string | null>(
            props.value as string
          );

          const handleValueChange = (value: string) => {
            setSelectedValue(value);
            if (props.onChange) {
              handleCalendarChange(value, props.onChange);
            }
          };

          const selectedYearOrMOnth =
            props?.name == "months"
              ? formatLocalizedMonth(
                  new Date(2000, Number(props.value ?? 0), 1),
                  locale,
                  "short"
                )
              : props?.caption;

          return (
            <div className="dropdowns-dob">
              <Select
                {...props}
                onValueChange={(value) => {
                  handleValueChange(value as string);
                }}
                value={selectedValue ?? (props.value as string)}
              >
                <SelectTrigger
                  className={cn(
                    `${yearMonthDropdownClassName} h-10 w-[105px] rounded-xl font-medium capitalize [.is-between_&]:hidden [.is-end_&]:hidden [.is-start.is-end_&]:flex`
                  )}
                >
                  <SelectValue
                    placeholder={selectedYearOrMOnth}
                    className="capitalize"
                  >
                    {selectedYearOrMOnth}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-[269px] min-w-[109px] p-1">
                  <div className="scrollbar max-h-[var(--radix-popper-available-height);] overflow-y-auto capitalize">
                    {props.children &&
                      React.Children.map(props.children, (child) => (
                        <SelectItem
                          value={
                            (child as React.ReactElement<any>)?.props?.value
                          }
                          className={cn({
                            "bg-[#7677F4]/10 capitalize text-[#7677F4] hover:!bg-[#7677F4]/10":
                              selectedValue ===
                              (child as React.ReactElement<any>)?.props?.value,
                          })}
                        >
                          {(child as React.ReactElement<any>)?.props?.children}
                        </SelectItem>
                      ))}
                  </div>
                </SelectContent>
              </Select>
            </div>
          );
        },
        CaptionLabel: () => {
          return null;
        },
      }}
      {...props}
    />
  );
}

export { DateRangePicker };
