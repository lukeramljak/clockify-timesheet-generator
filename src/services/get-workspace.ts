import api from "./api";

const getWorkspace = async () => {
  try {
    const response = await api(
      `workspaces/${import.meta.env.VITE_CLOCKIFY_WORKSPACE_ID}`,
    );
    return await response.json();
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};

export default getWorkspace;
