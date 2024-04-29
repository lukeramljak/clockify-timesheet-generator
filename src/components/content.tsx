import { useUserStore } from "@/store";
import ApiKeyInput from "./api-key-input";
import TimesheetForm from "./form";

const Content = () => {
  const apiKey = useUserStore((state) => state.apiKey);

  return (
    <div className="h-full flex flex-col items-center justify-center gap-4">
      {!apiKey ? <ApiKeyInput /> : <TimesheetForm />}
    </div>
  );
};

export default Content;
