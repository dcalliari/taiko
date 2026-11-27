import { expect, test } from "@playwright/test";

test.describe("base de produção", () => {
	test("envia os cabeçalhos de segurança", async ({ request }) => {
		const response = await request.get("/");
		const headers = response.headers();

		expect(headers["strict-transport-security"]).toContain("max-age=63072000");
		expect(headers["x-content-type-options"]).toBe("nosniff");
		expect(headers["x-frame-options"]).toBe("DENY");
		expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
		expect(headers["x-powered-by"]).toBeUndefined();
		expect(headers["content-security-policy"]).toMatch(
			/script-src 'self' 'nonce-[\w+/=]+' 'strict-dynamic';/,
		);
	});

	test("usa um nonce novo a cada requisição", async ({ request }) => {
		const nonceOf = async () =>
			(await request.get("/"))
				.headers()
				["content-security-policy"]?.match(/'nonce-([^']+)'/)?.[1];

		const [first, second] = [await nonceOf(), await nonceOf()];

		expect(first).toBeTruthy();
		expect(first).not.toBe(second);
	});

	for (const path of ["/", "/ja", "/loja"]) {
		test(`não viola a CSP em ${path}`, async ({ page }) => {
			const violations: string[] = [];
			page.on("console", (message) => {
				if (message.text().includes("Content Security Policy")) {
					violations.push(message.text());
				}
			});

			await page.goto(path);
			await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
			// A hidratação prova que os scripts com nonce rodaram.
			await page
				.getByRole("button", { name: /Termos de Uso|利用規約/ })
				.click();
			await expect(page.getByRole("dialog")).toBeVisible();

			expect(violations).toEqual([]);
		});
	}

	test("publica robots.txt e sitemap.xml", async ({ request, baseURL }) => {
		const robots = await request.get("/robots.txt");
		expect(robots.ok()).toBe(true);
		expect(await robots.text()).toContain(`Sitemap: ${baseURL}/sitemap.xml`);

		const sitemap = await request.get("/sitemap.xml");
		expect(sitemap.ok()).toBe(true);
		const xml = await sitemap.text();
		expect(xml).toContain(`<loc>${baseURL}/ja/loja</loc>`);
		expect(xml).toContain('hreflang="pt-BR"');
	});

	test("verificação de saúde confirma aplicação e banco no ar", async ({
		request,
	}) => {
		const response = await request.get("/api/health");

		expect(
			response.status(),
			"o banco precisa estar no ar (npm run db:up) e migrado (npm run db:migrate)",
		).toBe(200);
		expect(await response.json()).toEqual({ status: "ok" });
	});
});
