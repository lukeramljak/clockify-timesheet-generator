import { format, startOfWeek } from "date-fns";

const getTimeEntries = async (
  apiKey: string,
  userId: string,
  workspaceId: string,
  date?: string,
) => {
  try {
    let startDate;
    let endDate;

    if (date) {
      const fridayDate = new Date(date);

      const mondayDate = startOfWeek(fridayDate, { weekStartsOn: 1 });

      startDate = format(mondayDate, "yyyy-MM-dd'T'00:00:00'Z'");
      endDate = format(fridayDate, "yyyy-MM-dd'T'23:59:59'Z'");
    }

    let url = `https://api.clockify.me/api/v1/workspaces/${workspaceId}/user/${userId}/time-entries`;

    if (startDate && endDate) {
      url += `?start=${startDate}&end=${endDate}`;
    } else if (startDate) {
      url += `?start=${startDate}`;
    } else if (endDate) {
      url += `?end=${endDate}`;
    }

    const response = await fetch(url, {
      headers: {
        "X-Api-Key": apiKey,
      },
    });
    return await response.json();
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};

export default getTimeEntries;
