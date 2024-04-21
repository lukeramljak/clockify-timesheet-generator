import { Button } from "@/components/ui/button";
import getTimeEntries from "@/services/get-time-entries";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { DatePickerWithRange } from "./date-picker";
import { useUser } from "@/context/user-context";
import { Label } from "./ui/label";

const Form = () => {
  const [selectedDate, setSelectedDate] = useState<DateRange | undefined>();
  const { user } = useUser();
  const { apiKey, userId, workspaceId } = user;
  const { handleSubmit } = useForm();

  const onSubmit = async () => {
    try {
      const startDate = selectedDate?.from
        ? selectedDate.from.toISOString()
        : undefined;
      const endDate = selectedDate?.to
        ? selectedDate.to.toISOString()
        : undefined;
      const timeEntries = await getTimeEntries(
        apiKey,
        userId,
        workspaceId,
        startDate,
        endDate,
      );
      console.log(timeEntries);
    } catch (error) {
      console.error("Error fetching time entries:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Label>Date Range</Label>
      <DatePickerWithRange onSelectDateRange={setSelectedDate} />
      <Button>Generate</Button>
    </form>
  );
};

export default Form;
