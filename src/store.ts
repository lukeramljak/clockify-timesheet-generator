import { ProjectType } from "clockify-ts";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type UserStore = {
  name: string;
  setName: (newName: string) => void;
  userId: string;
  setUserId: (newUserId: string) => void;
  resource: string;
  setResource: (newResource: string) => void;
  callNo: string;
  setCallNo: (newCallNo: string) => void;
  workspaceId: string;
  setWorkspaceId: (newWorkspaceId: string) => void;
  apiKey: string;
  setApiKey: (newApiKey: string) => void;
  projects: ProjectType[];
  setProjects: (newProjects: ProjectType[]) => void;
  prefersProjectName: boolean;
  setPrefersProjectName: (newPreference: boolean) => void;
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
  name: "",
  setName: (newName) => set({ name: newName }),
  userId: "",
  setUserId: (newUserId) => set({ userId: newUserId }),
  resource: "",
  setResource: (newResource) => set({ resource: newResource }),
  callNo: "",
  setCallNo: (newCallNo) => set({ callNo: newCallNo }),
  workspaceId: "",
  setWorkspaceId: (newWorkspaceId) => set({ workspaceId: newWorkspaceId }),
  apiKey: "",
  setApiKey: (newApiKey) => set({ apiKey: newApiKey }),
  projects: [],
  setProjects: (newProjects) => set({ projects: newProjects }),
  prefersProjectName: false,
  setPrefersProjectName: (newPreference) =>
  set({ prefersProjectName: newPreference }),
}), {
  name: "user",
}));
