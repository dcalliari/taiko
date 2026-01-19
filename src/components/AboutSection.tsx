import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Trans, useTranslation } from "react-i18next";

const AboutSection = () => {
	const { t } = useTranslation();
	const ref = useRef(null);
	const isInView = useInView(ref, { once: true, margin: "-100px" });

	return (
		<section id="quem-somos" className="section-padding bg-background">
			<div className="container mx-auto px-4">
				<motion.div
					ref={ref}
					initial={{ opacity: 0, y: 40 }}
					animate={isInView ? { opacity: 1, y: 0 } : {}}
					transition={{ duration: 0.8 }}
					className="max-w-4xl mx-auto text-center"
				>
					<span className="inline-block text-primary font-heading font-semibold uppercase tracking-widest text-sm mb-4">
						{t("about.label")}
					</span>
					<h2 className="heading-section text-foreground mb-8">
						{t("about.title")}
					</h2>

					<div className="w-20 h-1 bg-primary mx-auto mb-8" />

					<p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-6">
						<Trans
							i18nKey="about.description1"
							components={{ strong: <strong className="text-foreground" /> }}
						/>
					</p>

					<p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8">
						{t("about.description2")}
					</p>

					<motion.a
						href="#historia"
						initial={{ opacity: 0 }}
						animate={isInView ? { opacity: 1 } : {}}
						transition={{ delay: 0.5, duration: 0.5 }}
						className="inline-flex items-center gap-2 text-primary font-heading font-semibold uppercase tracking-wider text-sm hover:gap-4 transition-all"
					>
						{t("about.historyLink")}
						<span className="text-xl">→</span>
					</motion.a>
				</motion.div>
			</div>
		</section>
	);
};

export default AboutSection;
