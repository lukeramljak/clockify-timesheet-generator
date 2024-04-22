export {};

declare global {
  interface TimeEntry {
    billable: boolean;
    description: string;
    timeInterval: { duration: string; start: string; end: string };
    projectId: string;
  }

  interface Project {
    id: string;
    name: string;
  }
}
