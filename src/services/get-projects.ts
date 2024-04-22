const getProjects = async (apiKey: string, workspaceId: string) => {
  try {
    const url = `https://api.clockify.me/api/v1/workspaces/${workspaceId}/projects`;
    const response = await fetch(url, {
      headers: {
        "X-Api-Key": apiKey,
      },
    });
    return await response.json();
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
};

export default getProjects;
