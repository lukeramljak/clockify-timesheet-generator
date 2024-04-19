import api from "./api";

const getTimeEntries = async (
  userId: string,
  startDate?: string,
  endDate?: string,
) => {
  try {
    let url = `workspaces/${import.meta.env.VITE_CLOCKIFY_WORKSPACE_ID}/user/${userId}/time-entries`;

    if (startDate && endDate) {
      url += `?start=${startDate}&end=${endDate}`;
    } else if (startDate) {
      url += `?start=${startDate}`;
    } else if (endDate) {
      url += `?end=${endDate}`;
    }

    const response = await api(url);
    return await response.json();
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};

export default getTimeEntries;
