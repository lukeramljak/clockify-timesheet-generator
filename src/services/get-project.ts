import api from "./api";

const getProject = async (projectId) => {
  try {
    const response = await api(
      `workspaces/${import.meta.env.VITE_CLOCKIFY_WORKSPACE_ID}/projects/${projectId}`,
    );
    return await response.json();
  } catch (error) {
    console.error("Error fetching project:", error);
    throw error;
  }
};

export default getProject;
