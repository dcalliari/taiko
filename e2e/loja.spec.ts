import { expect, test } from "@playwright/test";

test.describe("loja", () => {
	test("abre a partir do menu da página inicial", async ({ page }) => {
		await page.goto("/");

		await page
			.getByRole("navigation", { name: "Navegação principal" })
			.getByRole("link", { name: "Loja" })
			.click();

		await expect(page).toHaveURL("/loja");
		await expect(page).toHaveTitle("Loja Oficial | Kodon Amazon Taiko");
		await expect(
			page.getByRole("heading", { level: 1, name: "NOSSA LOJA" }),
		).toBeVisible();
	});

	test("lista os produtos e filtra por categoria", async ({ page }) => {
		await page.goto("/loja");
		const products = page.getByRole("main").getByRole("heading", { level: 3 });

		await expect(products).toHaveCount(8);

		await page.getByRole("button", { name: "Música" }).click();
		await expect(products).toHaveCount(2);
		await expect(
			page.getByRole("heading", { name: "CD - Ritmos da Amazônia" }),
		).toBeVisible();
	});

	test("adiciona ao carrinho um produto com tamanho e soma o total", async ({
		page,
	}) => {
		await page.goto("/loja");

		await page
			.getByRole("button", { name: "Adicionar: Camiseta Kodon Oficial" })
			.click();
		const sizeDialog = page.getByRole("dialog", {
			name: "Camiseta Kodon Oficial",
		});
		await sizeDialog.getByRole("button", { name: "G", exact: true }).click();
		await sizeDialog.getByRole("button", { name: "Adicionar" }).click();

		const cart = page.getByRole("dialog", { name: "Carrinho (1)" });
		await expect(cart).toBeVisible();
		await expect(cart.getByText("Tamanho: G")).toBeVisible();

		await cart
			.getByRole("button", {
				name: "Aumentar quantidade: Camiseta Kodon Oficial",
			})
			.click();
		await expect(
			page.getByRole("dialog", { name: "Carrinho (2)" }),
		).toBeVisible();
		await expect(page.getByText("R$ 179,80")).toBeVisible();

		await page.keyboard.press("Escape");
		await expect(page.getByRole("dialog")).toBeHidden();
	});
});
