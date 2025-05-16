import { ProjectType } from "clockify-ts";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  name: string;
  userId: string;
  resource: string;
  callNo: string;
  workspaceId: string;
  apiKey: string;
  projects: ProjectType[];
  prefersProjectName: boolean;
}

interface UserState {
  user: User;
  setUser: (newUser: Partial<User>) => void;
  resetUser: () => void;
}

const initialUser: User = {
  name: "",
  userId: "",
  resource: "",
  callNo: "",
  workspaceId: "",
  apiKey: "",
  projects: [],
  prefersProjectName: false,
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: initialUser,
      setUser: (newUser) =>
        set((state) => ({
          user: { ...state.user, ...newUser },
        })),
      resetUser: () => set({ user: initialUser }),
    }),
    { name: "user" },
  ),
);
