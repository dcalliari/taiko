import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import Store from "@/components/Store";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
	const locale = await getLocale();
	const t = await getTranslations();

	return {
		title: t("store.label"),
		...pageMetadata({
			locale,
			pathname: "/loja",
			title: `${t("store.label")} | ${t("meta.siteName")}`,
			description: t("store.description"),
			siteName: t("meta.siteName"),
		}),
	};
}

export default function StorePage() {
	return <Store />;
}
