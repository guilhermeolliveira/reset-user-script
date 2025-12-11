import { getEnv } from "../lib/env";
import { generatePassword } from "../util/generate-password";
import { batchRequest } from "./batch-request";

interface ResetPasswordParams {
  access_token: string;
  reset_tokens: Record<string, string>;
}

export async function resetPassword({
  access_token,
  reset_tokens,
}: ResetPasswordParams) {
  const env = getEnv();
  await batchRequest({
    access_token,
    service_name: "reset_password",
    service_endpoint: `/s/${env.SITE}/dw/shop/v24_5/`,
    service_method: "POST",
    data: Object.entries(reset_tokens).map(([login, reset_token]) => ({
      path: "customers/password/actions/reset",
      login,
      reset_token,
      new_password: generatePassword(),
    })),
  });
}
