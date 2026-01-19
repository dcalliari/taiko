import { motion, useInView } from "framer-motion";
import { ArrowRight, Calendar, Mail } from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

const NewsSection = () => {
	const { t } = useTranslation();
	const ref = useRef(null);
	const isInView = useInView(ref, { once: true, margin: "-100px" });
	const [email, setEmail] = useState("");

	const news = [
		{
			id: 1,
			title: t("news.news1.title"),
			date: t("news.news1.date"),
			excerpt: t("news.news1.excerpt"),
		},
		{
			id: 2,
			title: t("news.news2.title"),
			date: t("news.news2.date"),
			excerpt: t("news.news2.excerpt"),
		},
		{
			id: 3,
			title: t("news.news3.title"),
			date: t("news.news3.date"),
			excerpt: t("news.news3.excerpt"),
		},
	];

	const events = [
		{
			id: 1,
			title: t("news.event1.title"),
			date: t("news.event1.date"),
			location: t("news.event1.location"),
		},
		{
			id: 2,
			title: t("news.event2.title"),
			date: t("news.event2.date"),
			location: t("news.event2.location"),
		},
	];

	const handleSubscribe = (e: React.FormEvent) => {
		e.preventDefault();
		alert(t("news.subscribeSuccess"));
		setEmail("");
	};

	return (
		<section id="agenda" className="section-padding bg-muted">
			{/* Contact Bar */}
			<div className="bg-primary py-4 mb-16">
				<div className="container mx-auto px-4">
					<a
						href="#contato"
						className="flex items-center justify-center gap-3 text-primary-foreground font-heading font-bold uppercase tracking-wider hover:gap-5 transition-all"
					>
						<Mail className="w-5 h-5" />
						{t("news.contactUs")}
						<ArrowRight className="w-5 h-5" />
					</a>
				</div>
			</div>

			<div className="container mx-auto px-4">
				<div ref={ref} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
					{/* News Feed */}
					<motion.div
						initial={{ opacity: 0, x: -30 }}
						animate={isInView ? { opacity: 1, x: 0 } : {}}
						transition={{ duration: 0.6 }}
					>
						<span className="inline-block text-primary font-heading font-semibold uppercase tracking-widest text-sm mb-4">
							{t("news.label")}
						</span>
						<h2 className="heading-section text-primary-foreground mb-8">
							{t("news.title")}
						</h2>

						<div className="space-y-6">
							{news.map((item, index) => (
								<motion.article
									key={item.id}
									initial={{ opacity: 0, y: 20 }}
									animate={isInView ? { opacity: 1, y: 0 } : {}}
									transition={{ duration: 0.5, delay: index * 0.1 }}
									className="group cursor-pointer"
								>
									<span className="text-sm text-muted-foreground">
										{item.date}
									</span>
									<h3 className="font-heading font-bold text-primary-foreground text-lg mt-1 group-hover:text-primary transition-colors">
										{item.title}
									</h3>
									<p className="text-muted-foreground mt-2">{item.excerpt}</p>
								</motion.article>
							))}
						</div>

						<a
							href="#noticias"
							className="inline-flex items-center gap-2 text-primary font-heading font-semibold uppercase tracking-wider text-sm mt-8 hover:gap-4 transition-all"
						>
							{t("news.allPosts")}
							<ArrowRight className="w-4 h-4" />
						</a>
					</motion.div>

					{/* Events & Newsletter */}
					<motion.div
						initial={{ opacity: 0, x: 30 }}
						animate={isInView ? { opacity: 1, x: 0 } : {}}
						transition={{ duration: 0.6, delay: 0.2 }}
					>
						<span className="inline-block text-secondary font-heading font-semibold uppercase tracking-widest text-sm mb-4">
							{t("news.eventsLabel")}
						</span>
						<h2 className="heading-section text-primary-foreground mb-8">
							{t("news.eventsTitle")}
						</h2>

						<div className="space-y-4 mb-8">
							{events.length > 0 ? (
								events.map((event, index) => (
									<motion.div
										key={event.id}
										initial={{ opacity: 0, y: 20 }}
										animate={isInView ? { opacity: 1, y: 0 } : {}}
										transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
										className="bg-background p-4 rounded-lg border border-border group hover:border-secondary transition-colors"
									>
										<div className="flex items-start gap-4">
											<div className="flex-shrink-0 w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center text-secondary">
												<Calendar className="w-5 h-5" />
											</div>
											<div>
												<h4 className="font-heading font-bold text-primary-foreground group-hover:text-secondary transition-colors">
													{event.title}
												</h4>
												<p className="text-sm text-muted-foreground mt-1">
													{event.date} • {event.location}
												</p>
											</div>
										</div>
									</motion.div>
								))
							) : (
								<p className="text-muted-foreground italic">
									{t("news.noEvents")}
								</p>
							)}
						</div>

						<a
							href="#calendario"
							className="inline-flex items-center gap-2 text-secondary font-heading font-semibold uppercase tracking-wider text-sm hover:gap-4 transition-all"
						>
							{t("news.calendarComplete")}
							<ArrowRight className="w-4 h-4" />
						</a>

						{/* Newsletter */}
						<div className="mt-12 p-6 bg-background rounded-lg border border-border">
							<h3 className="font-heading font-bold text-primary-foreground text-lg mb-2">
								{t("news.newsletterTitle")}
							</h3>
							<p className="text-sm text-muted-foreground mb-4">
								{t("news.newsletterDescription")}
							</p>
							<form onSubmit={handleSubscribe} className="flex gap-2">
								<input
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder={t("news.emailPlaceholder")}
									required
									className="flex-1 px-4 py-2 bg-muted border border-border rounded text-primary-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
								/>
								<button
									type="submit"
									className="px-6 py-2 bg-primary text-primary-foreground font-heading font-semibold uppercase text-sm hover:bg-primary/90 transition-colors rounded"
								>
									{t("news.subscribe")}
								</button>
							</form>
						</div>
					</motion.div>
				</div>
			</div>
		</section>
	);
};

export default NewsSection;
