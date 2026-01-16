import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const AboutSection = () => {
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
						Nossa Essência
					</span>
					<h2 className="heading-section text-foreground mb-8">QUEM SOMOS</h2>

					<div className="w-20 h-1 bg-primary mx-auto mb-8" />

					<p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-6">
						Somos o{" "}
						<strong className="text-foreground">Kodon Amazon Taiko</strong>, um
						coletivo vibrante de músicos que une a tradição milenar do
						kumi-daiko japonês com a exuberância e energia da Amazônia
						brasileira.
					</p>

					<p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8">
						Nossa missão é espalhar alegria, força e emoção através de cada
						batida do tambor. Acreditamos que a música é uma linguagem universal
						que conecta corações, transcende fronteiras e transforma vidas.
					</p>

					<motion.a
						href="#historia"
						initial={{ opacity: 0 }}
						animate={isInView ? { opacity: 1 } : {}}
						transition={{ delay: 0.5, duration: 0.5 }}
						className="inline-flex items-center gap-2 text-primary font-heading font-semibold uppercase tracking-wider text-sm hover:gap-4 transition-all"
					>
						Conheça nossa história
						<span className="text-xl">→</span>
					</motion.a>
				</motion.div>
			</div>
		</section>
	);
};

export default AboutSection;
