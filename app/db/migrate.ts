import "dotenv/config";
import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";

const url = process.env.DATABASE_URL;
if (!url) { console.error("DATABASE_URL não configurado."); process.exit(1); }

async function run() {
  console.log("=== Aplicando migrations ===\n");

  const conn = await mysql.createConnection(url!);

  const migrationsDir = path.join(process.cwd(), "db/migrations");
  const files = fs.readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const raw = fs.readFileSync(path.join(migrationsDir, file), "utf-8");
    // remove drizzle-kit statement-breakpoint markers (inline and full-line)
    const sql = raw.replace(/--> statement-breakpoint/g, "").trim();
    if (!sql) continue;
    console.log(`→ ${file}`);
    const statements = sql.split(";").map((s) => s.trim()).filter(Boolean);
    for (const stmt of statements) {
      try {
        await conn.execute(stmt);
      } catch (e: any) {
        // skip "already exists" errors
        if (e.code === "ER_TABLE_EXISTS_ERROR" || e.errno === 1050) {
          console.log(`  ⚠ tabela já existe, pulando`);
        } else if (e.code === "ER_DUP_FIELDNAME" || e.errno === 1060) {
          console.log(`  ⚠ coluna já existe, pulando`);
        } else {
          throw e;
        }
      }
    }
    console.log(`  ✓ ok`);
  }

  await conn.end();
  console.log("\n✓ Migrations concluídas!");
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Erro:", err.message);
    process.exit(1);
  });
