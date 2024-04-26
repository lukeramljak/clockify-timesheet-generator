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

interface DateField {
  value: Date;
  onChange: (newValue: Date | undefined) => void;
}

interface DatePickerWithRangeProps {
  className?: string;
  field: DateField;
}

export function DatePicker({ className, field }: DatePickerWithRangeProps) {
  const disabledDays = (date: Date) => {
    return !isFriday(date);
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
              !field.value && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {field.value ? (
              format(field.value, "dd/MM/yyyy")
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
            selected={field.value}
            disabled={disabledDays}
            onSelect={field.onChange}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
