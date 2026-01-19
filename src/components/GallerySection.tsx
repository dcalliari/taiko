import { motion, useInView } from "framer-motion";
import { Play } from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import heroDrums from "@/assets/hero-drums.jpg";
import heroPerformance from "@/assets/hero-performance.jpg";
import heroTaiko from "@/assets/hero-taiko.jpg";

const GallerySection = () => {
	const { t } = useTranslation();
	const ref = useRef(null);
	const isInView = useInView(ref, { once: true, margin: "-100px" });
	const [activeFilter, setActiveFilter] = useState("all");

	const filters = [
		{ id: "all", label: t("gallery.filters.all") },
		{ id: "concerts", label: t("gallery.filters.concerts") },
		{ id: "festivals", label: t("gallery.filters.festivals") },
		{ id: "collaborations", label: t("gallery.filters.collaborations") },
		{ id: "workshops", label: t("gallery.filters.workshops") },
		{ id: "videos", label: t("gallery.filters.videos") },
	];

	const galleryItems = [
		{
			id: 1,
			image: heroTaiko,
			title: t("gallery.items.item1"),
			category: "concerts",
			isVideo: false,
		},
		{
			id: 2,
			image: heroDrums,
			title: t("gallery.items.item2"),
			category: "festivals",
			isVideo: false,
		},
		{
			id: 3,
			image: heroPerformance,
			title: t("gallery.items.item3"),
			category: "workshops",
			isVideo: false,
		},
		{
			id: 4,
			image: heroTaiko,
			title: t("gallery.items.item4"),
			category: "festivals",
			isVideo: true,
		},
		{
			id: 5,
			image: heroDrums,
			title: t("gallery.items.item5"),
			category: "collaborations",
			isVideo: false,
		},
		{
			id: 6,
			image: heroPerformance,
			title: t("gallery.items.item6"),
			category: "concerts",
			isVideo: false,
		},
	];

	const filteredItems =
		activeFilter === "all"
			? galleryItems
			: galleryItems.filter((item) => item.category === activeFilter);

	return (
		<section id="galeria" className="section-padding bg-background">
			<div className="container mx-auto px-4">
				<motion.div
					ref={ref}
					initial={{ opacity: 0, y: 40 }}
					animate={isInView ? { opacity: 1, y: 0 } : {}}
					transition={{ duration: 0.8 }}
					className="text-center mb-12"
				>
					<span className="inline-block text-primary font-heading font-semibold uppercase tracking-widest text-sm mb-4">
						{t("gallery.label")}
					</span>
					<h2 className="heading-section text-foreground mb-8">
						{t("gallery.title")}
					</h2>
					<div className="w-20 h-1 bg-primary mx-auto" />
				</motion.div>

				{/* Filters */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={isInView ? { opacity: 1, y: 0 } : {}}
					transition={{ duration: 0.6, delay: 0.2 }}
					className="flex flex-wrap justify-center gap-2 mb-12"
				>
					{filters.map((filter) => (
						<button
							type="button"
							key={filter.id}
							onClick={() => setActiveFilter(filter.id)}
							className={`px-4 py-2 font-heading text-sm uppercase tracking-wider transition-all duration-300 rounded ${
								activeFilter === filter.id
									? "bg-primary text-primary-foreground"
									: "bg-muted text-muted-foreground hover:text-primary"
							}`}
						>
							{filter.label}
						</button>
					))}
				</motion.div>

				{/* Gallery Grid */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={isInView ? { opacity: 1 } : {}}
					transition={{ duration: 0.6, delay: 0.4 }}
					className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
				>
					{filteredItems.map((item, index) => (
						<motion.div
							key={item.id}
							layout
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.9 }}
							transition={{ duration: 0.4, delay: index * 0.1 }}
							className="group relative aspect-[4/3] overflow-hidden rounded-lg cursor-pointer"
						>
							<img
								src={item.image}
								alt={item.title}
								className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-muted via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

							{item.isVideo && (
								<div className="absolute inset-0 flex items-center justify-center">
									<div className="w-16 h-16 bg-primary/80 rounded-full flex items-center justify-center text-primary-foreground opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
										<Play className="w-6 h-6 ml-1" />
									</div>
								</div>
							)}

							<div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
								<h3 className="font-heading font-bold text-primary-foreground text-lg">
									{item.title}
								</h3>
							</div>
						</motion.div>
					))}
				</motion.div>

				{/* CTA */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={isInView ? { opacity: 1, y: 0 } : {}}
					transition={{ duration: 0.6, delay: 0.6 }}
					className="text-center mt-12"
				>
					<a
						href="#portfolio"
						className="inline-block px-8 py-4 bg-primary text-primary-foreground font-heading font-bold uppercase tracking-wider text-sm hover:bg-primary/90 transition-all duration-300 hover:shadow-lg hover:shadow-primary/30"
					>
						{t("gallery.viewPortfolio")}
					</a>
				</motion.div>
			</div>
		</section>
	);
};

export default GallerySection;
