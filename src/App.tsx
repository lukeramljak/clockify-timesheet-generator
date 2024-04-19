import { ThemeProvider } from "./components/theme/theme-provider";
import UserList from "./components/user-list";

export default function App() {
  return (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <div className="h-full flex flex-col items-center justify-center gap-4">
          <UserList />
        </div>
      </ThemeProvider>
    </>
  );
}
