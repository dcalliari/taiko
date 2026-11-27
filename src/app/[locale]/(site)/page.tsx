import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import AboutSection from "@/components/AboutSection";
import AudioPlayer from "@/components/AudioPlayer";
import GallerySection from "@/components/GallerySection";
import HeroCarousel from "@/components/HeroCarousel";
import HistorySection from "@/components/HistorySection";
import NewsSection from "@/components/NewsSection";
import PillarsSection from "@/components/PillarsSection";
import SupportSection from "@/components/SupportSection";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
	const locale = await getLocale();
	const t = await getTranslations("meta");

	return {
		title: { absolute: t("title") },
		...pageMetadata({
			locale,
			pathname: "/",
			title: t("title"),
			description: t("description"),
			siteName: t("siteName"),
		}),
	};
}

export default function HomePage() {
	return (
		<>
			<HeroCarousel />
			<AboutSection />
			<HistorySection />
			<PillarsSection />
			<AudioPlayer />
			<NewsSection />
			<GallerySection />
			<SupportSection />
		</>
	);
}
