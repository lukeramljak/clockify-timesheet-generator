import { CalendarIcon } from "@radix-ui/react-icons";
import { addDays, format, isAfter, isFriday } from "date-fns";
import * as React from "react";

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
  onSelectDate: (date: Date) => void;
}

export function DatePicker({
  className,
  onSelectDate,
}: DatePickerWithRangeProps) {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const today = new Date();

  const disabledDays = (date) => {
    if (isAfter(date, today)) return true;
    return !isFriday(date);
  };

  const handleDateSelect = (selectedDate: Date) => {
    setDate(selectedDate);
    onSelectDate(selectedDate);
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
            {date ? format(date, "dd/MM/yyyy") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            ISOWeek
            mode="single"
            selected={date}
            disabled={disabledDays}
            onSelect={handleDateSelect}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
