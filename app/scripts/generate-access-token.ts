import { api } from "../lib/axios";
import { getEnv } from "../lib/env";

export async function generateAccessToken() {
  const env = getEnv();
  const endpoint = env.AUTH_ENDPOINT;

  if (!endpoint) {
    throw new Error("process.env.AUTH_ENDPOINT is not set");
  }

  const authStr = [env.CLIENT_ID, env.CLIENT_SECRET].join(":");
  const authBase64 = Buffer.from(authStr).toString("base64");

  const formData = new URLSearchParams();
  formData.append("grant_type", "client_credentials");

  const response = await api(endpoint).post<{
    access_token: string;
    token_type: string;
  }>("/access_token", formData.toString(), {
    headers: {
      Authorization: `Basic ${authBase64}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  const { access_token, token_type } = response.data;

  return `${token_type} ${access_token}`;
}
