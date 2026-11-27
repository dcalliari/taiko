import type { Metadata } from "next";
import heroTaiko from "@/assets/hero-taiko.jpg";
import { env } from "@/env";
import { getPathname } from "@/i18n/navigation";
import { type Locale, languageTag, routing } from "@/i18n/routing";

/** URL pública do site, sem barra final. */
export const siteUrl = env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "");

const openGraphLocale: Record<Locale, string> = {
	pt: "pt_BR",
	ja: "ja_JP",
};

/** URL absoluta de uma rota interna (ex.: "/loja") em um idioma. */
export function absoluteUrl(locale: Locale, pathname: string): string {
	return `${siteUrl}${getPathname({ locale, href: pathname })}`;
}

/** Mapa hreflang → URL de uma rota em todos os idiomas. */
export function languageAlternates(pathname: string): Record<string, string> {
	return {
		...Object.fromEntries(
			routing.locales.map((locale) => [
				languageTag[locale],
				absoluteUrl(locale, pathname),
			]),
		),
		"x-default": absoluteUrl(routing.defaultLocale, pathname),
	};
}

interface PageMetadataInput {
	locale: Locale;
	/** Rota interna sem prefixo de idioma, ex.: "/" ou "/loja". */
	pathname: string;
	title: string;
	description: string;
	siteName: string;
}

/** Canonical, hreflang, Open Graph e Twitter de uma página em um idioma. */
export function pageMetadata({
	locale,
	pathname,
	title,
	description,
	siteName,
}: PageMetadataInput): Metadata {
	const url = absoluteUrl(locale, pathname);

	return {
		description,
		alternates: {
			canonical: url,
			languages: languageAlternates(pathname),
		},
		openGraph: {
			type: "website",
			url,
			title,
			description,
			siteName,
			locale: openGraphLocale[locale],
			alternateLocale: routing.locales
				.filter((other) => other !== locale)
				.map((other) => openGraphLocale[other]),
			images: [
				{
					url: heroTaiko.src,
					width: heroTaiko.width,
					height: heroTaiko.height,
					alt: siteName,
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			site: "@KodonTaiko",
			title,
			description,
		},
	};
}
