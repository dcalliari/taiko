import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url)),
		},
	},
	test: {
		environment: "node",
		include: ["src/**/*.test.{ts,tsx}"],
		// Valores fixos para src/env.ts; testes de unidade nunca abrem conexão
		// com este banco (use createTestDatabase de src/db/testing.ts).
		env: {
			NEXT_PUBLIC_SITE_URL: "https://kodon.test",
			DATABASE_URL: "postgres://taiko@localhost:5432/taiko_test",
		},
		server: {
			deps: {
				// next-intl importa "next/navigation" sem extensão, que só resolve
				// quando o pacote passa pelo pipeline do Vite.
				inline: ["next-intl"],
			},
		},
	},
});
