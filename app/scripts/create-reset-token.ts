import { batchRequest } from "./batch-request";
import { getJSONResponses } from "../util/get-json-responses";
import { getEnv } from "../lib/env";

export async function createResetToken(access_token: string, emails: string[]) {
  const env = getEnv();
  const batchResponse = await batchRequest({
    access_token,
    service_name: "reset_token",
    service_endpoint: `/s/${env.SITE}/dw/shop/v24_5/`,
    service_method: "POST",
    data: emails.map((email) => ({
      path: "customers/password/actions/create_reset_token",
      login: email,
    })),
  });

  const response = getJSONResponses<{ reset_token: string; login: string }>(
    batchResponse
  );

  return response.reduce((acc, item) => {
    acc[item.login] = item.reset_token;
    return acc;
  }, {} as Record<string, string>);
}
