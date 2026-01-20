import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

interface TermsModalProps {
	isOpen: boolean;
	onClose: () => void;
}

const TermsModal = ({ isOpen, onClose }: TermsModalProps) => {
	const { t } = useTranslation();

	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "unset";
		}
		return () => {
			document.body.style.overflow = "unset";
		};
	}, [isOpen]);

	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="fixed inset-0 z-50 flex items-center justify-center"
				>
					{/* Backdrop */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="absolute inset-0 bg-black/80 backdrop-blur-sm"
						onClick={onClose}
					/>

					{/* Modal Content */}
					<motion.div
						initial={{ opacity: 0, scale: 0.95, y: 20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: 20 }}
						transition={{ duration: 0.3 }}
						className="relative w-full h-full md:w-[90%] md:h-[90%] md:max-w-4xl bg-background md:rounded-lg overflow-hidden flex flex-col"
					>
						{/* Header */}
						<div className="bg-muted py-6 px-6 md:px-8 flex items-center justify-between border-b border-border">
							<div>
								<h1 className="font-heading font-black text-2xl md:text-3xl text-foreground">
									{t("terms.title")}
								</h1>
								<p className="text-muted-foreground text-sm mt-1">
									{t("terms.lastUpdated")}: {t("terms.updateDate")}
								</p>
							</div>
							<button
								type="button"
								onClick={onClose}
								className="p-2 hover:bg-background rounded-full transition-colors"
								aria-label="Close"
							>
								<X className="w-6 h-6 text-muted-foreground" />
							</button>
						</div>

						{/* Content */}
						<div className="flex-1 overflow-y-auto p-6 md:p-8">
							<div className="max-w-3xl mx-auto">
								{/* Introduction */}
								<section className="mb-10">
									<h2 className="font-heading font-bold text-xl text-foreground mb-4">
										{t("terms.sections.intro.title")}
									</h2>
									<p className="text-muted-foreground leading-relaxed">
										{t("terms.sections.intro.content")}
									</p>
								</section>

								{/* Use of Site */}
								<section className="mb-10">
									<h2 className="font-heading font-bold text-xl text-foreground mb-4">
										{t("terms.sections.useOfSite.title")}
									</h2>
									<p className="text-muted-foreground leading-relaxed mb-4">
										{t("terms.sections.useOfSite.content")}
									</p>
									<ul className="list-disc list-inside text-muted-foreground space-y-2">
										<li>{t("terms.sections.useOfSite.items.item1")}</li>
										<li>{t("terms.sections.useOfSite.items.item2")}</li>
										<li>{t("terms.sections.useOfSite.items.item3")}</li>
									</ul>
								</section>

								{/* Intellectual Property */}
								<section className="mb-10">
									<h2 className="font-heading font-bold text-xl text-foreground mb-4">
										{t("terms.sections.intellectualProperty.title")}
									</h2>
									<p className="text-muted-foreground leading-relaxed">
										{t("terms.sections.intellectualProperty.content")}
									</p>
								</section>

								{/* User Content */}
								<section className="mb-10">
									<h2 className="font-heading font-bold text-xl text-foreground mb-4">
										{t("terms.sections.userContent.title")}
									</h2>
									<p className="text-muted-foreground leading-relaxed">
										{t("terms.sections.userContent.content")}
									</p>
								</section>

								{/* Events and Services */}
								<section className="mb-10">
									<h2 className="font-heading font-bold text-xl text-foreground mb-4">
										{t("terms.sections.eventsServices.title")}
									</h2>
									<p className="text-muted-foreground leading-relaxed mb-4">
										{t("terms.sections.eventsServices.content")}
									</p>
									<ul className="list-disc list-inside text-muted-foreground space-y-2">
										<li>{t("terms.sections.eventsServices.items.item1")}</li>
										<li>{t("terms.sections.eventsServices.items.item2")}</li>
										<li>{t("terms.sections.eventsServices.items.item3")}</li>
									</ul>
								</section>

								{/* Limitation of Liability */}
								<section className="mb-10">
									<h2 className="font-heading font-bold text-xl text-foreground mb-4">
										{t("terms.sections.liability.title")}
									</h2>
									<p className="text-muted-foreground leading-relaxed">
										{t("terms.sections.liability.content")}
									</p>
								</section>

								{/* Changes to Terms */}
								<section className="mb-10">
									<h2 className="font-heading font-bold text-xl text-foreground mb-4">
										{t("terms.sections.changes.title")}
									</h2>
									<p className="text-muted-foreground leading-relaxed">
										{t("terms.sections.changes.content")}
									</p>
								</section>

								{/* Governing Law */}
								<section className="mb-10">
									<h2 className="font-heading font-bold text-xl text-foreground mb-4">
										{t("terms.sections.governingLaw.title")}
									</h2>
									<p className="text-muted-foreground leading-relaxed">
										{t("terms.sections.governingLaw.content")}
									</p>
								</section>

								{/* Contact */}
								<section className="mb-10">
									<h2 className="font-heading font-bold text-xl text-foreground mb-4">
										{t("terms.sections.contact.title")}
									</h2>
									<p className="text-muted-foreground leading-relaxed">
										{t("terms.sections.contact.content")}
									</p>
									<p className="text-muted-foreground mt-2">
										<strong>Email:</strong> contato@kodonamazontaiko.com.br
									</p>
								</section>
							</div>
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
};

export default TermsModal;
