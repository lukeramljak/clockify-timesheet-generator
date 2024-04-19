import api from "./api";

const getAllUsers = async () => {
  try {
    const response = await api(
      `workspaces/${import.meta.env.VITE_CLOCKIFY_WORKSPACE_ID}/users`,
    );
    return await response.json();
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};

export default getAllUsers;
