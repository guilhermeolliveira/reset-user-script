import * as fs from "fs";
import * as path from "path";

export interface ProcessResult {
  email: string;
  customer_no?: string;
  status: "success" | "error";
  step: "search" | "reset_token" | "reset_password" | "patch_customer";
  message?: string;
  timestamp: string;
}

export async function generateReport(
  results: ProcessResult[],
  environment: string,
  site: string
): Promise<string> {
  const outDir = path.join(process.cwd(), "out");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `report_${environment}_${site}_${timestamp}.csv`;
  const filePath = path.join(outDir, filename);

  const csvHeader = "email,customer_no,status,step,message,timestamp\n";
  const csvRows = results
    .map((result) => {
      const email = result.email || "";
      const customerNo = result.customer_no || "";
      const status = result.status;
      const step = result.step;
      const message = (result.message || "").replace(/"/g, '""');
      const timestamp = result.timestamp;

      return `"${email}","${customerNo}","${status}","${step}","${message}","${timestamp}"`;
    })
    .join("\n");

  const csvContent = csvHeader + csvRows;

  fs.writeFileSync(filePath, csvContent, "utf-8");

  return filePath;
}

export function printReportSummary(
  results: ProcessResult[],
  filePath: string
) {
  const successes = results.filter((r) => r.status === "success");
  const errors = results.filter((r) => r.status === "error");

  const uniqueSuccesses = new Set(successes.map((r) => r.email));
  const uniqueErrors = new Set(errors.map((r) => r.email));

  const successCount = String(uniqueSuccesses.size);
  const errorCount = String(uniqueErrors.size);
  const totalCount = String(uniqueSuccesses.size + uniqueErrors.size);

  console.log("\n╔═══════════════════════════════════════╗");
  console.log("║          📊 RELATÓRIO FINAL           ║");
  console.log("╠═══════════════════════════════════════╣");
  console.log(`║ Sucessos: ${successCount.padStart(27)} ║`);
  console.log(`║ Erros:    ${errorCount.padStart(27)} ║`);
  console.log(`║ Total:    ${totalCount.padStart(27)} ║`);
  console.log("╚═══════════════════════════════════════╝\n");
  console.log(`📄 Detalhes do relatório: ${filePath}\n`);

  if (errors.length > 0) {
    console.log("❌ Erros encontrados:");
    errors.forEach((error, index) => {
      console.log(
        `  ${index + 1}. ${error.email} (${error.step}): ${error.message || "Erro desconhecido"}`
      );
    });
    console.log();
  }
}
