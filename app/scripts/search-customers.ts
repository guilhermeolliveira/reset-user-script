import { api } from "../lib/axios";
import { getEnv } from "../lib/env";

interface SearchCustomersResponse {
  hits: {
    data: {
      customer_no: string;
      email: string;
    };
  }[];
}

interface SearchCustomersResult {
  status: "success" | "error";
  message?: string;
  customer_no?: string;
}

export async function searchCustomers(emails: string[], access_token: string) {
  const env = getEnv();
  const service = api(env.OCAPI_ENDPOINT);

  const response = await service.post<SearchCustomersResponse>(
    `/s/-/dw/data/v20_10/customer_lists/${env.SITE}/customer_search`,
    {
      select: "(hits.(data.(customer_no,email)))",
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
        authorization: access_token,
      },
    }
  );

  return emails.reduce((acc, email) => {
    const hit = response.data.hits.find((hit) => hit.data.email === email);

    acc[email] = {
      status: hit ? "success" : "error",
      message: hit ? undefined : `Customer ${email} not found`,
      customer_no: hit?.data.customer_no,
    };

    return acc;
  }, {} as Record<string, SearchCustomersResult>);
}
