import { parse } from "csv-parse/sync";
import * as fs from "fs";
import * as path from "path";

export async function loadEmailsFromCSV(filePath: string): Promise<string[]> {
  const cleanPath = filePath.replace(/^["']|["']$/g, "").trim();

  if (!fs.existsSync(cleanPath)) {
    throw new Error(`Arquivo não encontrado: ${cleanPath}`);
  }

  if (path.extname(cleanPath).toLowerCase() !== ".csv") {
    throw new Error(`O arquivo deve ter extensão .csv (recebido: ${path.extname(cleanPath)})`);
  }

  try {
    const fileContent = fs.readFileSync(cleanPath, "utf-8");

    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as Array<Record<string, string>>;

    const emails: string[] = [];

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const emailKey = Object.keys(record).find(
        (key) => key.toLowerCase() === "email"
      );

      if (!emailKey) {
        throw new Error(
          `CSV mal formatado: coluna "email" não encontrada. Colunas disponíveis: ${Object.keys(record).join(", ")}`
        );
      }

      const email = record[emailKey].trim();

      if (email) {
        emails.push(email);
      }
    }

    if (emails.length === 0) {
      throw new Error("Nenhum email encontrado no arquivo CSV");
    }

    return emails;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Erro ao processar CSV: ${error.message}`);
    }
    throw error;
  }
}
