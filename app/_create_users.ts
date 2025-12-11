import { faker } from "@faker-js/faker/locale/pt_BR";
import { generatePassword } from "./util/generate-password";
import inquirer from "inquirer";
import { getEnv, loadEnv } from "./lib/env";
import { api } from "./lib/axios";
import { generateValidCPF } from "./util/generate-cpf";
import { AxiosInstance } from "axios";
import * as fs from "fs";
import * as path from "path";

async function createUser(
  service: AxiosInstance,
  email: string,
  password: string
) {
  const env = getEnv();

  const response = await service.post(
    `/s/${env.SITE}/dw/shop/v21_8/customers/auth`,
    {
      type: "guest",
    },
    {
      params: {
        client_id: env.CLIENT_ID,
      },
    }
  );

  const accessToken = response.headers.authorization;

  const userResponse = await service.post(
    `/s/${env.SITE}/dw/shop/v21_8/customers`,
    {
      password,
      customer: {
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email: email,
        login: email,
        birthday: faker.date.birthdate().toISOString().split("T")[0],
        gender: 1,
        phone_home: faker.phone.number({ style: "national" }),
        phone_mobile: faker.phone.number({ style: "national" }),
        c_natg_cpf: generateValidCPF(),
        c_natg_getAcceptTerms: true,
        c_natg_Newsletter: false,
        c_natg_NewsletterSMS: false,
        c_natg_AllowStoreCollectInfo: false,
        c_natg_OrderCellphoneUpdate: false,
        c_natg_ClientAcceptedTerms: true,
        c_natg_optInWP: false,
      },
    },
    {
      headers: {
        authorization: accessToken,
      },
      params: {
        client_id: env.CLIENT_ID,
      },
    }
  );

  return userResponse.data;
}

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
  const service = api(env.OCAPI_ENDPOINT);

  const results: Array<{ email: string; password: string; success: boolean }> = [];
  const users = 150;

  for (let i = 0; i < users; i++) {
    const password = generatePassword();
    const email = `test_script_reset_${faker.internet.email().toLowerCase()}`;

    try {
      await createUser(service, email, password);
      results.push({ email, password, success: true });
      console.log(`✓ Usuário criado: ${email}`);
    } catch (error) {
      console.log(error);
      results.push({ email, password, success: false });
    }
  }

  const outDir = path.join(process.cwd(), "out");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const csvContent = [
    "email,password",
    ...results
      .filter((r) => r.success)
      .map((r) => `${r.email},${r.password}`),
  ].join("\n");

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `users-created-${timestamp}.csv`;
  const filepath = path.join(outDir, filename);

  fs.writeFileSync(filepath, csvContent, "utf-8");
  console.log(`\n✓ Arquivo CSV salvo em: ${filepath}`);
  console.log(`✓ Total de usuários criados com sucesso: ${results.filter(r => r.success).length}/${users}`);
}

main();
