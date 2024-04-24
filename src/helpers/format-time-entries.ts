import { User } from "@/context/user-context";
import { TimeEntryType } from "clockify-ts";

interface FormattedTimeEntry {
  resource: string;
  date: string;
  code: string;
  hours: number;
  callNo: string;
  description: string;
}

const getDate = (timeInterval: TimeEntryType["timeInterval"]): string => {
  const startDate = new Date(timeInterval.start);
  return startDate.toLocaleDateString("en-GB");
};

const getHours = (duration: string): number => {
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

const getCallNo = (description: string): string => {
  return description.split(" - ")[0];
};

const getCode = (description: string): string => {
  const callNo = getCallNo(description);
  const regex = /[a-zA-Z]+/;
  return callNo.match(regex)![0];
};

const getDescription = (description: string): string => {
  return description.split(" - ")[1];
};

const getProjectName = (projectId: string): string => {
  const userDataString = localStorage.getItem("user");
  if (!userDataString) {
    throw new Error("User data not found in localStorage");
  }
  const userData: User = JSON.parse(userDataString);
  const project: Project | undefined = userData.projects?.find(
    (project) => project.id === projectId,
  );
  if (!project) {
    return "";
  }
  return `${project.name} - `;
};

const formatTimeEntries = (
  resource: string,
  callNo: string,
  timeEntries: TimeEntryType[],
  includeProject: boolean,
): FormattedTimeEntry[] => {
  const mergedEntries: { [key: string]: FormattedTimeEntry } = {};

  timeEntries.forEach(({ billable, description, projectId, timeInterval }) => {
    const date = getDate(timeInterval);
    const code = billable ? getCode(description) : "net";
    const hours = getHours(timeInterval.duration);
    const newCallNo = billable ? getCallNo(description) : callNo;
    let newDescription = billable ? getDescription(description) : description;

    if (includeProject) {
      newDescription = `${getProjectName(projectId)}${newDescription}`;
    }

    const key = `${date}_${newDescription}`;

    if (mergedEntries[key]) {
      mergedEntries[key].hours += hours;
    } else {
      mergedEntries[key] = {
        resource,
        date,
        code,
        hours,
        callNo: newCallNo,
        description: newDescription,
      };
    }
  });

  return Object.values(mergedEntries);
};

export default formatTimeEntries;
