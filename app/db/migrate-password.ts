import { getDb } from "../api/queries/connection";

async function run() {
  const db = getDb();
  try {
    await db.execute(
      "ALTER TABLE users ADD COLUMN passwordHash VARCHAR(255) NULL"
    );
    console.log("✓ Coluna passwordHash adicionada!");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("Duplicate column")) {
      console.log("✓ Coluna passwordHash já existe.");
    } else {
      throw err;
    }
  }
  process.exit(0);
}

run().catch(console.error);
