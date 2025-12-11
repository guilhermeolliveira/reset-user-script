import { getEnv } from "../lib/env";
import { batchRequest } from "./batch-request";

export async function patchCustomers(
  access_token: string,
  customers: string[]
) {
  const env = getEnv();

  await batchRequest({
    access_token,
    service_name: "patch_customers",
    service_endpoint: `/s/-/dw/data/v20_10/customer_lists/${env.SITE}/customers/`,
    service_method: "PATCH",
    data: customers.map((customer) => ({
      path: customer,
      c_natg_passwordAlreadyResetedPostMigration: true,
    })),
  });
}
