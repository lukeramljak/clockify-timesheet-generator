import Content from "./components/content";
import { ThemeProvider } from "./components/theme/theme-provider";
import { UserProvider } from "./context/user-context";

export default function App() {
  return (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <UserProvider>
          <Content />
        </UserProvider>
      </ThemeProvider>
    </>
  );
}
