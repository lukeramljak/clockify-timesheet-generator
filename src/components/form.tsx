import { Button } from "@/components/ui/button";
import getTimeEntries from "@/services/get-time-entries";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { DatePickerWithRange } from "./date-picker";
import { useUser } from "@/context/user-context";
import { Label } from "./ui/label";
import exportToExcel from "@/helpers/export";
import { Input } from "./ui/input";

const Form = () => {
  const [selectedDate, setSelectedDate] = useState<DateRange | undefined>();
  const { user, setUser } = useUser();
  const { resource, callNo, userId, workspaceId, apiKey } = user;
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
      exportToExcel(resource, callNo, timeEntries, endDate);
    } catch (error) {
      console.error("Error fetching time entries:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Label htmlFor="resource">Resource</Label>
      <Input
        type="text"
        name="resource"
        maxLength={3}
        defaultValue={resource}
        required
        onChange={(e) => setUser({ ...user, resource: e.target.value })}
      />
      <Label htmlFor="callNo">Call No</Label>
      <Input
        type="text"
        name="callNo"
        defaultValue={callNo}
        required
        onChange={(e) => setUser({ ...user, callNo: e.target.value })}
      />
      <Label>Date Range</Label>
      <DatePickerWithRange onSelectDateRange={setSelectedDate} />
      <Button type="submit">Generate</Button>
    </form>
  );
};

export default Form;
