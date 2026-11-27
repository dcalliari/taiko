import { expect, test } from "@playwright/test";

test.describe("página inicial", () => {
	test("abre em português por padrão", async ({ page }) => {
		await page.goto("/");

		await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
		await expect(page).toHaveTitle(
			"Kodon Amazon Taiko | A Força do Tambor na Amazônia",
		);
		await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
		await expect(
			page.getByRole("heading", { name: "QUEM SOMOS" }),
		).toBeVisible();
		await expect(
			page
				.getByRole("navigation", { name: "Navegação principal" })
				.getByRole("link", { name: "Loja" }),
		).toBeVisible();
	});

	test("abre em japonês sob /ja", async ({ page }) => {
		await page.goto("/ja");

		await expect(page.locator("html")).toHaveAttribute("lang", "ja");
		await expect(page).toHaveTitle("鼓動アマゾン太鼓 | アマゾンの太鼓の力");
		await expect(
			page.getByRole("heading", { name: "私たちについて" }),
		).toBeVisible();
	});

	test("mantém todas as seções institucionais", async ({ page }) => {
		await page.goto("/");

		for (const id of [
			"quem-somos",
			"historia",
			"musica",
			"agenda",
			"galeria",
			"apoie",
			"contato",
		]) {
			await expect(page.locator(`#${id}`)).toBeAttached();
		}
	});

	test("declara canonical, hreflang e Open Graph do idioma", async ({
		page,
		baseURL,
	}) => {
		await page.goto("/ja");

		await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
			"href",
			`${baseURL}/ja`,
		);
		await expect(
			page.locator('link[rel="alternate"][hreflang="pt-BR"]'),
		).toHaveAttribute("href", new RegExp(`^${baseURL}/?$`));
		await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute(
			"content",
			"ja_JP",
		);
		await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
			"content",
			/^http.+hero-taiko/,
		);
	});

	test("abre a política de privacidade em um diálogo que fecha com Esc", async ({
		page,
	}) => {
		await page.goto("/");

		await page.getByRole("button", { name: "Política de Privacidade" }).click();
		const dialog = page.getByRole("dialog", {
			name: "Política de Privacidade",
		});
		await expect(dialog).toBeVisible();
		await expect(
			dialog.getByRole("heading", { name: "Seus Direitos" }),
		).toBeVisible();

		await page.keyboard.press("Escape");
		await expect(dialog).toBeHidden();
	});
});

test.describe("menu no celular", () => {
	test.use({ viewport: { width: 390, height: 844 } });

	test("abre pelo botão e leva até a loja", async ({ page }) => {
		await page.goto("/");

		const toggle = page.getByRole("button", { name: "Abrir menu" });
		await expect(toggle).toHaveAttribute("aria-expanded", "false");
		await toggle.click();
		await expect(
			page.getByRole("button", { name: "Fechar menu" }),
		).toHaveAttribute("aria-expanded", "true");

		await page
			.getByRole("navigation", { name: "Navegação principal" })
			.getByRole("link", { name: "Loja" })
			.click();

		await expect(page).toHaveURL("/loja");
		await expect(
			page.getByRole("navigation", { name: "Navegação principal" }),
		).toBeHidden();
	});
});

test.describe("troca de idioma", () => {
	test("alterna entre português e japonês pelo cabeçalho", async ({ page }) => {
		await page.goto("/");
		const switcher = page.getByRole("group", { name: "Idioma" });

		await switcher.getByRole("link", { name: "JP" }).click();
		await expect(page).toHaveURL("/ja");
		await expect(page.locator("html")).toHaveAttribute("lang", "ja");
		await expect(
			page.getByRole("heading", { name: "私たちについて" }),
		).toBeVisible();

		await page
			.getByRole("group", { name: "言語" })
			.getByRole("link", { name: "PT" })
			.click();
		await expect(page).toHaveURL("/");
		await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
		await expect(
			page.getByRole("heading", { name: "QUEM SOMOS" }),
		).toBeVisible();
	});

	test("mantém a página atual ao trocar de idioma", async ({ page }) => {
		await page.goto("/loja");

		await page
			.getByRole("group", { name: "Idioma" })
			.getByRole("link", { name: "JP" })
			.click();

		await expect(page).toHaveURL("/ja/loja");
		await expect(
			page.getByRole("heading", { level: 1, name: "ショップ" }),
		).toBeVisible();
	});

	test.describe("navegador em japonês", () => {
		test.use({ locale: "ja-JP" });

		test("cai em /ja e ainda consegue escolher português", async ({ page }) => {
			await page.goto("/");
			await expect(page).toHaveURL("/ja");

			await page
				.getByRole("group", { name: "言語" })
				.getByRole("link", { name: "PT" })
				.click();

			await expect(page).toHaveURL("/");
			await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");

			await page.reload();
			await expect(page).toHaveURL("/");
		});
	});
});
