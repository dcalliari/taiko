import { motion, useInView } from "framer-motion";
import { ArrowRight, Calendar, Mail } from "lucide-react";
import { useRef, useState } from "react";

const news = [
	{
		id: 1,
		title: "Oficina de Taiko - Verão 2025",
		date: "15 de Janeiro, 2025",
		excerpt:
			"Inscrições abertas para nossa oficina de verão. Venha aprender os fundamentos do taiko!",
	},
	{
		id: 2,
		title: "Novas Fotos do Concerto no Theatro da Paz",
		date: "10 de Janeiro, 2025",
		excerpt:
			"Confira as imagens da nossa apresentação histórica no Theatro da Paz.",
	},
	{
		id: 3,
		title: "Kodon no Festival do Folclore 2024",
		date: "28 de Dezembro, 2024",
		excerpt:
			"Encerramos o ano com uma apresentação inesquecível no Festival do Folclore.",
	},
];

const events = [
	{
		id: 1,
		title: "Workshop de Iniciação ao Taiko",
		date: "25 Jan 2025",
		location: "Centro Cultural Japonês",
	},
	{
		id: 2,
		title: "Apresentação no Parque dos Bilhares",
		date: "02 Fev 2025",
		location: "Belém, PA",
	},
];

const NewsSection = () => {
	const ref = useRef(null);
	const isInView = useInView(ref, { once: true, margin: "-100px" });
	const [email, setEmail] = useState("");

	const handleSubscribe = (e: React.FormEvent) => {
		e.preventDefault();
		// Handle newsletter subscription
		alert("Obrigado por se inscrever!");
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
						FALE CONOSCO
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
							Fique por Dentro
						</span>
						<h2 className="heading-section text-primary-foreground mb-8">
							ÚLTIMAS NOTÍCIAS
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
							Todas as postagens
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
							Agenda
						</span>
						<h2 className="heading-section text-primary-foreground mb-8">
							PRÓXIMOS EVENTOS
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
									Não há eventos programados no momento.
								</p>
							)}
						</div>

						<a
							href="#calendario"
							className="inline-flex items-center gap-2 text-secondary font-heading font-semibold uppercase tracking-wider text-sm hover:gap-4 transition-all"
						>
							Calendário completo
							<ArrowRight className="w-4 h-4" />
						</a>

						{/* Newsletter */}
						<div className="mt-12 p-6 bg-background rounded-lg border border-border">
							<h3 className="font-heading font-bold text-primary-foreground text-lg mb-2">
								Newsletter
							</h3>
							<p className="text-sm text-muted-foreground mb-4">
								Receba novidades e informações sobre nossos eventos.
							</p>
							<form onSubmit={handleSubscribe} className="flex gap-2">
								<input
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder="Seu e-mail"
									required
									className="flex-1 px-4 py-2 bg-muted border border-border rounded text-primary-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
								/>
								<button
									type="submit"
									className="px-6 py-2 bg-primary text-primary-foreground font-heading font-semibold uppercase text-sm hover:bg-primary/90 transition-colors rounded"
								>
									Inscrever-se
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
