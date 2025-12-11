import { api } from "../lib/axios";
import { getEnv } from "../lib/env";
import { batchRequest } from "./batch-request";

interface SearchCustomersResponse {
  hits: {
    data: {
      customer_no: string;
    };
  }[];
}

export async function patchCustomers(emails: string[], access_token: string) {
  const env = getEnv();
  const service = api(env.OCAPI_ENDPOINT);

  const response = await service.post<SearchCustomersResponse>(
    `/s/-/dw/data/v20_10/customer_lists/${env.SITE}/customer_search`,
    {
      select: "(hits.(data.(customer_no)))",
      query: {
        term_query: {
          fields: ["email"],
          operator: "one_of",
          values: emails,
        },
      },
    },
    {
      headers: {
        authorization: access_token
      },
    }
  );

  const customers = response.data.hits.map((hit) => hit.data.customer_no);

  await batchRequest({
    access_token,
    service_endpoint: `/s/-/dw/data/v20_10/customer_lists/${env.SITE}/customers/`,
    service_method: "PATCH",
    service_name: "patch_customers",
    data: customers.map((customer) => ({
      path: customer,
      c_natg_passwordAlreadyResetedPostMigration: true,
    })),
  });
}
