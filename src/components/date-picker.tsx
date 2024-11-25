import { forwardRef } from "react";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format, isFriday } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  id?: string;
  value?: Date;
  onChange?: (newValue: Date | undefined) => void;
  className?: string;
}

export const DatePicker = forwardRef<HTMLDivElement, DatePickerProps>(
  ({ id, value, onChange, className, ...props }, ref) => {
    const disabledDays = (date: Date) => {
      return !isFriday(date);
    };

    return (
      <div ref={ref} className={cn("grid gap-2", className)} {...props}>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id={id}
              variant="outline"
              className={cn(
                "w-auto justify-start text-left font-normal",
                !value && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {value ? (
                format(value, "dd/MM/yyyy")
              ) : (
                <span>dd / mm / yyyy</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              ISOWeek
              mode="single"
              selected={value}
              disabled={disabledDays}
              onSelect={onChange}
            />
          </PopoverContent>
        </Popover>
      </div>
    );
  },
);

DatePicker.displayName = "DatePicker";
