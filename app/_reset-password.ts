import { generateAccessToken } from "./scripts/generate-access-token";
import { createResetToken } from "./scripts/create-reset-token";
import { resetPassword } from "./scripts/reset-password";
import { loadEnv } from "./lib/env";
import inquirer from "inquirer";
import { searchCustomers } from "./scripts/search-customers";
import { patchCustomers } from "./scripts/patch-customers";
import { loadEmailsFromCSV } from "./util/load-emails-from-csv";

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
    {
      type: "select",
      name: "emailInputMethod",
      message: "Como deseja informar os e-mails?",
      choices: [
        { name: "Arquivo CSV", value: "csv" },
        { name: "Digitar manualmente", value: "manual" },
      ],
    },
  ]);

  let emails: string[] = [];

  if (answers.emailInputMethod === "csv") {
    const csvAnswer = await inquirer.prompt([
      {
        type: "input",
        name: "csvPath",
        message: "Digite o caminho do arquivo CSV:",
        validate: (input) => {
          if (!input.trim()) {
            return "Por favor, informe o caminho do arquivo";
          }
          return true;
        },
      },
    ]);

    try {
      emails = await loadEmailsFromCSV(csvAnswer.csvPath);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`\n✗ Erro: ${error.message}\n`);
      }
      process.exit(1);
    }
  } else {
    const manualAnswer = await inquirer.prompt([
      {
        type: "input",
        name: "emailsList",
        message: "Digite os e-mails separados por vírgula:",
        validate: (input) => {
          if (!input.trim()) {
            return "Por favor, informe pelo menos um e-mail";
          }
          return true;
        },
      },
    ]);

    emails = manualAnswer.emailsList
      .split(",")
      .map((email: string) => email.trim())
      .filter((email: string) => email.length > 0);
  }

  emails = emails.sort((a, b) => a.localeCompare(b));

  loadEnv(answers.environment, answers.site);

  console.time("Execution time");

  const accessToken = await generateAccessToken();
  const searchResult = await searchCustomers(emails, accessToken);

  const validCustomers = Object.fromEntries(
    Object.entries(searchResult).filter(
      ([_, customer]) => customer.status === "success"
    )
  );

  try {
    const resetTokens = await createResetToken(
      accessToken,
      Object.keys(validCustomers)
    );

    await resetPassword({
      access_token: accessToken,
      reset_tokens: resetTokens,
    });

    const customerIds = Object.values(validCustomers).map(
      (customer) => customer.customer_no ?? ""
    );

    console.log(`Patching ${customerIds.length} customers`);
    await patchCustomers(accessToken, customerIds);
    console.log("Customers patched successfully\n");
  } catch (error) {
    console.error("Error during processing:", error);
    process.exit(1);
  }

  console.timeEnd("Execution time");
  process.exit(0);
}

main();
