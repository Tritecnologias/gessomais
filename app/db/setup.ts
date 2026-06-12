/**
 * Script de setup inicial para deploy em VPS.
 * Cria o super administrador se não existir.
 *
 * Uso: npx tsx db/setup.ts
 *
 * Variáveis de ambiente necessárias:
 *   DATABASE_URL        — string de conexão MySQL
 *   SUPER_ADMIN_EMAIL   — e-mail do super admin (ex: wanderson.martins.silva@gmail.com)
 *   SUPER_ADMIN_PASSWORD — senha do super admin (mínimo 8 caracteres)
 */
import "dotenv/config";
import { getDb } from "../api/queries/connection";
import { users } from "./schema";
import { hashPassword } from "../api/lib/password";
import { eq } from "drizzle-orm";

const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL;
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD;
const SUPER_ADMIN_NAME = process.env.SUPER_ADMIN_NAME ?? "Super Admin";

async function setup() {
  console.log("=== Gesso Premium — Setup Inicial ===\n");

  if (!SUPER_ADMIN_EMAIL || !SUPER_ADMIN_PASSWORD) {
    console.error("❌ SUPER_ADMIN_EMAIL e SUPER_ADMIN_PASSWORD são obrigatórios no .env");
    process.exit(1);
  }

  if (SUPER_ADMIN_PASSWORD.length < 8) {
    console.error("❌ SUPER_ADMIN_PASSWORD deve ter no mínimo 8 caracteres.");
    process.exit(1);
  }

  const db = getDb();

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, SUPER_ADMIN_EMAIL))
    .limit(1);

  if (existing.length > 0) {
    const u = existing[0];
    if (u.role !== "super_admin") {
      await db.update(users).set({ role: "super_admin" }).where(eq(users.id, u.id));
      console.log(`✓ Usuário existente promovido a super_admin: ${SUPER_ADMIN_EMAIL}`);
    } else {
      console.log(`✓ Super admin já existe: ${SUPER_ADMIN_EMAIL}`);
    }
    return;
  }

  const passwordHash = await hashPassword(SUPER_ADMIN_PASSWORD);
  const unionId = `super_${Date.now()}`;

  await db.insert(users).values({
    unionId,
    name: SUPER_ADMIN_NAME,
    email: SUPER_ADMIN_EMAIL,
    passwordHash,
    role: "super_admin",
    lastSignInAt: new Date(),
  });

  console.log("✓ Super admin criado com sucesso!");
  console.log(`  Nome:   ${SUPER_ADMIN_NAME}`);
  console.log(`  E-mail: ${SUPER_ADMIN_EMAIL}`);
  console.log("\n⚠️  Guarde a senha em local seguro. Não comite o .env no repositório.");
}

setup()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Erro no setup:", err.message);
    process.exit(1);
  });
