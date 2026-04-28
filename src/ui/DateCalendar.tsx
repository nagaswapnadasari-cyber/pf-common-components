import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { useTranslation } from "react-i18next";

import { cn } from "../lib/utils";
import { buttonVariants } from "./button";
import { formatLocalizedMonth, formatLocalizedWeekday } from "../lib/i18n";

export type DateCalendarProps = React.ComponentProps<typeof DayPicker>;

function DateCalendar({
  className,
  classNames,
  showOutsideDays = true,
  count,
  captionLayout,
  fromDate,
  toDate,
  ...props
}: DateCalendarProps & { count?: number }) {
  const { i18n } = useTranslation();
  const locale = i18n?.language ?? "en";

  return (
    <DayPicker
      weekStartsOn={1}
      formatters={{
        formatWeekdayName: (date) => {
          return formatLocalizedWeekday(date, locale);
        },
      }}
      disabled={{
        before: fromDate as Date,
        after: toDate as Date,
      }}
      showOutsideDays={showOutsideDays}
      className={cn("", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-2 relative items-center",
        caption_label: "text-md font-medium",
        nav: "space-x-2 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 p-2 border border-[1px] border-grey-light-hover"
        ),
        nav_button_previous: "absolute left-2 !text-grey1",
        nav_button_next: "absolute right-3 !text-grey1",
        table: "w-full border-collapse ",
        head_row: "flex capitalize w-full gap-[12px] mx-[6px] text-sm",
        head_cell:
          "text-muted-foreground !rounded-full w-10 font-normal text-sm",
        row: "flex w-full ",
        cell: "h-10 w-10 text-center m-[6px] !rounded-full text-lg  relative [&:has([aria-selected].day-range-end)]:rounded-full [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-full last:[&:has([aria-selected])]:rounded-full hover:rounded-full focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-10 w-10 p-0 font-normal aria-selected:opacity-100  hover:rounded-full "
        ),
        day_range_end: "day-range-end",
        day_selected:
          "aria-selected:bg-primary text-white !rounded-full hover:bg-primary focus:bg-primary focus:text-white hover:text-white",
        day_today: "bg-accent text-accent-foreground !rounded-full",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:!bg-primary aria-selected:text-primary-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-primary-light aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        CaptionLabel: ({ ...props }) => {
          // Extract the month from the props
          const { displayMonth } = props;

          const month = formatLocalizedMonth(displayMonth, locale, "long");

          const year = displayMonth.getFullYear();

          return (
            <div className="flex flex-col items-center gap-1 font-semibold">
              <div className="text-[20px] capitalize">{month}</div>
              <div className="text-[12px] text-[#999999]">{year}</div>
            </div>
          );
        },
        DayContent: ({ date, ...dayprops }) => {
          const isSelected =
            props.selected instanceof Date &&
            date.getDate() === props.selected.getDate() &&
            date.getMonth() === props.selected.getMonth() &&
            date.getFullYear() === props.selected.getFullYear();

          const showCount = count !== undefined;
          return (
            <div>
              {date?.getDate()}
              {isSelected && showCount && (
                <div className="absolute right-[-4px] top-[-4px] flex h-5 w-5 items-center justify-center rounded-full bg-[#FF6D6D] text-xs text-white">
                  {count}
                </div>
              )}
            </div>
          );
        },
      }}
      {...props}
    />
  );
}
DateCalendar.displayName = "Calendar";

export { DateCalendar };
