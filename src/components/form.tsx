import { DatePicker } from "@/components/date-picker";
import HelpDialog from "@/components/help-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import exportToExcel from "@/helpers/export";
import formatTimeEntries from "@/helpers/format-time-entries";
import { useUserStore } from "@/store";
import { zodResolver } from "@hookform/resolvers/zod";
import Clockify from "clockify-ts";
import { format } from "date-fns";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  resource: z.string().regex(/^[A-Z]+$/, { message: "Must be all caps" }),
  callNo: z.string().regex(/^net\d{5}$/, { message: "Invalid format" }),
  date: z.date(),
  includeProject: z.boolean(),
});

const TimesheetForm = () => {
  const [isExporting, setIsExporting] = useState(false);
  const {
    userId,
    workspaceId,
    apiKey,
    resource,
    callNo,
    prefersProjectName,
    setResource,
    setApiKey,
    setCallNo,
    setProjects,
    setPrefersProjectName,
  } = useUserStore();
  const clockify = new Clockify(apiKey);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      resource: resource,
      callNo: callNo,
      date: undefined,
      includeProject: prefersProjectName || false,
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsExporting(true);

    try {
      if (userId && workspaceId) {
        const [timeEntries, projects] = await Promise.all([
          clockify.workspace
            .withId(workspaceId)
            .users.withId(userId)
            .timeEntries.get({
              "get-week-before": format(
                new Date(data.date),
                "yyyy-MM-dd'T'23:59:59.999'Z'"
              ),
            }),
          clockify.workspace.withId(workspaceId).projects.get(),
        ]);

        setResource(data.resource);
        setCallNo(data.callNo);
        setProjects(projects);
        setPrefersProjectName(data.includeProject);

        const formattedTimeEntries = formatTimeEntries(timeEntries);

        await exportToExcel(formattedTimeEntries, data.date);

        setIsExporting(false);
      }
    } catch (error) {
      console.error("Error fetching time entries:", error);
    }
  };

  return (
    <>
      <Button
        variant={"link"}
        className="absolute top-4 right-4"
        onClick={() => setApiKey("")}>
        Clear API Key
      </Button>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="resource"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Resource</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="callNo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Call No</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Week Ending</FormLabel>
                <FormControl>
                  <DatePicker field={field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="includeProject"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>Include project name</FormLabel>
                </div>
              </FormItem>
            )}
          />
          <Button type="submit">
            {isExporting ? "Exporting..." : "Export"}
          </Button>
          <HelpDialog />
        </form>
      </Form>
    </>
  );
};

export default TimesheetForm;
