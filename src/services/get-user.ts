import api from "./api";

interface ClockifyUser {
  id: string;
  name: string;
  defaultWorkspace: string;
}

const getUser = async (): Promise<ClockifyUser> => {
  try {
    const response = await api("user");
    return await response.json();
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};

export default getUser;
