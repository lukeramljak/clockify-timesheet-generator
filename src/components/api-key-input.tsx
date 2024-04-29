import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useUserStore } from "@/store";
import { zodResolver } from "@hookform/resolvers/zod";
import Clockify from "clockify-ts";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  apiKey: z.string().min(1, {
    message: "Field cannot be empty",
  }),
});

const ApiKeyInput = () => {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      apiKey: "",
    },
  });

  const { setName, setUserId, setWorkspaceId, setApiKey } = useUserStore(
    (state) => ({
      setName: state.setName,
      setUserId: state.setUserId,
      setWorkspaceId: state.setWorkspaceId,
      setApiKey: state.setApiKey,
    })
  );

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      const clockify = new Clockify(data.apiKey);
      const user = await clockify.user.get();

      setName(user.name);
      setUserId(user.id);
      setWorkspaceId(user.defaultWorkspace);
      setApiKey(data.apiKey);

      setIsLoading(false);
    } catch (error) {
      form.setError("apiKey", {
        type: "manual",
        message: "Invalid API key",
      });
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <div className="w-full max-w-sm">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
          <FormField
            control={form.control}
            name="apiKey"
            render={({ field }) => (
              <FormItem>
                <div className="space-y-1">
                  <FormLabel>Clockify API Key</FormLabel>
                  <FormDescription>
                    Get one at{" "}
                    <a
                      rel="noreferrer"
                      className="underline"
                      href="https://app.clockify.me/user/settings"
                      target="_blank">
                      clockify.me/user/settings
                    </a>
                  </FormDescription>
                </div>
                <div className="flex gap-2">
                  <FormControl>
                    <Input placeholder="Enter API key..." {...field} />
                  </FormControl>
                  <Button type="submit">
                    {isLoading ? "Loading..." : "Submit"}
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </div>
    </Form>
  );
};

export default ApiKeyInput;
