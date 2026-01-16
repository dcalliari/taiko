import AboutSection from "@/components/AboutSection";
import AudioPlayer from "@/components/AudioPlayer";
import Footer from "@/components/Footer";
import GallerySection from "@/components/GallerySection";
import Header from "@/components/Header";
import HeroCarousel from "@/components/HeroCarousel";
import NewsSection from "@/components/NewsSection";
import PillarsSection from "@/components/PillarsSection";
import SupportSection from "@/components/SupportSection";

const Index = () => {
	return (
		<div className="min-h-screen">
			<Header />
			<main>
				<HeroCarousel />
				<AboutSection />
				<PillarsSection />
				<AudioPlayer />
				<NewsSection />
				<GallerySection />
				<SupportSection />
			</main>
			<Footer />
		</div>
	);
};

export default Index;
