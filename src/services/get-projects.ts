import api from "./api";

const getProjects = async () => {
  const workspaceId = localStorage.getItem("workspace_id");
  try {
    const response = await api(`workspaces/${workspaceId}/projects`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};

export default getProjects;
