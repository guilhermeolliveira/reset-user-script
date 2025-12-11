import { api } from "../lib/axios";
import { getEnv } from "../lib/env";
import { generateBatchRequestString } from "../util/generate-batch-request-string";
import { chunkArray } from "../util/chunk-array";

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
  const chunks = chunkArray(data, 50);
  const responses: string[] = [];

  console.log(`\n┌${"─".repeat(50)}┐`);
  console.log(`│ 🚀 ${service_name.toUpperCase().padEnd(46)}│`);
  console.log(`│ 📊 Total: ${String(data.length).padEnd(39)}│`);
  console.log(`│ 📦 Lotes: ${String(chunks.length).padEnd(39)}│`);
  console.log(`└${"─".repeat(50)}┘\n`);

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const startTime = Date.now();

    try {
      const request = generateBatchRequestString<Request>({
        separator: service_name,
        data: chunk,
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

      const elapsed = Date.now() - startTime;
      responses.push(response.data as string);
      console.log(`  ✓ Lote ${i + 1}/${chunks.length} - ${chunk.length} itens (${elapsed}ms)`);

    } catch (error) {
      const elapsed = Date.now() - startTime;
      console.error(`  ✗ Lote ${i + 1}/${chunks.length} - FALHOU (${elapsed}ms)`);
      if (error instanceof Error) {
        console.error(`     Erro: ${error.message}`);
      }
      throw error;
    }
  }
  console.log();

  return responses.join('\n');
}
