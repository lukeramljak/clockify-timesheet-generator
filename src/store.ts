import { ProjectType } from "clockify-ts";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type UserStore = {
  name: string;
  userId: string;
  resource: string;
  callNo: string;
  workspaceId: string;
  apiKey: string;
  projects: ProjectType[];
  prefersProjectName: boolean;
  setName: (newName: string) => void;
  setUserId: (newUserId: string) => void;
  setResource: (newResource: string) => void;
  setCallNo: (newCallNo: string) => void;
  setWorkspaceId: (newWorkspaceId: string) => void;
  setApiKey: (newApiKey: string) => void;
  setProjects: (newProjects: ProjectType[]) => void;
  setPrefersProjectName: (newPreference: boolean) => void;
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      name: "",
      userId: "",
      resource: "",
      callNo: "",
      workspaceId: "",
      apiKey: "",
      projects: [],
      prefersProjectName: false,
      setName: (newName) => set({ name: newName }),
      setUserId: (newUserId) => set({ userId: newUserId }),
      setResource: (newResource) => set({ resource: newResource }),
      setCallNo: (newCallNo) => set({ callNo: newCallNo }),
      setWorkspaceId: (newWorkspaceId) => set({ workspaceId: newWorkspaceId }),
      setApiKey: (newApiKey) => set({ apiKey: newApiKey }),
      setProjects: (newProjects) => set({ projects: newProjects }),
      setPrefersProjectName: (newPreference) =>
        set({ prefersProjectName: newPreference }),
    }),
    {
      name: "user",
    }
  )
);
