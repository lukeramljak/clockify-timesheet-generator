import { useUser } from "@/context/user-context";
import ApiKeyInput from "./api-key-input";
import TimesheetForm from "./form";

const Content = () => {
  const { user } = useUser();

  return (
    <div className="h-full flex flex-col items-center justify-center gap-4">
      {!user.apiKey ? <ApiKeyInput /> : <TimesheetForm />}
    </div>
  );
};

export default Content;
