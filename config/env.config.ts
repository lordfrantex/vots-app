export const envConfig = {
  vapi: {
    apiUrl: process.env.NEXT_PUBLIC_VAPI_API_URL ?? "https://api.vapi.ai",
    token: process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY,
  },
  server: {
    url:
      process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000/api/webhook",
  },
};
