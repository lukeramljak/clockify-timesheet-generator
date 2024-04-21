interface TimeEntry {
  billable: boolean;
  description: string;
  timeInterval: { duration: string; start: string; end: string };
}

interface FormattedTimeEntry {
  resource: string;
  date: string;
  code: string;
  hours: number;
  callNo: string;
  description: string;
}

const getDate = (timeInterval: { start: string }): string => {
  const startDate = new Date(timeInterval.start);
  return startDate.toLocaleDateString("en-GB");
};

const getHours = (duration: string): number => {
  const minDuration = 0.25;
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(\d+)S/);
  if (match) {
    const hours = match[1] ? parseInt(match[1], 10) : 0;
    const minutes = match[2] ? parseInt(match[2], 10) : 0;
    const seconds = parseInt(match[3], 10);
    const totalHours = hours + minutes / 60 + seconds / 3600;
    if (totalHours <= minDuration) {
      return minDuration;
    } else {
      const roundedHours = Math.round(totalHours * 4) / 4;
      return roundedHours;
    }
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

const formatTimeEntries = (
  resource: string,
  callNo: string,
  timeEntries: TimeEntry[],
): FormattedTimeEntry[] => {
  const mergedEntries: { [key: string]: FormattedTimeEntry } = {};

  timeEntries.forEach(({ billable, description, timeInterval }) => {
    const date = getDate(timeInterval);
    const code = billable ? getCode(description) : "net";
    const hours = getHours(timeInterval.duration);
    const newCallNo = billable ? getCallNo(description) : callNo;
    const newDescription = billable ? getDescription(description) : description;

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
