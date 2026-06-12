/**
 * Script para criar o usuário administrador inicial.
 * Uso: node .\node_modules\tsx\dist\cli.mjs db/create-admin.ts
 */
import { getDb } from "../api/queries/connection";
import { users } from "./schema";
import { hashPassword } from "../api/lib/password";
import { eq } from "drizzle-orm";

const ADMIN_EMAIL = "admin@gessopremium.com.br";
const ADMIN_PASSWORD = "admin@123";
const ADMIN_NAME = "Administrador";
const ADMIN_UNION_ID = "local_admin";

async function createAdmin() {
  const db = getDb();

  // Verificar se já existe
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, ADMIN_EMAIL))
    .limit(1);

  if (existing.length > 0) {
    console.log(`✓ Admin já existe: ${ADMIN_EMAIL}`);
    console.log(`  Role: ${existing[0].role}`);
    return;
  }

  const passwordHash = await hashPassword(ADMIN_PASSWORD);

  await db.insert(users).values({
    unionId: ADMIN_UNION_ID,
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    passwordHash,
    role: "admin",
    lastSignInAt: new Date(),
  });

  console.log("✓ Admin criado com sucesso!");
  console.log(`  E-mail: ${ADMIN_EMAIL}`);
  console.log(`  Senha:  ${ADMIN_PASSWORD}`);
  console.log("\n⚠️  Altere a senha após o primeiro acesso.");
}

createAdmin().catch(console.error);
