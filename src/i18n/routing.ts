import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
	locales: ["pt", "ja"],
	defaultLocale: "pt",
	// Português fica na raiz (/, /loja); japonês sob /ja.
	localePrefix: "as-needed",
	// Os hreflang saem dos metadados de cada página (src/lib/seo.ts).
	alternateLinks: false,
});

export type Locale = (typeof routing.locales)[number];

/** Tag BCP 47 de cada idioma, usada em <html lang> e nos hreflang. */
export const languageTag: Record<Locale, string> = {
	pt: "pt-BR",
	ja: "ja",
};
