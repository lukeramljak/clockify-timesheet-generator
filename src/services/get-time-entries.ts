import { format } from "date-fns";

const getTimeEntries = async (
  apiKey: string,
  userId: string,
  workspaceId: string,
  date: Date,
) => {
  try {
    const formattedDate = format(date, "yyyy-MM-dd'T'23:59:59'Z'");
    const url = `https://api.clockify.me/api/v1/workspaces/${workspaceId}/user/${userId}/time-entries?get-week-before=${formattedDate}`;

    const response = await fetch(url, {
      headers: {
        "X-Api-Key": apiKey,
      },
    });
    return await response.json();
  } catch (error) {
    console.error("Error fetching time entries:", error);
    throw error;
  }
};

export default getTimeEntries;
