interface ClockifyUser {
  id: string;
  name: string;
  defaultWorkspace: string;
}

const getUser = async (apiKey: string): Promise<ClockifyUser | null> => {
  try {
    const url = "https://api.clockify.me/api/v1/user";
    const response = await fetch(url, {
      headers: {
        "X-Api-Key": apiKey,
      },
      method: "GET",
    });
    if (!response.ok) {
      throw new Error(`HTTP error. Status: ${response.status}`);
    }
    return (await response.json()) as ClockifyUser;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};

export default getUser;
