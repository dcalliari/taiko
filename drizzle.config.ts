import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

// O drizzle-kit roda fora do Next; carrega os mesmos arquivos .env que ele.
loadEnvConfig(process.cwd());

const url = process.env.DATABASE_URL;
if (!url) {
	throw new Error("Defina DATABASE_URL (veja .env.example).");
}

export default defineConfig({
	dialect: "postgresql",
	schema: "./src/db/schema.ts",
	out: "./drizzle",
	dbCredentials: { url },
});
