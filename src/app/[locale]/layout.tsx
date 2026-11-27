import type { Metadata, Viewport } from "next";
import { Inter, Montserrat } from "next/font/google";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import Providers from "@/components/Providers";
import { Toaster } from "@/components/ui/sonner";
import { languageTag, routing } from "@/i18n/routing";
import { siteUrl } from "@/lib/seo";
import "../globals.css";

const montserrat = Montserrat({
	subsets: ["latin"],
	variable: "--font-montserrat",
	display: "swap",
});

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
	display: "swap",
});

export const viewport: Viewport = {
	themeColor: "#121212",
	colorScheme: "dark",
};

export async function generateMetadata({
	params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
	const metadataBase = new URL(siteUrl);

	const { locale } = await params;
	if (!hasLocale(routing.locales, locale)) {
		return { metadataBase };
	}

	const t = await getTranslations({ locale, namespace: "meta" });

	return {
		metadataBase,
		title: {
			default: t("title"),
			template: `%s | ${t("siteName")}`,
		},
		description: t("description"),
		keywords: t("keywords"),
		authors: [{ name: "Kodon Amazon Taiko" }],
	};
}

export default async function RootLayout({
	children,
	params,
}: LayoutProps<"/[locale]">) {
	// A CSP usa um nonce por requisição (src/proxy.ts), então nenhuma página
	// pode ser pré-renderizada no build.
	await connection();

	const { locale } = await params;
	if (!hasLocale(routing.locales, locale)) {
		notFound();
	}

	const t = await getTranslations({ locale, namespace: "a11y" });

	return (
		<html
			lang={languageTag[locale]}
			className={`${montserrat.variable} ${inter.variable}`}
			data-scroll-behavior="smooth"
		>
			<body>
				<NextIntlClientProvider>
					<Providers>
						<a href="#conteudo" className="skip-link">
							{t("skipToContent")}
						</a>
						{children}
						<Toaster />
					</Providers>
				</NextIntlClientProvider>
			</body>
		</html>
	);
}
