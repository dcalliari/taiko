import { afterEach, describe, expect, it, vi } from "vitest";
import { createTestDatabase } from "@/db/testing";

const database = vi.hoisted(() => ({ current: undefined as unknown }));

vi.mock("@/db", () => ({
	get db() {
		return database.current;
	},
}));

describe("GET /api/health", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("responde ok quando o banco atende", async () => {
		const { db, close } = await createTestDatabase();
		database.current = db;
		const { GET } = await import("./route");

		try {
			const response = await GET();

			expect(response.status).toBe(200);
			expect(await response.json()).toEqual({ status: "ok" });
			expect(response.headers.get("Cache-Control")).toBe("no-store");
		} finally {
			await close();
		}
	});

	it("responde 503 sem vazar detalhes quando o banco falha", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		database.current = {
			execute: () => Promise.reject(new Error("connection refused")),
		};
		const { GET } = await import("./route");

		const response = await GET();

		expect(response.status).toBe(503);
		expect(await response.json()).toEqual({ status: "error" });
	});
});
