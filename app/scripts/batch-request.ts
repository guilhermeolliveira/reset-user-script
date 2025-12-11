import { api } from "../lib/axios";
import { getEnv } from "../lib/env";
import { generateBatchRequestString } from "../util/generate-batch-request-string";

export interface BatchRequestData {
  path: string;
}

interface BatchRequestParams<T> {
  access_token: string;
  service_name: string;
  service_endpoint: string;
  service_method: "POST" | "GET" | "PUT" | "DELETE" | "PATCH";
  data: (BatchRequestData & T)[];
}

export async function batchRequest<Request>({
  access_token,
  service_name,
  service_endpoint,
  service_method,
  data,
}: BatchRequestParams<Request>) {
  const env = getEnv();
  const service = api(env.OCAPI_ENDPOINT);

  const request = generateBatchRequestString<Request>({
    separator: service_name,
    data,
  });

  const response = await service.post("/s/-/dw/batch", request, {
    headers: {
      "x-dw-http-method": service_method,
      "x-dw-resource-path": service_endpoint,
      "x-dw-client-id": env.CLIENT_ID,
      "content-type": `multipart/mixed; boundary=${service_name}`,
      authorization: access_token,
    },
  });

  return response.data as string;
}
