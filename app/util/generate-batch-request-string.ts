import { randomUUID } from "crypto";

interface BatchRequestParams<T> {
  separator: string;
  data: (T & { path: string })[];
}

export function generateBatchRequestString<T>({
  separator,
  data,
}: BatchRequestParams<T>): string {
  let request = "";

  for (const [index, item] of data.entries()) {
    const { path, ...rest } = item;
    const json = JSON.stringify(rest);
    const contentId = randomUUID();

    request += `--${separator}\n`;
    request += `x-dw-content-id: ${contentId}\n`;
    request += `x-dw-resource-path-extension: ${path}\n`;
    request += `\n${json}\n`;

    const isLast = index === data.length - 1;

    if (isLast) {
      request += `--${separator}--\n`;
    } else {
      request += `--${separator}\n\n`;
    }
  }

  return request;
}
