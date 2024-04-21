import { useUser } from "@/context/user-context";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "@/components/ui/label";
import { useForm, SubmitHandler } from "react-hook-form";
import getUser from "@/services/get-user";

type Inputs = {
  apiKey: string;
};

const ApiKeyInput = () => {
  const { setUser } = useUser();
  const { register, handleSubmit } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = (data: Inputs) => {
    getUser(data.apiKey).then((res) => {
      setUser({
        name: res?.name,
        userId: res?.id,
        workspaceId: res?.defaultWorkspace,
        apiKey: data.apiKey,
      });
    });
  };

  return (
    <div className="w-full max-w-sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
        <div>
          <Label htmlFor="apiKey">Clockify API Key</Label>
          <p className="text-xs text-muted-foreground">
            Get one at{" "}
            <a
              className="underline"
              href="https://clockify.me/user/settings"
              target="_blank"
            >
              https://clockify.me/user/settings
            </a>
          </p>
        </div>
        <div className="flex gap-2">
          <Input
            required
            placeholder="Enter API key..."
            {...register("apiKey")}
          />
          <Button type="submit">Submit</Button>
        </div>
      </form>
    </div>
  );
};

export default ApiKeyInput;
