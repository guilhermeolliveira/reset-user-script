import { generateAccessToken } from "./scripts/generate-access-token";
import { createResetToken } from "./scripts/create-reset-token";
import { resetPassword } from "./scripts/reset-password";
import { loadEnv } from "./lib/env";
import inquirer from "inquirer";
import { searchCustomers } from "./scripts/search-customers";
import { patchCustomers } from "./scripts/patch-customers";
import { loadEmailsFromCSV } from "./util/load-emails-from-csv";
import {
  generateReport,
  printReportSummary,
  ProcessResult,
} from "./util/generate-report";

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
      console.log(`\n✓ ${emails.length} e-mail(s) carregado(s) do arquivo\n`);
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

    console.log(`\n✓ ${emails.length} e-mail(s) informado(s)\n`);
  }

  emails = emails.sort((a, b) => a.localeCompare(b));

  loadEnv(answers.environment, answers.site);

  console.log("╔═══════════════════════════════════════╗");
  console.log(`║ 🔧 Ambiente: ${answers.environment.padEnd(23)}║`);
  console.log(`║ 🌐 Site:     ${answers.site.padEnd(23)}║`);
  console.log(`║ 📧 E-mails:  ${String(emails.length).padEnd(23)}║`);
  console.log("╚═══════════════════════════════════════╝\n");

  const processResults: ProcessResult[] = [];

  console.time("⏱️  Tempo de execução");

  const accessToken = await generateAccessToken();

  console.log("🔍 Buscando clientes...\n");
  const searchResult = await searchCustomers(emails, accessToken);

  Object.entries(searchResult).forEach(([email, result]) => {
    processResults.push({
      email,
      customer_no: result.customer_no,
      status: result.status,
      step: "search",
      message: result.message,
      timestamp: new Date().toISOString(),
    });
  });

  const validCustomers = Object.fromEntries(
    Object.entries(searchResult).filter(
      ([_, customer]) => customer.status === "success"
    )
  );

  console.log(
    `✓ ${Object.keys(validCustomers).length}/${emails.length} clientes encontrados\n`
  );

  if (Object.keys(validCustomers).length === 0) {
    console.error("✗ Nenhum cliente válido encontrado. Encerrando...\n");
    const reportPath = await generateReport(
      processResults,
      answers.environment,
      answers.site
    );
    printReportSummary(processResults, reportPath);
    return;
  }

  try {
    const resetTokens = await createResetToken(
      accessToken,
      Object.keys(validCustomers)
    );

    Object.keys(resetTokens).forEach((email) => {
      processResults.push({
        email,
        customer_no: validCustomers[email]?.customer_no,
        status: "success",
        step: "reset_token",
        timestamp: new Date().toISOString(),
      });
    });

    await resetPassword({
      access_token: accessToken,
      reset_tokens: resetTokens,
    });

    Object.keys(resetTokens).forEach((email) => {
      processResults.push({
        email,
        customer_no: validCustomers[email]?.customer_no,
        status: "success",
        step: "reset_password",
        timestamp: new Date().toISOString(),
      });
    });

    const customerIds = Object.values(validCustomers).map(
      (customer) => customer.customer_no ?? ""
    );
    await patchCustomers(accessToken, customerIds);

    Object.keys(validCustomers).forEach((email) => {
      processResults.push({
        email,
        customer_no: validCustomers[email]?.customer_no,
        status: "success",
        step: "patch_customer",
        timestamp: new Date().toISOString(),
      });
    });
  } catch (error) {
    console.error("\n✗ Erro durante o processamento:", error);

    Object.keys(validCustomers).forEach((email) => {
      processResults.push({
        email,
        customer_no: validCustomers[email]?.customer_no,
        status: "error",
        step: "reset_password",
        message:
          error instanceof Error ? error.message : "Erro desconhecido",
        timestamp: new Date().toISOString(),
      });
    });
  }

  console.timeEnd("⏱️  Tempo de execução");

  const reportPath = await generateReport(
    processResults,
    answers.environment,
    answers.site
  );
  printReportSummary(processResults, reportPath);
}

main();
