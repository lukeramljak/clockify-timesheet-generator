const api = async (endpoint: string, args = {}) => {
  try {
    const url = `https://api.clockify.me/api/v1/${endpoint}`;
    const response = await fetch(url, {
      headers: {
        "X-Api-Key": import.meta.env.VITE_CLOCKIFY_API_KEY,
      },
      method: "GET",
      ...args,
    });
    return response;
  } catch (error) {
    console.error(error);
  }
};

export default api;
