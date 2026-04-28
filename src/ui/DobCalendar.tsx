import classNames from "classnames";
import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";
import {
  DayKeyboardEventHandler,
  DayPicker,
  DropdownProps,
} from "react-day-picker";
import { buttonVariants } from "./button";
import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItems,
  SelectTrigger,
  SelectValue,
} from "./select";
import {
  formatLocalizedMonth,
  formatLocalizedWeekday,
  getDateFnsLocale,
} from "../lib/i18n";
import { cn } from "../lib/utils";
export type CalendarProps = React.ComponentProps<typeof DayPicker>;

/**
 * This is the function,contains a select dropdowns of list of months and year, a previous and next buttons
 * @param showOutsideDays boolean which represents whether to show outside month days or not
 * @param formatters  represents format of displaying the week days
 * @param classnames represents the stylings of complete calendar
 * @param components we can add extra components if needed into the calender
 * @returns the calender to select the date with month and year dropdowns
 */
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const { i18n } = useTranslation();
  const locale = i18n?.language ?? "en";
  const localeObject = getDateFnsLocale(locale);
  
  const formatWeekdayName = (date: Date) => {
    return formatLocalizedWeekday(date, locale, "narrow");
  };

  const handleDayKeyDown: DayKeyboardEventHandler = (day, modifiers, event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const customEvent = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
      });
      const dayElement = event.target as HTMLElement;
      dayElement.dispatchEvent(customEvent);
    }
  };

  return (
    <DayPicker
      locale={localeObject}
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      formatters={{ formatWeekdayName }}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center relative items-center",
        caption_label: "hidden",
        caption_dropdowns: "flex justify-center gap-2",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-100 !size-[30px] border rounded-[10px]"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex w-1 gap-[25px] px-3 ",
        head_cell: "text-foreground rounded-full w-9 font-semibold text-sm",
        cell: "h-9 w-9 text-center text-sm !rounded-full p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent disabled:bg-transparent rounded-full"
        ),
        day_selected:
          "!bg-primary !rounded-full !size-[33px] text-white hover:!bg-primary",
        day_today:
          "bg-accent text-accent-foreground !rounded-full !size-[33px] ",
        ...classNames,
      }}
      components={{
        Dropdown: ({ value, onChange, children, ...props }) => (
          <YearsAndMonthsDropdown {...props} value={value} onChange={onChange}>
            {children}
          </YearsAndMonthsDropdown>
        ),
        IconLeft: () => <ChevronLeft className="size-4 text-foreground" />,
        IconRight: () => <ChevronRight className="size-4 text-foreground" />,
      }}
      onDayKeyDown={handleDayKeyDown}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export const YearsAndMonthsDropdown = ({
  value,
  onChange,
  children,
  ...props
}: DropdownProps) => {
  const { i18n } = useTranslation();
  const locale = i18n?.language ?? "en";
  const selectClasses = classNames(
    "pr-1.5 h-[30px] text-sm font-semibold focus:border-transparent focus:bg-primary/10 focus:text-primary outline-none border-secondary/20 text-foreground",
    {
      "rounded-l-[10px] rounded-r-none": props?.name === "months",
    },
    { "rounded-l-none rounded-r-[10px]": props?.name === "years" }
  );

  const options = React.Children.toArray(children) as React.ReactElement<
    React.HTMLProps<HTMLOptionElement>
  >[];
  const selected = options.find((child) => child.props.value === value);

  const handleChange = (value: string) => {
    const changeEvent = {
      target: { value },
    } as React.ChangeEvent<HTMLSelectElement>;
    onChange?.(changeEvent);
  };

  return (
    <div className="border-1 rounded-lg border">
      <Select
        value={value?.toString()}
        onValueChange={(value: unknown) => {
          handleChange(value as string);
        }}
      >
        <SelectTrigger className={selectClasses}>
          <SelectValue>
            {props.name === "months"
              ? formatLocalizedMonth(
                  new Date(2000, Number(selected?.props?.value ?? value ?? 0), 1),
                  locale,
                  "short"
                )
              : selected?.props?.children?.toString()}
          </SelectValue>
        </SelectTrigger>
        <SelectContent
          position="popper"
          className="scrollbar max-h-[400px] max-h-[var(--radix-popper-available-height);] overflow-y-auto capitalize"
        >
          <SelectItems>
            {options.map((option, id: number) => (
              <SelectItem
                key={`${option.props.value}-${id}`}
                value={option.props.value?.toString() ?? ""}
              >
                {props.name === "months"
                  ? formatLocalizedMonth(
                      new Date(2000, Number(option.props.value ?? 0), 1),
                      locale,
                      "short"
                    )
                  : option.props.children?.toString()}
              </SelectItem>
            ))}
          </SelectItems>
        </SelectContent>
      </Select>
    </div>
  );
};

export { Calendar };
