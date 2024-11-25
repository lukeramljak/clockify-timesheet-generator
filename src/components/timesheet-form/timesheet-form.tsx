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
import { exportToExcel } from "@/helpers/export";
import { formatTimeEntries } from "@/helpers/time-entries";
import { useUserStore } from "@/store";
import { zodResolver } from "@hookform/resolvers/zod";
import Clockify from "clockify-ts";
import { format } from "date-fns";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  resource: z
    .string()
    .min(3, { message: "Must be 3 characters" })
    .max(3, { message: "Must be 3 characters" })
    .regex(/^[A-Z]+$/, { message: "Must be all caps" }),
  callNo: z
    .string()
    .min(8, { message: "Must be 8 characters" })
    .max(8, { message: "Must be 8 characters" })
    .regex(/^net\d{5}$/, { message: "Invalid format" }),
  weekEnding: z.date(),
  includeProject: z.boolean(),
});

export const TimesheetForm = () => {
  const [isExporting, setIsExporting] = useState(false);

  const userId = useUserStore((state) => state.userId);
  const workspaceId = useUserStore((state) => state.workspaceId);
  const apiKey = useUserStore((state) => state.apiKey);
  const resource = useUserStore((state) => state.resource);
  const callNo = useUserStore((state) => state.callNo);
  const prefersProjectName = useUserStore((state) => state.prefersProjectName);
  const setResource = useUserStore((state) => state.setResource);
  const setCallNo = useUserStore((state) => state.setCallNo);
  const setProjects = useUserStore((state) => state.setProjects);
  const setPrefersProjectName = useUserStore(
    (state) => state.setPrefersProjectName,
  );
  const reset = useUserStore((state) => state.reset);

  const clockify = new Clockify(apiKey);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      resource: resource,
      callNo: callNo,
      weekEnding: undefined,
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
                new Date(data.weekEnding),
                "yyyy-MM-dd'T'23:59:59.999'Z'",
              ),
            }),
          clockify.workspace.withId(workspaceId).projects.get(),
        ]);

        setResource(data.resource);
        setCallNo(data.callNo);
        setProjects(projects);
        setPrefersProjectName(data.includeProject);

        timeEntries.forEach((entry) => {
          if (!entry.timeInterval.duration) {
            throw new Error(
              "Unable to generate timesheet with an active timer",
            );
          }
        });

        const formattedTimeEntries = formatTimeEntries(
          {
            resource: data.resource,
            callNo: data.callNo,
            projects,
            prefersProjectName: data.includeProject,
          },
          timeEntries,
        );

        await exportToExcel(formattedTimeEntries, data.weekEnding);
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <Button
        variant={"link"}
        className="absolute top-4 right-4"
        onClick={() => reset()}
      >
        Clear API Key
      </Button>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
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
            name="weekEnding"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Week Ending</FormLabel>
                <FormControl>
                  <DatePicker {...field} />
                </FormControl>
                <FormMessage />
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
