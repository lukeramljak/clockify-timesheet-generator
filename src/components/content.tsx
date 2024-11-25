import { useUserStore } from "@/store";
import { ApiKeyInput } from "@/components/api-key-input/api-key-input";
import { TimesheetForm } from "@/components/timesheet-form/timesheet-form";

export const Content = () => {
  const apiKey = useUserStore((state) => state.apiKey);

  return (
    <div className="h-full flex flex-col items-center justify-center gap-4">
      {!apiKey ? <ApiKeyInput /> : <TimesheetForm />}
    </div>
  );
};
