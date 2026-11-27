import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { absoluteUrl, languageAlternates } from "@/lib/seo";

// Rotas públicas indexáveis, sem prefixo de idioma. Página nova entra aqui.
const pathnames = ["/", "/loja"];

export default function sitemap(): MetadataRoute.Sitemap {
	return pathnames.flatMap((pathname) =>
		routing.locales.map((locale) => ({
			url: absoluteUrl(locale, pathname),
			alternates: { languages: languageAlternates(pathname) },
		})),
	);
}
