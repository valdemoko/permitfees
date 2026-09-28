import { neon } from "@neondatabase/serverless";

/**
 * One-off cleanup for the stale ELEC-RES-SERVICE-CHANGE fee rules.
 * Requires DATABASE_URL; fails loudly rather than handing `undefined` to the
 * client, and binds the id instead of concatenating it into the SQL text.
 */
const databaseUrl = process.env.DATABASE_URL ?? "";
if (databaseUrl === "") {
  throw new Error("DATABASE_URL is not set");
}

async function main() {
  const sql = neon(databaseUrl);
  const rows = await sql`SELECT fr.id, fr.code, j.slug FROM fee_rules fr JOIN jurisdictions j ON j.id = fr.jurisdiction_id WHERE fr.code = 'ELEC-RES-SERVICE-CHANGE'`;
  console.log("Found:", JSON.stringify(rows));
  for (const r of rows) {
    await sql`DELETE FROM verification_records WHERE entity_id = ${r.id}`;
    await sql`DELETE FROM fee_rules WHERE id = ${r.id}`;
    console.log("Deleted:", r.code, r.slug);
  }
  if (!rows.length) console.log("Nothing found");
}
main().catch(console.error);
