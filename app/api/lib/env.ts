import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value ?? "";
}

const appSecret = required("APP_SECRET");
if (appSecret && appSecret.length < 32) {
  console.warn(
    `[security] APP_SECRET tem apenas ${appSecret.length} caracteres. Use no mínimo 32 para segurança adequada.`
  );
}

export const env = {
  appId: process.env.APP_ID ?? "",
  appSecret,
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: required("DATABASE_URL"),
  kimiAuthUrl: process.env.KIMI_AUTH_URL ?? "",
  kimiOpenUrl: process.env.KIMI_OPEN_URL ?? "",
  ownerUnionId: process.env.OWNER_UNION_ID ?? "",
  superAdminEmail: process.env.SUPER_ADMIN_EMAIL ?? "",
  superAdminPassword: process.env.SUPER_ADMIN_PASSWORD ?? "",
  // Origem permitida para CORS em produção. Separe múltiplas com vírgula.
  allowedOrigin: process.env.ALLOWED_ORIGIN ?? "",
};
