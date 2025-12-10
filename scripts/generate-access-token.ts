import { api } from "../lib/axios";

interface AccessTokenParams {
  client_id: string;
  client_secret: string;
}

export async function generateAccessToken({
  client_id,
  client_secret,
}: AccessTokenParams) {
  const endpoint = process.env.AUTH_ENDPOINT;

  if (!endpoint) {
    throw new Error("process.env.AUTH_ENDPOINT is not set");
  }

  const authStr = [client_id, client_secret].join(":");
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
