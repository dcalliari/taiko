import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import heroDrums from "@/assets/hero-drums.jpg";
import heroPerformance from "@/assets/hero-performance.jpg";
import heroTaiko from "@/assets/hero-taiko.jpg";

const HeroCarousel = () => {
	const { t } = useTranslation();
	const [currentSlide, setCurrentSlide] = useState(0);

	const slides = [
		{
			image: heroTaiko,
			title: t("hero.slide1.title"),
			subtitle: t("hero.slide1.subtitle"),
			cta: { label: t("hero.slide1.cta"), href: "#quem-somos" },
		},
		{
			image: heroDrums,
			title: t("hero.slide2.title"),
			subtitle: t("hero.slide2.subtitle"),
			cta: { label: t("hero.slide2.cta"), href: "#galeria" },
		},
		{
			image: heroPerformance,
			title: t("hero.slide3.title"),
			subtitle: t("hero.slide3.subtitle"),
			cta: { label: t("hero.slide3.cta"), href: "#agenda" },
		},
	];

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentSlide((prev) => (prev + 1) % slides.length);
		}, 6000);
		return () => clearInterval(interval);
	}, [slides.length]);

	const goToSlide = (index: number) => {
		setCurrentSlide(index);
	};

	const nextSlide = () => {
		setCurrentSlide((prev) => (prev + 1) % slides.length);
	};

	const prevSlide = () => {
		setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
	};

	return (
		<section className="relative h-screen w-full overflow-hidden">
			<AnimatePresence mode="wait">
				<motion.div
					key={currentSlide}
					initial={{ opacity: 0, scale: 1.1 }}
					animate={{ opacity: 1, scale: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 1 }}
					className="absolute inset-0"
				>
					<div
						className="absolute inset-0 bg-cover bg-center"
						style={{ backgroundImage: `url(${slides[currentSlide].image})` }}
					/>
					<div className="absolute inset-0 bg-gradient-to-r from-muted/90 via-muted/60 to-transparent" />
					<div className="absolute inset-0 bg-gradient-to-t from-muted via-transparent to-muted/30" />
				</motion.div>
			</AnimatePresence>

			{/* Content */}
			<div className="relative h-full flex items-center">
				<div className="container mx-auto px-4">
					<motion.div
						key={`content-${currentSlide}`}
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -30 }}
						transition={{ duration: 0.8, delay: 0.3 }}
						className="max-w-3xl"
					>
						<h1 className="heading-display text-primary-foreground mb-4 leading-tight">
							{slides[currentSlide].title}
						</h1>
						<p className="text-xl md:text-2xl text-muted-foreground mb-8 font-body">
							{slides[currentSlide].subtitle}
						</p>
						<a
							href={slides[currentSlide].cta.href}
							className="inline-block px-8 py-4 bg-primary text-primary-foreground font-heading font-bold uppercase tracking-wider text-sm hover:bg-primary/90 transition-all duration-300 hover:shadow-lg hover:shadow-primary/30"
						>
							{slides[currentSlide].cta.label}
						</a>
					</motion.div>
				</div>
			</div>

			{/* Navigation Arrows */}
			<button
				type="button"
				onClick={prevSlide}
				className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-primary-foreground/70 hover:text-primary-foreground transition-colors"
				aria-label="Slide anterior"
			>
				<ChevronLeft className="w-8 h-8" />
			</button>
			<button
				type="button"
				onClick={nextSlide}
				className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-primary-foreground/70 hover:text-primary-foreground transition-colors"
				aria-label="Próximo slide"
			>
				<ChevronRight className="w-8 h-8" />
			</button>

			{/* Dots */}
			<div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
				{slides.map((_, index) => (
					<button
						type="button"
						key={crypto.randomUUID()}
						onClick={() => goToSlide(index)}
						className={`w-3 h-3 rounded-full transition-all duration-300 ${
							index === currentSlide
								? "bg-primary w-8"
								: "bg-primary-foreground/30 hover:bg-primary-foreground/50"
						}`}
						aria-label={`Ir para slide ${index + 1}`}
					/>
				))}
			</div>

			{/* Scroll indicator */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 2 }}
				className="absolute bottom-8 right-8 hidden md:block"
			>
				<motion.div
					animate={{ y: [0, 10, 0] }}
					transition={{ duration: 1.5, repeat: Infinity }}
					className="flex flex-col items-center text-muted-foreground"
				>
					<span className="text-xs uppercase tracking-widest mb-2">Role</span>
					<div className="w-px h-12 bg-gradient-to-b from-primary to-transparent" />
				</motion.div>
			</motion.div>
		</section>
	);
};

export default HeroCarousel;
