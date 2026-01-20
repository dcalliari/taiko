import {
	AnimatePresence,
	motion,
	useScroll,
	useTransform,
} from "framer-motion";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import heroDrums from "@/assets/hero-drums.jpg";
import heroPerformance from "@/assets/hero-performance.jpg";
import heroTaiko from "@/assets/hero-taiko.jpg";

const HeroCarousel = () => {
	const { t } = useTranslation();
	const [currentSlide, setCurrentSlide] = useState(0);
	const heroRef = useRef<HTMLElement>(null);

	const { scrollY } = useScroll();
	const { scrollYProgress } = useScroll({
		target: heroRef,
		offset: ["start start", "end start"],
	});

	// Parallax transforms
	const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
	const backgroundScale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);
	const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
	const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
	const overlayOpacity = useTransform(scrollYProgress, [0, 0.5], [0.6, 0.9]);

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
			cta: { label: t("hero.slide3.cta"), href: "#historia" },
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
		<section ref={heroRef} className="relative h-screen w-full overflow-hidden">
			{/* Parallax Background Layer */}
			<motion.div
				className="absolute inset-0 w-full h-[120%] -top-[10%]"
				style={{
					y: backgroundY,
					scale: backgroundScale,
				}}
			>
				<AnimatePresence mode="wait">
					<motion.div
						key={currentSlide}
						initial={{ opacity: 0, scale: 1.1 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 1.2 }}
						className="absolute inset-0"
					>
						<div
							className="absolute inset-0 bg-cover bg-center"
							style={{ backgroundImage: `url(${slides[currentSlide].image})` }}
						/>
					</motion.div>
				</AnimatePresence>
			</motion.div>

			{/* Dynamic Overlay */}
			<motion.div
				className="absolute inset-0 bg-gradient-to-r from-muted/95 via-muted/70 to-muted/40"
				style={{ opacity: overlayOpacity }}
			/>
			<div className="absolute inset-0 bg-gradient-to-t from-muted via-transparent to-muted/30" />

			{/* Floating Decorative Elements with Parallax */}
			<motion.div
				className="absolute top-20 right-20 w-64 h-64 rounded-full bg-primary/10 blur-3xl"
				style={{
					y: useTransform(scrollY, [0, 500], [0, 100]),
				}}
			/>
			<motion.div
				className="absolute bottom-40 left-10 w-48 h-48 rounded-full bg-primary/5 blur-2xl"
				style={{
					y: useTransform(scrollY, [0, 500], [0, 150]),
				}}
			/>

			{/* Content with Parallax */}
			<motion.div
				className="relative h-full flex items-center"
				style={{
					y: contentY,
					opacity: contentOpacity,
				}}
			>
				<div className="container mx-auto px-4">
					<motion.div
						key={`content-${currentSlide}`}
						initial={{ opacity: 0, y: 50 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -50 }}
						transition={{ duration: 0.8, delay: 0.3 }}
						className="max-w-3xl"
					>
						{/* Decorative Line */}
						<motion.div
							initial={{ width: 0 }}
							animate={{ width: "80px" }}
							transition={{ duration: 0.8, delay: 0.5 }}
							className="h-1 bg-primary mb-8"
						/>

						<h1 className="heading-display text-primary-foreground mb-6 leading-tight">
							<motion.span
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: 0.4 }}
								className="block"
							>
								{slides[currentSlide].title}
							</motion.span>
						</h1>

						<motion.p
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.6 }}
							className="text-xl md:text-2xl text-muted-foreground mb-10 font-body max-w-2xl"
						>
							{slides[currentSlide].subtitle}
						</motion.p>

						<motion.a
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.8 }}
							href={slides[currentSlide].cta.href}
							className="group inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground font-heading font-bold uppercase tracking-wider text-sm hover:bg-primary/90 transition-all duration-300 hover:shadow-lg hover:shadow-primary/30"
						>
							{slides[currentSlide].cta.label}
							<motion.span
								className="inline-block"
								animate={{ x: [0, 5, 0] }}
								transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
							>
								→
							</motion.span>
						</motion.a>
					</motion.div>
				</div>
			</motion.div>

			{/* Navigation Arrows */}
			<motion.button
				type="button"
				onClick={prevSlide}
				className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-3 text-primary-foreground/70 hover:text-primary-foreground transition-colors bg-muted/20 hover:bg-muted/40 backdrop-blur-sm rounded-full"
				aria-label="Slide anterior"
				style={{ opacity: contentOpacity }}
				whileHover={{ scale: 1.1 }}
				whileTap={{ scale: 0.95 }}
			>
				<ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
			</motion.button>
			<motion.button
				type="button"
				onClick={nextSlide}
				className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-3 text-primary-foreground/70 hover:text-primary-foreground transition-colors bg-muted/20 hover:bg-muted/40 backdrop-blur-sm rounded-full"
				aria-label="Próximo slide"
				style={{ opacity: contentOpacity }}
				whileHover={{ scale: 1.1 }}
				whileTap={{ scale: 0.95 }}
			>
				<ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
			</motion.button>

			{/* Slide Indicators */}
			<motion.div
				className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3"
				style={{ opacity: contentOpacity }}
			>
				{slides.map((_, index) => (
					<button
						type="button"
						key={crypto.randomUUID()}
						onClick={() => goToSlide(index)}
						className={`h-3 rounded-full transition-all duration-500 ${
							index === currentSlide
								? "bg-primary w-10"
								: "bg-primary-foreground/30 hover:bg-primary-foreground/50 w-3"
						}`}
						aria-label={`Ir para slide ${index + 1}`}
					/>
				))}
			</motion.div>

			{/* Scroll Indicator with Parallax */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 2 }}
				className="absolute bottom-8 right-8 hidden md:flex flex-col items-center"
				style={{ opacity: contentOpacity }}
			>
				<span className="text-xs uppercase tracking-widest mb-3 text-muted-foreground">
					Role
				</span>
				<motion.div
					animate={{ y: [0, 8, 0] }}
					transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
					className="p-2 border border-primary/30 rounded-full"
				>
					<ChevronDown className="w-5 h-5 text-primary" />
				</motion.div>
			</motion.div>

			{/* Bottom Gradient Fade */}
			<div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
		</section>
	);
};

export default HeroCarousel;
