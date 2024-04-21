import { CalendarIcon } from "@radix-ui/react-icons";
import { addDays, format, isFriday, isMonday, startOfWeek } from "date-fns";
import * as React from "react";
import { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerWithRangeProps {
  className?: string;
  onSelectDateRange: (dateRange: DateRange | undefined) => void;
}

export function DatePickerWithRange({
  className,
  onSelectDateRange,
}: DatePickerWithRangeProps) {
  const [date, setDate] = React.useState<DateRange | undefined>(() => {
    const start = startOfWeek(new Date());
    let monday = start;
    while (!isMonday(monday)) {
      monday = addDays(monday, 1);
    }
    let friday = start;
    while (!isFriday(friday)) {
      friday = addDays(friday, 1);
    }
    return { from: monday, to: friday };
  });

  const handleDateSelect = (selectedDate: DateRange) => {
    setDate(selectedDate);
    onSelectDateRange(selectedDate);
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-auto justify-start text-left font-normal",
              !date && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleDateSelect}
            numberOfMonths={1}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
