import { describe, expect, it, vi } from "vitest";
import { absoluteUrl, languageAlternates, pageMetadata } from "./seo";

vi.mock("@/assets/hero-taiko.jpg", () => ({
	default: { src: "/hero-taiko.jpg", width: 1920, height: 1080 },
}));

describe("absoluteUrl", () => {
	it("deixa o português na raiz e o japonês sob /ja", () => {
		expect(absoluteUrl("pt", "/")).toBe("https://kodon.test/");
		expect(absoluteUrl("ja", "/")).toBe("https://kodon.test/ja");
		expect(absoluteUrl("pt", "/loja")).toBe("https://kodon.test/loja");
		expect(absoluteUrl("ja", "/loja")).toBe("https://kodon.test/ja/loja");
	});
});

describe("languageAlternates", () => {
	it("lista todos os idiomas e aponta x-default para o padrão", () => {
		expect(languageAlternates("/loja")).toEqual({
			"pt-BR": "https://kodon.test/loja",
			ja: "https://kodon.test/ja/loja",
			"x-default": "https://kodon.test/loja",
		});
	});
});

describe("pageMetadata", () => {
	const metadata = pageMetadata({
		locale: "ja",
		pathname: "/loja",
		title: "公式ショップ",
		description: "説明",
		siteName: "鼓動アマゾン太鼓",
	});

	it("aponta canonical para a URL do próprio idioma", () => {
		expect(metadata.alternates?.canonical).toBe("https://kodon.test/ja/loja");
	});

	it("declara o idioma da página e os alternativos no Open Graph", () => {
		expect(metadata.openGraph).toMatchObject({
			url: "https://kodon.test/ja/loja",
			title: "公式ショップ",
			locale: "ja_JP",
			alternateLocale: ["pt_BR"],
		});
	});
});
