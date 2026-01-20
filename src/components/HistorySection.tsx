import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useTranslation } from "react-i18next";

const HistorySection = () => {
	const { t } = useTranslation();
	const ref = useRef(null);
	const isInView = useInView(ref, { once: true, margin: "-100px" });

	const timelineItems = [
		{
			year: t("history.timeline.item1.year"),
			title: t("history.timeline.item1.title"),
			description: t("history.timeline.item1.description"),
		},
		{
			year: t("history.timeline.item2.year"),
			title: t("history.timeline.item2.title"),
			description: t("history.timeline.item2.description"),
		},
		{
			year: t("history.timeline.item3.year"),
			title: t("history.timeline.item3.title"),
			description: t("history.timeline.item3.description"),
		},
		{
			year: t("history.timeline.item4.year"),
			title: t("history.timeline.item4.title"),
			description: t("history.timeline.item4.description"),
		},
		{
			year: t("history.timeline.item5.year"),
			title: t("history.timeline.item5.title"),
			description: t("history.timeline.item5.description"),
		},
	];

	return (
		<section id="historia" className="section-padding bg-muted">
			<div className="container mx-auto px-4">
				<motion.div
					ref={ref}
					initial={{ opacity: 0, y: 40 }}
					animate={isInView ? { opacity: 1, y: 0 } : {}}
					transition={{ duration: 0.8 }}
					className="text-center mb-16"
				>
					<span className="inline-block text-primary font-heading font-semibold uppercase tracking-widest text-sm mb-4">
						{t("history.label")}
					</span>
					<h2 className="heading-section text-foreground mb-8">
						{t("history.title")}
					</h2>
					<div className="w-20 h-1 bg-primary mx-auto mb-8" />
					<p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
						{t("history.description")}
					</p>
				</motion.div>

				{/* Timeline */}
				<div className="max-w-4xl mx-auto">
					<div className="relative">
						{/* Timeline Line */}
						<div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-primary/30 transform md:-translate-x-1/2" />

						{timelineItems.map((item, index) => (
							<motion.div
								key={item.year}
								initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
								animate={isInView ? { opacity: 1, x: 0 } : {}}
								transition={{ duration: 0.6, delay: index * 0.2 }}
								className={`relative flex items-center mb-12 ${
									index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
								}`}
							>
								{/* Timeline Dot */}
								<div className="absolute left-4 md:left-1/2 w-4 h-4 bg-primary rounded-full transform -translate-x-1/2 z-10 shadow-lg" />

								{/* Content Card */}
								<div
									className={`ml-12 md:ml-0 md:w-1/2 ${
										index % 2 === 0
											? "md:pr-12 md:text-right"
											: "md:pl-12 md:text-left"
									}`}
								>
									<div className="bg-background p-6 rounded-lg shadow-lg border border-border">
										<span className="inline-block text-primary font-heading font-bold text-2xl mb-2">
											{item.year}
										</span>
										<h3 className="font-heading font-bold text-foreground text-lg mb-2">
											{item.title}
										</h3>
										<p className="text-muted-foreground">{item.description}</p>
									</div>
								</div>
							</motion.div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
};

export default HistorySection;
