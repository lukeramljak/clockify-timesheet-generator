import HelpDialog from "@/components/help-dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { exportToExcel } from "@/helpers/export";
import { formatTimeEntries } from "@/helpers/time-entries";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store";
import { zodResolver } from "@hookform/resolvers/zod";
import Clockify from "clockify-ts";
import { format, isFriday } from "date-fns";
import { CalendarIcon } from "lucide-react";
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

  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const resetUser = useUserStore((state) => state.resetUser);

  const clockify = new Clockify(user.apiKey);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      resource: user.resource,
      callNo: user.callNo,
      weekEnding: undefined,
      includeProject: user.prefersProjectName || false,
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsExporting(true);

    try {
      if (user.userId && user.workspaceId) {
        const [timeEntries, projects] = await Promise.all([
          clockify.workspace
            .withId(user.workspaceId)
            .users.withId(user.userId)
            .timeEntries.get({
              "get-week-before": format(
                new Date(data.weekEnding),
                "yyyy-MM-dd'T'23:59:59.999'Z'",
              ),
            }),
          clockify.workspace.withId(user.workspaceId).projects.get(),
        ]);

        setUser({
          resource: data.resource,
          callNo: data.callNo,
          projects,
          prefersProjectName: data.includeProject,
        });

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
        onClick={resetUser}
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
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] pl-3 text-left font-normal hover:text-muted-foreground",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => !isFriday(date)}
                      autoFocus={true}
                    />
                  </PopoverContent>
                </Popover>
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
