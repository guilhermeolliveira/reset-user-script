import { z } from "zod";
import { config } from "dotenv";
import { existsSync } from "fs";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "staging"]),
  SITE: z.enum(["AvonBrazil", "NatBrazil"]),
  OCAPI_ENDPOINT: z.string().min(1, "required ocapi endpoint"),
  AUTH_ENDPOINT: z.string().min(1, "required auth endpoint"),
  CLIENT_ID: z.string().min(1, "required client id"),
  CLIENT_SECRET: z.string().min(1, "required client secret"),
});

type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

export function loadEnv(environment: string, site: string): Env {
  process.env.NODE_ENV = environment;
  process.env.SITE = site;

  const envFile = `.env.${environment}`;

  if (!existsSync(envFile)) {
    throw new Error(`Environment file ${envFile} not found`);
  }

  config({ path: envFile, quiet: true });

  cachedEnv = envSchema.parse(process.env);
  
  return cachedEnv;
}

export function getEnv(): Env {
  if (!cachedEnv) {
    throw new Error(
      "Environment not loaded. Call loadEnv(environment, site) first."
    );
  }
  return cachedEnv;
}