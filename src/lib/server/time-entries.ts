import type { ClockifyProject, ClockifyTimeEntry } from '$lib/types/clockify';

export interface FormattedTimeEntry {
  resource: string;
  date: string;
  code: string;
  hours: number;
  callNo: string;
  description: string;
}

export const getDate = (timeInterval: ClockifyTimeEntry['timeInterval']): string => {
  const startDate = new Date(timeInterval.start);
  return startDate.toLocaleDateString('en-GB');
};

export const getHours = (duration: string): number => {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/); // Example 30mins 50 seconds - PT30M50S
  if (match) {
    const hours = match[1] ? parseInt(match[1], 10) : 0;
    const minutes = match[2] ? parseInt(match[2], 10) : 0;
    const seconds = match[3] ? parseInt(match[3], 10) : 0;
    const totalHours = hours + minutes / 60 + seconds / 3600;
    return Math.round(totalHours * 100) / 100;
  }
  return 0;
};

export const getCallNo = (description: string): string => {
  return description.split(' - ')[0];
};

export const getCode = (description: string): string => {
  const callNo = getCallNo(description);
  const regex = /[a-zA-Z]+/;
  return callNo.match(regex)![0];
};

export const getDescription = (description: string): string => {
  const parts = description.split('-');
  return parts.slice(1).join('-').trim();
};

export const getProjectName = (projects: ClockifyProject[], projectId: string): string => {
  const project = projects?.find((project) => project.id === projectId);
  return project ? project.name : '';
};

export const sortTimeEntriesByCallNo = (
  timeEntries: FormattedTimeEntry[]
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

// Helper function to convert DD/MM/YYYY format to Date object
export const convertToDate = (dateStr: string): Date => {
  // Parse date in format DD/MM/YYYY
  const [day, month, year] = dateStr.split('/').map(Number);
  return new Date(year, month - 1, day); // Month is 0-indexed in JS Date
};

interface TransformClockifyEntryParams {
  entry: ClockifyTimeEntry;
  resource: string;
  callNo: string;
  projects?: ClockifyProject[];
}

export const transformClockifyEntry = ({
  entry,
  resource,
  callNo,
  projects
}: TransformClockifyEntryParams): FormattedTimeEntry => {
  const { billable, description, projectId, timeInterval } = entry;

  const date = getDate(timeInterval);
  const code = billable ? getCode(description) : 'net';
  const hours = getHours(timeInterval.duration);
  const newCallNo = billable ? getCallNo(description) : callNo;
  let newDescription = billable ? getDescription(description) : description;

  if (projects) {
    newDescription = `${getProjectName(projects, projectId)} - ${newDescription}`;
  }

  return {
    resource,
    date,
    code,
    hours,
    callNo: newCallNo,
    description: newDescription
  };
};

export const roundHours = (hours: number): number => {
  return Math.round(hours * 100) / 100;
};

export const mergeEntries = (entries: FormattedTimeEntry[]): FormattedTimeEntry[] => {
  const mergedEntries: Record<string, FormattedTimeEntry> = {};

  for (const entry of entries) {
    const key = createMergeKey({
      date: entry.date,
      code: entry.code,
      description: entry.description,
      callNo: entry.callNo
    });

    if (mergedEntries[key]) {
      mergedEntries[key].hours = roundHours(mergedEntries[key].hours + entry.hours);
    } else {
      mergedEntries[key] = entry;
    }
  }

  return Object.values(mergedEntries);
};

type MergeKeyParams = Pick<FormattedTimeEntry, 'date' | 'code' | 'description' | 'callNo'>;

export const createMergeKey = ({ date, code, description, callNo }: MergeKeyParams): string => {
  return `${date}_${code}_${description}_${callNo}`;
};

interface FormatTimeEntriesParams {
  resource: string;
  callNo: string;
  projects?: ClockifyProject[];
  timeEntries: ClockifyTimeEntry[];
}

export const formatTimeEntries = ({
  resource,
  callNo,
  projects,
  timeEntries
}: FormatTimeEntriesParams): FormattedTimeEntry[] => {
  const transformed = timeEntries.map((entry) =>
    transformClockifyEntry({ entry, resource, callNo, projects })
  );
  const merged = mergeEntries(transformed);

  return sortTimeEntriesByCallNo(merged);
};
