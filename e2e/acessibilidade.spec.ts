import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

// Com movimento reduzido o carrossel não troca sozinho e sobram só as
// transições de opacidade, o que deixa a análise estável.
test.use({ reducedMotion: "reduce" });

/** Rola a página inteira para disparar as animações de entrada das seções. */
async function revealAllSections(page: Page) {
	await page.evaluate(async () => {
		const step = window.innerHeight / 2;
		for (let y = 0; y < document.body.scrollHeight; y += step) {
			window.scrollTo(0, y);
			await new Promise((resolve) => setTimeout(resolve, 100));
		}
		window.scrollTo(0, 0);
	});
	// Maior atraso + duração das animações de entrada (linha do tempo: 0.8s + 0.6s).
	await page.waitForTimeout(2000);
}

async function expectNoViolations(page: Page) {
	const results = await new AxeBuilder({ page })
		.withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
		.analyze();

	expect(
		results.violations.map(({ id, nodes }) => ({
			id,
			nodes: nodes.map((node) => node.target.join(" ")),
		})),
	).toEqual([]);
}

test.describe("acessibilidade (WCAG 2.1 AA)", () => {
	for (const path of ["/", "/ja", "/loja", "/pagina-que-nao-existe"]) {
		test(`sem violações em ${path}`, async ({ page }) => {
			await page.goto(path);
			await revealAllSections(page);

			await expectNoViolations(page);
		});
	}

	test("sem violações com o carrinho aberto", async ({ page }) => {
		await page.goto("/loja");
		await page
			.getByRole("button", { name: "Adicionar: Bachi Artesanal" })
			.click();
		await expect(
			page.getByRole("dialog", { name: "Carrinho (1)" }),
		).toBeVisible();
		await page.waitForTimeout(1000);

		await expectNoViolations(page);
	});

	test("sem violações com um texto legal aberto", async ({ page }) => {
		await page.goto("/");
		await page.getByRole("button", { name: "Termos de Uso" }).click();
		await expect(
			page.getByRole("dialog", { name: "Termos de Uso" }),
		).toBeVisible();
		await page.waitForTimeout(1000);

		await expectNoViolations(page);
	});

	test("o link de pular vai direto ao conteúdo pelo teclado", async ({
		page,
	}) => {
		await page.goto("/");

		await page.keyboard.press("Tab");
		const skipLink = page.getByRole("link", { name: "Pular para o conteúdo" });
		await expect(skipLink).toBeFocused();
		await expect(skipLink).toBeInViewport();

		await page.keyboard.press("Enter");
		await expect(page).toHaveURL("/#conteudo");
	});

	test("o submenu do cabeçalho abre pelo teclado e fecha com Esc", async ({
		page,
	}) => {
		await page.goto("/");
		const nav = page.getByRole("navigation", { name: "Navegação principal" });

		await nav.getByRole("link", { name: "Sobre o Kodon" }).focus();
		const subItem = nav.getByRole("link", { name: "História" });
		await expect(subItem).toBeVisible();

		await page.keyboard.press("Tab");
		await page.keyboard.press("Tab");
		await expect(subItem).toBeFocused();

		await page.keyboard.press("Escape");
		await expect(subItem).toBeHidden();
	});
});
