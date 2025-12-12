import { api } from "../lib/axios";
import { getEnv } from "../lib/env";
import { chunkArray } from "../util/chunk-array";

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

  const chunks = chunkArray(emails, 200);
  const allResults: Record<string, SearchCustomersResult> = {};

  console.log(`Searching ${emails.length} customers in ${chunks.length} batches\n`);

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const startTime = Date.now();

    try {
      const response = await service.post<SearchCustomersResponse>(
        `/s/-/dw/data/v20_10/customer_lists/${env.SITE}/customer_search`,
        {
          select: "(hits.(data.(customer_no,email)))",
          start: 0,
          count: 200,
          query: {
            term_query: {
              fields: ["email"],
              operator: "one_of",
              values: chunk,
            },
          },
        },
        {
          headers: {
            authorization: access_token,
          },
        }
      );

      const chunkResults = chunk.reduce((acc, email) => {
        const hit = response.data.hits.find((hit) => hit.data.email === email);

        acc[email] = {
          status: hit ? "success" : "error",
          message: hit ? undefined : `Customer ${email} not found`,
          customer_no: hit?.data.customer_no,
        };

        return acc;
      }, {} as Record<string, SearchCustomersResult>);

      Object.assign(allResults, chunkResults);

      const elapsed = Date.now() - startTime;
      const foundCount = Object.values(chunkResults).filter(r => r.status === "success").length;
      console.log(`Batch request completed: ${i + 1}/${chunks.length} - (${elapsed}ms) - ${foundCount} found`);
    } catch (error) {
      const elapsed = Date.now() - startTime;
      console.error(`Batch request failed: ${i + 1}/${chunks.length} - (${elapsed}ms)`);
      throw error;
    }
  }

  return allResults;
}
