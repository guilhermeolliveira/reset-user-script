import { generateAccessToken } from "./scripts/generate-access-token";
import { createResetToken } from "./scripts/create-reset-token";
import { resetPassword } from "./scripts/reset-password";
import { patchCustomers } from "./scripts/patch-customers";
import { loadEnv } from "./lib/env";
import inquirer from "inquirer";

const emails = ["guilhermegso1019@gmail.com", "testcustomer@gmail.com"];

export async function main() {
  const answers = await inquirer.prompt([
    {
      type: "select",
      name: "environment",
      message: "Selecione o ambiente:",
      choices: ["development", "production", "staging"],
      default: "development",
    },
    {
      type: "select",
      name: "site",
      message: "Selecione o site:",
      choices: ["AvonBrazil", "NatBrazil"],
      default: "AvonBrazil",
    },
  ]);

  const env = loadEnv(answers.environment, answers.site);

  console.info(`\n - Ambiente: ${env.NODE_ENV}`);
  console.info(` - Site: ${env.SITE}`);
  console.info(` - API: ${env.OCAPI_ENDPOINT}\n`);

  console.time("Tempo de execução");

  const accessToken = await generateAccessToken();
  const resetTokens = await createResetToken(accessToken, emails);
  await resetPassword({ access_token: accessToken, reset_tokens: resetTokens });
  await patchCustomers(emails, accessToken);

  console.timeEnd("Tempo de execução");
}

main();
