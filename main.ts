import { generateAccessToken } from "./scripts/generate-access-token";
import "dotenv/config";

export async function main() {
  const accessToken = await generateAccessToken({
    client_id: "a37888e4-571d-40d6-9906-a5574897ec44",
    client_secret: "515b2ba08a2373b2633bc64dc2883827",
  });

  console.log(accessToken);
}

main();