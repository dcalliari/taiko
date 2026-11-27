import { sql } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { createTestDatabase } from "./testing";

describe("createTestDatabase", () => {
	it("entrega um Postgres em memória com as migrations aplicadas", async () => {
		const { db, close } = await createTestDatabase();

		try {
			const result = await db.execute(sql`select 1 + 1 as total`);
			expect(result.rows).toEqual([{ total: 2 }]);

			const migrations = await db.execute(
				sql`select to_regclass('drizzle.__drizzle_migrations') as tabela`,
			);
			expect(migrations.rows[0]?.tabela).toBe("drizzle.__drizzle_migrations");
		} finally {
			await close();
		}
	});
});
