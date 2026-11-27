import { describe, expect, it, vi } from "vitest";
import robots from "./robots";
import sitemap from "./sitemap";

vi.mock("@/assets/hero-taiko.jpg", () => ({
	default: { src: "/hero-taiko.jpg", width: 1920, height: 1080 },
}));

describe("sitemap", () => {
	it("lista cada página pública em português e japonês", () => {
		const urls = sitemap().map((entry) => entry.url);

		expect(urls).toEqual([
			"https://kodon.test/",
			"https://kodon.test/ja",
			"https://kodon.test/loja",
			"https://kodon.test/ja/loja",
		]);
	});

	it("cruza os idiomas de cada página com hreflang", () => {
		const home = sitemap().find(
			(entry) => entry.url === "https://kodon.test/ja",
		);

		expect(home?.alternates?.languages).toMatchObject({
			"pt-BR": "https://kodon.test/",
			ja: "https://kodon.test/ja",
		});
	});
});

describe("robots", () => {
	it("libera o site, protege /api e aponta para o sitemap", () => {
		expect(robots()).toEqual({
			rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
			sitemap: "https://kodon.test/sitemap.xml",
		});
	});
});
