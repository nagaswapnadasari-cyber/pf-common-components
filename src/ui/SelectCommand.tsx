"use client";

import CrossIcon from "../assets/CrossIcon";
import DropDownArrow from "../assets/DropDown";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Command as CommandPrimitive, useCommandState } from "cmdk";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import * as React from "react";
import { useRef } from "react";
import { cn } from "../lib/utils";
import { Button } from "./button";
import { ccn } from "../lib/CommonComponentsUtil";
import { Input } from "./input";
type DropDownContextType = {
  value: any;
  onChange: (key: any) => void;
  selectedLabel: string;
  setSelectedLabel: any;
  isLoading?: boolean;
  isFiltering?: boolean;
  searchValue: string;
  setSearchValue: any;
  open: boolean;
  defaultOptions?: any;
  triggerRef: React.RefObject<HTMLButtonElement> | null;
  contentWidth: number | string;
  setContentWidth: any;
  secured?: boolean;
  showSeparator?: boolean;
};

// Here we have to create the context for sending the data to child components
const dropDownContext = React.createContext<DropDownContextType>({
  value: null,
  onChange: () => { },
  selectedLabel: "",
  setSelectedLabel: () => { },
  isFiltering: false,
  searchValue: "",
  setSearchValue: () => { },
  isLoading: false,
  open: false,
  defaultOptions: [],
  triggerRef: null,
  contentWidth: 0,
  setContentWidth: () => { },
  secured: false,
  showSeparator: true,
});

const MVPSelect = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Root> & {
    value?: any;
    onChange?: (value: string) => void;
    isFiltering?: boolean;
    isLoading?: boolean;
    defaultOptions?: any;
    secured?: boolean;
    showSeparator?: boolean;
  }
>(
  (
    {
      value,
      onChange,
      isFiltering,
      isLoading,
      secured = false,
      defaultOptions = [],
      showSeparator = true,
      ...props
    },
    ref
  ) => {
    // to track whether to show the list of options in the dropdown or not
    const [open, setOpen] = React.useState(false);

    const [searchValue, setSearchValue] = React.useState("");

    /**
     * while selecting any item in the options then we have to close the popover
     * @param val
     */

    const handleClick = (open: boolean) => {
      setOpen(open);
    };

    /**
     * while selecting any item in the options then we have to store the id of the item and along with we have to close the popover
     * @param val
     */

    const handleChange = (val: any) => {
      onChange && onChange(val);
      handleClick(false);
    };

    //we have to take the selected label and store in it to display it in the input
    const [selectedLabel, setSelectedLabel] = React.useState("");
    const triggerRef = useRef<HTMLButtonElement>(null);
    const [contentWidth, setContentWidth] = React.useState("auto");

    React.useEffect(() => {
      const updateContentWidth = () => {
        setContentWidth(`${triggerRef.current?.offsetWidth}px`);
      };

      window.addEventListener("resize", updateContentWidth);
      updateContentWidth(); // Call initially to set the width

      return () => window.removeEventListener("resize", updateContentWidth);
    }, []);

    return (
      <dropDownContext.Provider
        value={{
          value,
          onChange: handleChange,
          selectedLabel,
          setSelectedLabel,
          searchValue,
          setSearchValue,
          isLoading,
          isFiltering,
          open,
          defaultOptions,
          triggerRef,
          setContentWidth,
          contentWidth,
          secured,
          showSeparator,
        }}
      >
        <PopoverPrimitive.Root
          open={open}
          onOpenChange={handleClick}
          {...props}
        />
      </dropDownContext.Provider>
    );
  }
);

MVPSelect.displayName = "MVPSelect";

const Trigger = PopoverPrimitive.Trigger;

const MVPSelectTrigger = React.forwardRef<
  React.ElementRef<typeof Trigger>,
  {
    placeholder: string;
    error?: boolean;
    disable?: boolean;
    className?: string;
    crossIcon?: boolean;
    /**
     * endIcon is optional Field, so that any one can send the component whatever they want to show beside the cross icon
     */
    endIcon?: React.ReactNode;
  } & React.ComponentPropsWithoutRef<typeof Trigger>
>(
  (
    {
      placeholder,
      error,
      disable,
      className,
      endIcon,
      crossIcon = true,
      ...props
    },
    ref
  ) => {
    const {
      selectedLabel,
      onChange,
      setSelectedLabel,
      defaultOptions,
      triggerRef,
      setContentWidth,
      value,
    } = React.useContext(dropDownContext);

    React.useEffect(() => {
      if (triggerRef && triggerRef.current) {
        setContentWidth(`${triggerRef.current.offsetWidth}px`);
      }
    }, []);

    React.useEffect(() => {
      if (defaultOptions && defaultOptions.length > 0) {
        setSelectedLabel(defaultOptions[0].label);
      } else if (defaultOptions.length === 0) {
        setSelectedLabel("");
      }
    }, [JSON.stringify(defaultOptions)]);

    return (
      <Trigger ref={triggerRef} asChild>
        <Button
          disabled={disable}
          ref={ref}
          variant="outline"
          type="button"
          role="combobox"
          // aria-expanded={open}
          className={cn(
            "min-w-69 w-full justify-between gap-0 px-3 py-2",
            className,
            ccn(error, value)
          )}
          {...props}
        >
          {/** Here when we select the item in options we have to show the corresponding label instead of placeholder */}
          {
            // Requirement: We have to display light color placeholder if user has not selcted the value
            // Implementation: We have taken one context to access the value of select inside children compound components
            // Condition: when value is null or undefined or empty string then display light color
          }
          <div
            className={
              selectedLabel === "" ||
                selectedLabel === undefined ||
                selectedLabel === null
                ? "truncate font-normal text-[#999999]"
                : "truncate"
            }
          >
            {selectedLabel || placeholder}
          </div>

          {selectedLabel && crossIcon ? (
            <div className="flex items-center gap-1">
              {/**
               * endIcon is optional Field, so that any one can send the component whatever they want to show beside the cross icon
               * we are calling endIcon here to show view contact beside the cross icon in manual registration
               */}
              {endIcon && (
                <div
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent the outer button's click event
                  }}
                >
                  {endIcon}
                </div>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent the outer button's click event
                  onChange && onChange("");
                  setSelectedLabel(null);
                }}
                type="button"
                className={cn(
                  "h-5 w-5 focus:outline-keyboardTab",
                  disable && "cursor-not-allowed"
                )}
              >
                <CrossIcon height={10} className="text-grey" />
              </button>
            </div>
          ) : (
            <DropDownArrow />
          )}
        </Button>
      </Trigger>
    );
  }
);
MVPSelectTrigger.displayName = "MVPSelectTrigger";

const MVPSelectContent = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => {
  const { contentWidth } = React.useContext(dropDownContext);

  return (
    <PopoverPrimitive.Content
      ref={ref}
      //   align={align}
      //   sideOffset={sideOffset}
      className={cn(
        "min-w-69 z-50 mt-0.5 rounded-xl border bg-popover text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      style={{ width: contentWidth }}
      {...props}
    >
      <CommandPrimitive
        ref={ref}
        className={cn(
          "flex h-full w-full flex-col overflow-hidden rounded-xl bg-popover text-popover-foreground",
          className
        )}
        shouldFilter={false}
        {...props}
      />
    </PopoverPrimitive.Content>
  );
});
MVPSelectContent.displayName = CommandPrimitive.displayName;

const MVPSelectLoading = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Loading>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Loading>
>(({ ...props }, ref) => <CommandPrimitive.Loading ref={ref} {...props} />);

MVPSelectLoading.displayName = CommandPrimitive.Loading.displayName;

const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      "overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground",
      className
    )}
    {...props}
  />
));

CommandGroup.displayName = CommandPrimitive.Group.displayName;

const MVPSelectInput = React.forwardRef<
  React.ElementRef<typeof Input>,
  React.ComponentPropsWithoutRef<typeof Input> & {
    onValueChange?: (val: string) => void;
  }
>(({ className, onValueChange, ...props }, ref) => {
  const { setSearchValue, open } = React.useContext(dropDownContext);
  const { t } = useTranslation("bx_v1");

  React.useEffect(() => {
    if (open == false) {
      onValueChange?.("");
      setSearchValue("");
    }
  }, [open]);

  return (
    <div className="flex h-[44px] items-center rounded-[12px] border-b border-gray-200 px-3">
      <Input
        ref={ref}
        className={cn(
          "flex !h-11 w-full rounded-md border-none bg-transparent px-2 py-3 text-sm font-medium text-[#999999] !outline-none placeholder:font-[400] placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        onChange={(value) => {
          setSearchValue(value.target.value);
          onValueChange && onValueChange(value.target.value);
        }}
        {...props}
        placeholder={props?.placeholder ? props?.placeholder : t("cm_search")}
      />
      <Search className="borde-[2px] mr-2 h-4 w-4 shrink-0 text-primary" />
    </div>
  );
});

MVPSelectInput.displayName = CommandPrimitive.Input.displayName;

const MVPSelectItems = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List> & {
    onBottomReached?: () => void;
    minLenToSearch?: number;
  }
>(({ className, onBottomReached, minLenToSearch = 1, ...props }, ref) => {
  const listRef = React.useRef<HTMLDivElement | null>(null);

  const { isLoading, isFiltering, searchValue, secured } =
    React.useContext(dropDownContext);

  const [isLoadingMore, setIsLoadingMore] = React.useState(false);

  const handleScroll = React.useCallback(() => {
    const listElement = listRef.current;

    if (listElement) {
      const { scrollTop, scrollHeight, clientHeight } = listElement;

      const tolerance = 2;

      const isAtBottom = scrollHeight - (scrollTop + clientHeight) <= tolerance;

      if (isAtBottom) {
        setIsLoadingMore(true);
        onBottomReached && onBottomReached();
      }
    }
  }, [onBottomReached]);

  React.useEffect(() => {
    if (isFiltering === false && isLoadingMore) {
      setIsLoadingMore(false);
    }
  }, [isFiltering]);

  React.useEffect(() => {
    const listElement = listRef.current;
    if (listElement) {
      listElement.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (listElement) {
        listElement.removeEventListener("scroll", handleScroll);
      }
    };
  }, [handleScroll]);

  return (
    <CommandPrimitive.List
      ref={(el) => {
        listRef.current = el;
        if (typeof ref === "function") {
          ref(el);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
        }
      }}
      className={cn(
        "max-h-[224px] overflow-y-auto overflow-x-hidden",
        className
      )}
      {...props}
    >
      {!(secured && searchValue?.length < minLenToSearch) && (
        /**
         * Ticket #4235:  We are using this condition for user security purposes.
         *
         * When the dropdown is in a secured state (secured is true) and the
         * search term is empty (searchValue is ""):
         * - We do not display any items to the user.
         *
         * This prevents exposing all available options without any filtering,
         * ensuring that only relevant items are shown based on the user's input.
         */
        <>
          {isLoading || (isFiltering && isLoadingMore === false) ? (
            <div className="my-[10px] flex max-h-48 items-center justify-center">
              <div className="loader-small">
                <div className="loader"></div>
              </div>
            </div>
          ) : (
            <>
              <MVPSelectEmpty />
              {props.children}
            </>
          )}
        </>
      )}
    </CommandPrimitive.List>
  );
});

MVPSelectItems.displayName = CommandPrimitive.List.displayName;

const MVPSelectEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => {
  const { searchValue } = React.useContext(dropDownContext);
  const { t } = useTranslation("bx_v1");

  return (
    <CommandEmpty ref={ref} className="py-6 text-center text-sm font-medium">
      {searchValue ? t("cm_no_search_results_found") : t("cm_no_data")}
    </CommandEmpty>
  );
});

//Command Empty will not render initially, so we have return a custom function to render initially

const CommandEmpty = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof CommandPrimitive.Empty>
>(({ className, ...props }, forwardedRef) => {
  const render = useCommandState((state) => state.filtered.count === 0);

  if (!render) return null;

  return (
    <div
      ref={forwardedRef}
      className={cn("py-6 text-center text-sm", className)}
      cmdk-empty=""
      role="presentation"
      {...props}
    />
  );
});

MVPSelectEmpty.displayName = CommandPrimitive.Empty.displayName;

const MVPSelectSeparator = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={cn("mx-[5px] h-[0.8px] bg-border", className)}
    {...props}
  />
));
MVPSelectSeparator.displayName = CommandPrimitive.Separator.displayName;

const MVPSelectItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item> & {
    label: string;
  }
>(({ className, value, label, children, ...props }, ref) => {
  const { onChange, setSelectedLabel }: DropDownContextType =
    React.useContext(dropDownContext);

  const handleSelect = (val: string) => {
    let selectedValue = val;
    try {
      selectedValue = JSON.parse(selectedValue);
    } catch (error) { }

    setSelectedLabel(label);
    onChange && onChange(selectedValue as any);
  };

  const { showSeparator } = React.useContext(dropDownContext);

  return (
    <>
      <CommandPrimitive.Item
        ref={ref}
        className={cn(
          "relative flex min-h-[44px] cursor-default select-none items-center px-5 py-1.5 text-sm font-semibold text-[#414141] outline-none hover:bg-[#7677F4]/10 aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[selected=true]:bg-accent data-[disabled]:opacity-50",
          className
        )}
        {...props}
        value={typeof value === "string" ? value : JSON.stringify(value)}
        onSelect={handleSelect}
      >
        <div className="line-clamp-2">{children}</div>
      </CommandPrimitive.Item>
      {showSeparator && <MVPSelectSeparator alwaysRender />}
    </>
  );
});

MVPSelectItem.displayName = CommandPrimitive.Item.displayName;

const CommandShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground",
        className
      )}
      {...props}
    />
  );
};
CommandShortcut.displayName = "CommandShortcut";

export {
  CommandShortcut,
  MVPSelect,
  MVPSelectContent,
  MVPSelectEmpty,
  MVPSelectInput,
  MVPSelectItem,
  MVPSelectItems,
  MVPSelectLoading,
  MVPSelectSeparator,
  MVPSelectTrigger,
};
