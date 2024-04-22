import { CalendarIcon } from "@radix-ui/react-icons";
import { format, isFriday } from "date-fns";
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
  onSelectDate: (date: Date | undefined) => void;
}

export function DatePicker({
  className,
  onSelectDate,
}: DatePickerWithRangeProps) {
  const [date, setDate] = React.useState<Date | undefined>(undefined);

  const disabledDays = (date: Date) => {
    return !isFriday(date);
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
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
            {date ? format(date, "dd/MM/yyyy") : <span>dd / mm / yyyy</span>}
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
