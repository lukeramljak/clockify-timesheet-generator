import { Button } from "@/components/ui/button";
import getTimeEntries from "@/services/get-time-entries";
import { useForm } from "react-hook-form";
import { DatePicker } from "./date-picker";
import { useUser } from "@/context/user-context";
import { Label } from "./ui/label";
import exportToExcel from "@/helpers/export";
import { Input } from "./ui/input";
import { useState } from "react";
import HelpDialog from "./help-dialog";

const Form = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [isExporting, setIsExporting] = useState(false);
  const { user, setUser } = useUser();
  const { resource, callNo, userId, workspaceId, apiKey } = user;
  const { handleSubmit } = useForm();

  const onSubmit = async () => {
    try {
      setIsExporting(true);
      const timeEntries = await getTimeEntries(
        apiKey,
        userId,
        workspaceId,
        selectedDate,
      );
      exportToExcel(resource, callNo, timeEntries, selectedDate);
    } catch (error) {
      console.error("Error fetching time entries:", error);
    }
    setIsExporting(false);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">Timesheet Generator</h1>
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
      <Label>Week Ending</Label>
      <DatePicker onSelectDate={handleDateSelect} />
      <Button type="submit">{isExporting ? "Exporting..." : "Export"}</Button>
      <HelpDialog />
    </form>
  );
};

export default Form;
