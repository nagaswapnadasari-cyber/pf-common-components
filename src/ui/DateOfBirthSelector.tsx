import { format } from "date-fns";
import CalenderIcon from "../assets/CalenderIcon";
import * as React from "react";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { cn } from "../lib/utils";
import { Calendar } from "./DobCalendar";

/**
 * This is the function of complete date picker,Which contains a button and a calendar
 * @returns complete date picker
 */
export function DateOfBirthSelector({
  onChange,
  value,
  onBlur,
  onFocus,
  error,
  className,
  placeholder,
  fromDate,
  toDate,
  disabled,
}: {
  onChange: any;
  value: any;
  onBlur?: any;
  onFocus?: any;
  error?: any;
  className?: string;
  placeholder?: string;
  fromDate: Date;
  toDate: Date;
  disabled?: boolean;
}) {
  const [date, setDate] = React.useState<Date | undefined>(value);
  const [calendarOpen, setCalendarOpen] = React.useState(false);

  const thisYear = new Date().getFullYear(); //present year

  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate);

    if (newDate) onChange(format(newDate, "yyyy/MM/dd"));
    else onChange("");
    setCalendarOpen(false);
  };
  React.useEffect(() => {
    setDate(value ? new Date(value) : value);
  }, [value]);

  return (
    <Popover
      open={disabled ? false : calendarOpen}
      onOpenChange={setCalendarOpen}
    >
      <PopoverTrigger asChild>
        <Button
          className={cn(
            "border border-input bg-[white] text-left font-normal sm:h-[40px] sm:w-full",
            className,
            error && "border-[#FF6D6D]",
            disabled && "cursor-not-allowed"
          )}
          onBlur={onBlur}
          onFocus={onFocus}
        >
          <div
            className={`flex w-full flex-col ${
              date ? "text-[#333333]" : "text-[#999999]"
            }`}
          >
            {/* <span className={`${date ? "text-primary" : "text-secondary"}`}>
              {date ? format(date, "dd MMM yyyy") : t("dateOfBirth")}
            </span> */}
            {date ? format(date, "dd-MM-yyyy") : placeholder}
            {/* {date ? date : placeholder} */}
          </div>
          <div>
            <CalenderIcon color="#666666" className="mr-2 h-4 w-4" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="center"
        className="h-auto w-[270px] rounded-[21px] border-[#D7D7D7] p-0"
      >
        <Calendar
          mode="single" // Here single mode represents that we can pick a single date from calendar
          captionLayout="dropdown-buttons" //The calendar contains both dropdowns of months, years and previous, next buttons
          selected={date} // Shows the selected date in the calendar
          showOutsideDays={false} // Whether need to show the days not present in the month
          weekStartsOn={1} // Sequence of days in a week starts from monday
          onSelect={handleDateChange} // Selected date is set to the date after selected from the calendar
          fromDate={fromDate} //The earliest day to start the month navigation.
          toDate={toDate} //The latest day to end the month navigation.
          disabled={(date) => {
            const todayDate = new Date();
            todayDate.setHours(0, 0, 0, 0);
            const selectDate = new Date(date);
            return fromDate && toDate
              ? false
              : fromDate
                ? selectDate < todayDate
                : selectDate > todayDate;
          }}
          defaultMonth={date}
        />
      </PopoverContent>
    </Popover>
  );
}
