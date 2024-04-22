interface ClockifyUser {
  id: string;
  name: string;
  defaultWorkspace: string;
}

interface GetUserResponse {
  status: number;
  data: ClockifyUser | null;
}

const getUser = async (apiKey: string): Promise<GetUserResponse> => {
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
    const data = await response.json();
    return { status: response.status, data: data as ClockifyUser };
  } catch (error) {
    console.error("Error fetching user:", error);
    return { status: 500, data: null };
  }
};

export default getUser;
