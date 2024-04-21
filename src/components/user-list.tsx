import { Check, ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CommandList } from "cmdk";
import { useEffect, useState } from "react";
import { ScrollArea } from "./ui/scroll-area";
import getAllUsers from "@/services/get-all-users";
import { useForm } from "react-hook-form";
import getTimeEntries from "@/services/get-time-entries";
import { DatePickerWithRange } from "./date-picker";
import exportToExcel from "@/helpers/export";

interface User {
  id: string;
  name: string;
}

const UserList = () => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [selectedDate, setSelectedDate] = useState<DateRange | undefined>();
  const [timeEntries, setTimeEntries] = useState([]);
  const { handleSubmit, register, setValue: setFormValue } = useForm<User>();

  useEffect(() => {
    getAllUsers().then((res) => {
      setUsers(res);
    });
  }, []);

  const onSubmit = async (data: User) => {
    try {
      const startDate = selectedDate?.from
        ? selectedDate.from.toISOString()
        : undefined;
      const endDate = selectedDate?.to
        ? selectedDate.to.toISOString()
        : undefined;
      const entries = await getTimeEntries(data.id, startDate, endDate);
      setTimeEntries(entries);
      console.log(timeEntries);
    } catch (error) {
      console.error("Error fetching time entries:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[280px] justify-between"
          >
            {value
              ? users.find((user) => user.id === value)?.name
              : "Select user..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-0">
          <Command>
            <CommandInput placeholder="Search user..." />
            <CommandList>
              <CommandEmpty>No users found.</CommandEmpty>
              <CommandGroup>
                {/* FIXME: Add search functionality */}
                <ScrollArea className="h-64">
                  {users.map((user) => (
                    <CommandItem
                      key={user.id}
                      value={user.id}
                      {...register("id")}
                      onSelect={(currentValue) => {
                        setFormValue(
                          "id",
                          currentValue === value ? "" : user.id,
                        );
                        setValue(currentValue === value ? "" : currentValue);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === user.id ? "opacity-100" : "opacity-0",
                        )}
                      />
                      {user.name}
                    </CommandItem>
                  ))}
                </ScrollArea>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <DatePickerWithRange onSelectDateRange={setSelectedDate} />
      <Button onClick={() => exportToExcel(timeEntries)}>Generate</Button>
    </form>
  );
};

export default UserList;
