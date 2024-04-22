import { Label } from "@/components/ui/label";
import { useUser } from "@/context/user-context";
import getUser from "@/services/get-user";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

type Inputs = {
  apiKey: string;
};

const ApiKeyInput = () => {
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useUser();
  const { register, handleSubmit } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = (data: Inputs) => {
    setIsLoading(true);
    getUser(data.apiKey).then((res) => {
      if (res.status === 200) {
        setUser({
          name: res.data?.name,
          userId: res.data?.id,
          workspaceId: res.data?.defaultWorkspace,
          apiKey: data.apiKey,
        });
      } else {
        setError(true);
      }
      setIsLoading(false);
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
              href="https://app.clockify.me/user/settings"
              target="_blank"
            >
              clockify.me/user/settings
            </a>
          </p>
        </div>
        <div className="flex gap-2">
          <Input
            required
            placeholder="Enter API key..."
            {...register("apiKey")}
          />
          <Button type="submit">{isLoading ? "Loading..." : "Submit"}</Button>
        </div>
        {error && <p className="text-red-500 text-xs">Invalid API key</p>}
      </form>
    </div>
  );
};

export default ApiKeyInput;
