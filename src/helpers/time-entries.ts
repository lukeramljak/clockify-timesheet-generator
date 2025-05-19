import { User } from "@/store";
import { ProjectType, TimeEntryType } from "clockify-ts";

export const getDate = (
  timeInterval: TimeEntryType["timeInterval"],
): string => {
  const startDate = new Date(timeInterval.start);
  return startDate.toLocaleDateString("en-GB");
};

export const getHours = (duration: string): number => {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (match) {
    const hours = match[1] ? parseInt(match[1], 10) : 0;
    const minutes = match[2] ? parseInt(match[2], 10) : 0;
    const seconds = match[3] ? parseInt(match[3], 10) : 0;
    const totalHours = hours + minutes / 60 + seconds / 3600;
    return totalHours;
  }
  return 0;
};

export const getCallNo = (description: string): string => {
  return description.split(" - ")[0];
};

export const getCode = (description: string): string => {
  const callNo = getCallNo(description);
  const regex = /[a-zA-Z]+/;
  return callNo.match(regex)![0];
};

export const getDescription = (description: string): string => {
  const parts = description.split("-");
  return parts.slice(1).join("-").trim();
};

export const getProjectName = (
  projects: ProjectType[],
  projectId: string,
): string => {
  const project = projects?.find((project) => project.id === projectId);
  return project ? project.name : "";
};

export const sortTimeEntries = (
  timeEntries: FormattedTimeEntry[],
): FormattedTimeEntry[] => {
  return timeEntries.sort((a, b) => {
    if (a.callNo < b.callNo) return -1;
    if (a.callNo > b.callNo) return 1;

    // Convert date strings to Date objects for proper comparison
    const dateA = convertToDate(a.date);
    const dateB = convertToDate(b.date);

    if (dateA < dateB) return -1;
    if (dateA > dateB) return 1;
    return 0;
  });
};

export const convertToDate = (dateStr: string): Date => {
  // Parse date in format DD/MM/YYYY
  const [day, month, year] = dateStr.split("/").map(Number);
  return new Date(year, month - 1, day);
};

export const formatTimeEntries = (
  user: Pick<User, "resource" | "callNo" | "projects" | "prefersProjectName">,
  timeEntries: TimeEntryType[],
): FormattedTimeEntry[] => {
  const mergedEntries: { [key: string]: FormattedTimeEntry } = {};
  timeEntries.forEach(({ billable, description, projectId, timeInterval }) => {
    const date = getDate(timeInterval);
    const code = billable ? getCode(description) : "net";
    const hours = getHours(timeInterval.duration);
    const newCallNo = billable ? getCallNo(description) : user.callNo;
    let newDescription = billable ? getDescription(description) : description;
    if (user.prefersProjectName) {
      newDescription = `${getProjectName(user.projects, projectId)} - ${newDescription}`;
    }
    const key = `${date}_${code}_${newDescription}_${newCallNo}`;
    if (mergedEntries[key]) {
      mergedEntries[key].hours += hours;
    } else {
      mergedEntries[key] = {
        resource: user.resource,
        date,
        code,
        hours,
        callNo: newCallNo,
        description: newDescription,
      };
    }
  });
  const sortedEntries = sortTimeEntries(Object.values(mergedEntries));
  return sortedEntries;
};
