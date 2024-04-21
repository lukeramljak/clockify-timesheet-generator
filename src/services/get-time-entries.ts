const getTimeEntries = async (
  apiKey: string,
  userId: string,
  workspaceId: string,
  startDate?: string,
  endDate?: string,
) => {
  try {
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
