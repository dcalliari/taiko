import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.E2E_PORT ?? 3210);
const baseURL = `http://localhost:${port}`;

export default defineConfig({
	testDir: "./e2e",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	reporter: process.env.CI
		? [["github"], ["html", { open: "never" }]]
		: [["list"]],
	use: {
		baseURL,
		locale: "pt-BR",
		trace: "on-first-retry",
	},
	projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
	// Os fluxos rodam contra o build de produção, o mesmo que vai ao ar.
	// DATABASE_URL vem do ambiente ou de .env.local, como em qualquer execução.
	webServer: {
		command: `npm run build && npm run start -- --port ${port}`,
		url: baseURL,
		reuseExistingServer: !process.env.CI,
		timeout: 180_000,
		env: { NEXT_PUBLIC_SITE_URL: baseURL },
	},
});
