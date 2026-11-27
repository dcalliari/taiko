import { expect, test } from "@playwright/test";

test.describe("página não encontrada", () => {
	test("responde 404 em português com caminho de volta", async ({ page }) => {
		const response = await page.goto("/pagina-que-nao-existe");

		expect(response?.status()).toBe(404);
		await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
		await expect(page.getByText("Página não encontrada")).toBeVisible();

		await page.getByRole("link", { name: "Voltar ao Início" }).click();
		await expect(page).toHaveURL("/");
	});

	test("responde 404 em japonês sob /ja", async ({ page }) => {
		const response = await page.goto("/ja/pagina-que-nao-existe");

		expect(response?.status()).toBe(404);
		await expect(page.locator("html")).toHaveAttribute("lang", "ja");
		await expect(page.getByText("ページが見つかりません")).toBeVisible();
	});
});
