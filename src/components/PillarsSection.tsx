import { motion, useInView } from "framer-motion";
import { GraduationCap, Lightbulb, Music } from "lucide-react";
import { useRef } from "react";

const pillars = [
	{
		icon: Lightbulb,
		title: "NÓS CRIAMOS",
		description:
			"Composições originais que fundem ritmos tradicionais japoneses com a pulsação amazônica. Criamos experiências temáticas únicas para cada apresentação.",
		link: { label: "- veja nossos projetos -", href: "#projetos" },
		color: "primary",
	},
	{
		icon: GraduationCap,
		title: "NÓS ENSINAMOS",
		description:
			"Workshops e oficinas que transmitem não apenas a técnica do taiko, mas também sua filosofia: disciplina, respeito e conexão com o ritmo interior.",
		link: { label: "- veja nossa agenda -", href: "#agenda" },
		color: "secondary",
	},
	{
		icon: Music,
		title: "NÓS TOCAMOS",
		description:
			"Apresentações em festivais culturais, eventos corporativos, casamentos e celebrações. Cada performance é uma experiência transformadora.",
		link: { label: "- veja nosso portfólio -", href: "#galeria" },
		color: "primary",
	},
];

const PillarsSection = () => {
	const ref = useRef(null);
	const isInView = useInView(ref, { once: true, margin: "-100px" });

	return (
		<section className="section-padding bg-muted">
			<div className="container mx-auto px-4">
				<div
					ref={ref}
					className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12"
				>
					{pillars.map((pillar, index) => (
						<motion.div
							key={pillar.title}
							initial={{ opacity: 0, y: 40 }}
							animate={isInView ? { opacity: 1, y: 0 } : {}}
							transition={{ duration: 0.6, delay: index * 0.2 }}
							className="text-center group"
						>
							<div
								className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 transition-all duration-300 group-hover:scale-110 ${
									pillar.color === "primary"
										? "bg-primary/20 text-primary"
										: "bg-secondary/20 text-secondary"
								}`}
							>
								<pillar.icon className="w-10 h-10" />
							</div>

							<h3 className="heading-section text-primary-foreground mb-4 text-xl md:text-2xl">
								{pillar.title}
							</h3>

							<p className="text-muted-foreground leading-relaxed mb-6">
								{pillar.description}
							</p>

							<a
								href={pillar.link.href}
								className={`inline-block font-heading text-sm tracking-wide transition-colors ${
									pillar.color === "primary"
										? "text-primary hover:text-primary/80"
										: "text-secondary hover:text-secondary/80"
								}`}
							>
								{pillar.link.label}
							</a>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
};

export default PillarsSection;
