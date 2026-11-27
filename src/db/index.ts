import { drizzle } from "drizzle-orm/node-postgres";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { Pool } from "pg";
import { env } from "@/env";
import * as schema from "./schema";

/**
 * Tipo do banco independente de driver: código que recebe `Database` funciona
 * tanto com o Postgres real quanto com o PGlite dos testes (src/db/testing.ts).
 */
export type Database = PgDatabase<PgQueryResultHKT, typeof schema>;

// Em desenvolvimento o HMR reavalia este módulo; o pool fica em globalThis
// para não abrir um novo conjunto de conexões a cada recarga.
const globalForDb = globalThis as typeof globalThis & { pgPool?: Pool };

function createPool() {
	const created = new Pool({
		connectionString: env.DATABASE_URL,
		connectionTimeoutMillis: 5_000,
	});
	// Sem ouvinte, a queda de uma conexão ociosa (reinício ou failover do banco)
	// vira exceção não capturada e derruba o processo.
	created.on("error", (error) => {
		console.error("Pool do Postgres: conexão ociosa caiu", error);
	});
	return created;
}

const pool = globalForDb.pgPool ?? createPool();

if (env.NODE_ENV !== "production") {
	globalForDb.pgPool = pool;
}

export const db = drizzle({ client: pool, schema });
