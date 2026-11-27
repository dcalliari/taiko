import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import * as schema from "./schema";

/**
 * Banco Postgres em memória (PGlite) com todas as migrations aplicadas, para
 * testes de unidade e integração sem container. Feche com `close()` ao final.
 */
export async function createTestDatabase() {
	const client = new PGlite();
	const db = drizzle({ client, schema });
	await migrate(db, { migrationsFolder: "drizzle" });

	return { db, close: () => client.close() };
}
