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

export const ApiKeyInput = () => {
  const [isLoading, setIsLoading] = useState(false);

  const setName = useUserStore((state) => state.setName);
  const setUserId = useUserStore((state) => state.setUserId);
  const setWorkspaceId = useUserStore((state) => state.setWorkspaceId);
  const setApiKey = useUserStore((state) => state.setApiKey);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      apiKey: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      const clockify = new Clockify(data.apiKey);
      const user = await clockify.user.get();

      setName(user.name);
      setUserId(user.id);
      setWorkspaceId(user.defaultWorkspace);
      setApiKey(data.apiKey);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.match(/api key/i)) {
          form.setError("apiKey", {
            type: "manual",
            message: "Invalid API key",
          });
        } else {
          form.setError("apiKey", {
            type: "manual",
            message: "An unknown error occurred",
          });
        }
      }
    } finally {
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
                      href="https://app.clockify.me/user/preferences#advanced"
                      target="_blank"
                    >
                      clockify.me/user/preferences
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
