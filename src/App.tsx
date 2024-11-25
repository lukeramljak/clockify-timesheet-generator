import { Toaster } from "@/components/ui/sonner";
import { Content } from "@/components/content";
import { ThemeProvider } from "@/components/theme/theme-provider";

export default function App() {
  return (
    <>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <Content />
        <Toaster />
      </ThemeProvider>
    </>
  );
}
