import { motion, useInView } from "framer-motion";
import { Award, Heart, Music, Users } from "lucide-react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";

const SupportSection = () => {
	const { t } = useTranslation();
	const ref = useRef(null);
	const isInView = useInView(ref, { once: true, margin: "-100px" });

	return (
		<section
			id="apoie"
			className="section-padding bg-muted relative overflow-hidden"
		>
			{/* Background accent */}
			<div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent" />

			<div className="container mx-auto px-4 relative">
				<div
					ref={ref}
					className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
				>
					{/* Content */}
					<motion.div
						initial={{ opacity: 0, x: -30 }}
						animate={isInView ? { opacity: 1, x: 0 } : {}}
						transition={{ duration: 0.8 }}
					>
						<span className="inline-block text-primary font-heading font-semibold uppercase tracking-widest text-sm mb-4">
							{t("support.label")}
						</span>
						<h2 className="heading-section text-primary-foreground mb-6">
							{t("support.title")}
						</h2>

						<div className="w-20 h-1 bg-primary mb-8" />

						<p className="text-lg text-muted-foreground leading-relaxed mb-6">
							{t("support.description1")}
						</p>

						<p className="text-lg text-muted-foreground leading-relaxed mb-8">
							{t("support.description2")}
						</p>

						{/* Impact Numbers */}
						<div className="grid grid-cols-2 gap-6 mb-8">
							{[
								{
									icon: Music,
									value: "50+",
									label: t("support.stats.presentations"),
								},
								{
									icon: Users,
									value: "2000+",
									label: t("support.stats.people"),
								},
								{ icon: Award, value: "10", label: t("support.stats.years") },
								{
									icon: Heart,
									value: "100%",
									label: t("support.stats.passion"),
								},
							].map((stat, index) => (
								<motion.div
									key={stat.label}
									initial={{ opacity: 0, y: 20 }}
									animate={isInView ? { opacity: 1, y: 0 } : {}}
									transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
									className="flex items-center gap-3"
								>
									<div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center text-primary">
										<stat.icon className="w-5 h-5" />
									</div>
									<div>
										<span className="block font-heading font-bold text-2xl text-primary-foreground">
											{stat.value}
										</span>
										<span className="text-sm text-muted-foreground">
											{stat.label}
										</span>
									</div>
								</motion.div>
							))}
						</div>

						<motion.a
							href="#doar"
							initial={{ opacity: 0 }}
							animate={isInView ? { opacity: 1 } : {}}
							transition={{ delay: 0.7, duration: 0.5 }}
							className="inline-block px-10 py-4 bg-primary text-primary-foreground font-heading font-bold uppercase tracking-wider text-sm hover:bg-primary/90 transition-all duration-300 hover:shadow-lg hover:shadow-primary/30"
						>
							<Heart className="w-5 h-5 inline-block mr-2 -mt-1" />
							{t("support.donateNow")}
						</motion.a>
					</motion.div>

					{/* Partners */}
					<motion.div
						initial={{ opacity: 0, x: 30 }}
						animate={isInView ? { opacity: 1, x: 0 } : {}}
						transition={{ duration: 0.8, delay: 0.3 }}
						className="bg-background rounded-lg p-8 shadow-xl"
					>
						<h3 className="font-heading font-bold text-foreground text-xl mb-6 text-center">
							{t("support.partnersTitle")}
						</h3>

						<div className="grid grid-cols-2 gap-8">
							{/* Placeholder for partner logos */}
							{[1, 2, 3, 4].map((num) => (
								<div
									key={`partner-${num}`}
									className="aspect-[3/2] bg-muted rounded-lg flex items-center justify-center text-muted-foreground font-heading text-sm"
								>
									{t("support.partnerPlaceholder")} {num}
								</div>
							))}
						</div>

						<div className="mt-8 pt-6 border-t border-border text-center">
							<p className="text-sm text-muted-foreground mb-4">
								{t("support.incentiveLaw")}
							</p>
							<a
								href="#parceiros"
								className="inline-flex items-center gap-2 text-primary font-heading font-semibold uppercase tracking-wider text-sm hover:gap-4 transition-all"
							>
								{t("support.becomePartner")}
								<span>→</span>
							</a>
						</div>
					</motion.div>
				</div>
			</div>
		</section>
	);
};

export default SupportSection;
