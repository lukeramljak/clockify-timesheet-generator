import { Button } from "@/components/ui/button";
import { useUser } from "@/context/user-context";
import exportToExcel from "@/helpers/export";
import mostRecentFriday from "@/helpers/most-recent-friday";
import Clockify from "clockify-ts";
import { format } from "date-fns";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { DatePicker } from "./date-picker";
import HelpDialog from "./help-dialog";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

const Form = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    mostRecentFriday,
  );
  const [isExporting, setIsExporting] = useState(false);
  const { user, setUser } = useUser();
  const { resource, callNo, userId, workspaceId, apiKey } = user;
  const { handleSubmit } = useForm();
  const [includeProject, setIncludeProject] = useState(
    user.prefersProjectName || false,
  );
  const clockify = new Clockify(apiKey ?? "");

  const onSubmit = async () => {
    try {
      setIsExporting(true);
      if (resource && userId && callNo && workspaceId && selectedDate) {
        const [timeEntries, projects] = await Promise.all([
          clockify.workspace
            .withId(workspaceId)
            .users.withId(userId)
            .timeEntries.get({
              "get-week-before": format(
                new Date(selectedDate),
                "yyyy-MM-dd'T'23:59:59.999'Z'",
              ),
            }),
          clockify.workspace.withId(workspaceId).projects.get(),
        ]);

        setUser((prev) => ({ ...prev, projects: projects }));

        exportToExcel(
          resource,
          callNo,
          timeEntries,
          selectedDate,
          includeProject,
        );
      }
    } catch (error) {
      console.error("Error fetching time entries:", error);
    }
    setIsExporting(false);
  };

  const handleCheckboxChange = (isChecked: boolean) => {
    setIncludeProject(isChecked);
    setUser((prev) => ({ ...prev, prefersProjectName: isChecked }));
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
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
      <Label>Week Ending</Label>
      <DatePicker onSelectDate={handleDateSelect} />
      <div className="flex items-center gap-2">
        <Checkbox
          name="project"
          id="project"
          checked={includeProject}
          onCheckedChange={handleCheckboxChange}
        />
        <Label htmlFor="project">Include project name</Label>
      </div>
      <Button type="submit">{isExporting ? "Exporting..." : "Export"}</Button>
      <HelpDialog />
    </form>
  );
};

export default Form;
