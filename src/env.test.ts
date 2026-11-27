import { afterEach, describe, expect, it, vi } from "vitest";

async function loadEnv() {
	vi.resetModules();
	return (await import("./env")).env;
}

describe("env", () => {
	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it("expõe as variáveis quando a configuração é válida", async () => {
		const env = await loadEnv();

		expect(env.NEXT_PUBLIC_SITE_URL).toBe("https://kodon.test");
		expect(env.DATABASE_URL).toMatch(/^postgres:\/\//);
	});

	it("recusa iniciar sem DATABASE_URL", async () => {
		vi.stubEnv("DATABASE_URL", "");

		await expect(loadEnv()).rejects.toThrow(/Invalid environment variables/);
	});

	it("recusa uma URL de site inválida", async () => {
		vi.stubEnv("NEXT_PUBLIC_SITE_URL", "kodon.test");

		await expect(loadEnv()).rejects.toThrow(/Invalid environment variables/);
	});
});
