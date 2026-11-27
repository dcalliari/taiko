import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/**
 * Fonte única das variáveis de ambiente, validadas na inicialização.
 * Variável nova entra aqui e em .env.example; o código lê de `env`, nunca de
 * `process.env`.
 */
export const env = createEnv({
	server: {
		DATABASE_URL: z.url(),
	},
	client: {
		NEXT_PUBLIC_SITE_URL: z.url(),
	},
	shared: {
		NODE_ENV: z
			.enum(["development", "test", "production"])
			.default("development"),
	},
	experimental__runtimeEnv: {
		NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
		NODE_ENV: process.env.NODE_ENV,
	},
	emptyStringAsUndefined: true,
	skipValidation: process.env.SKIP_ENV_VALIDATION === "1",
});
