import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

interface PrivacyModalProps {
	isOpen: boolean;
	onClose: () => void;
}

const PrivacyModal = ({ isOpen, onClose }: PrivacyModalProps) => {
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
									{t("privacy.title")}
								</h1>
								<p className="text-muted-foreground text-sm mt-1">
									{t("privacy.lastUpdated")}: {t("privacy.updateDate")}
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
										{t("privacy.sections.intro.title")}
									</h2>
									<p className="text-muted-foreground leading-relaxed">
										{t("privacy.sections.intro.content")}
									</p>
								</section>

								{/* Data Collection */}
								<section className="mb-10">
									<h2 className="font-heading font-bold text-xl text-foreground mb-4">
										{t("privacy.sections.dataCollection.title")}
									</h2>
									<p className="text-muted-foreground leading-relaxed mb-4">
										{t("privacy.sections.dataCollection.content")}
									</p>
									<ul className="list-disc list-inside text-muted-foreground space-y-2">
										<li>{t("privacy.sections.dataCollection.items.item1")}</li>
										<li>{t("privacy.sections.dataCollection.items.item2")}</li>
										<li>{t("privacy.sections.dataCollection.items.item3")}</li>
										<li>{t("privacy.sections.dataCollection.items.item4")}</li>
									</ul>
								</section>

								{/* Data Use */}
								<section className="mb-10">
									<h2 className="font-heading font-bold text-xl text-foreground mb-4">
										{t("privacy.sections.dataUse.title")}
									</h2>
									<p className="text-muted-foreground leading-relaxed mb-4">
										{t("privacy.sections.dataUse.content")}
									</p>
									<ul className="list-disc list-inside text-muted-foreground space-y-2">
										<li>{t("privacy.sections.dataUse.items.item1")}</li>
										<li>{t("privacy.sections.dataUse.items.item2")}</li>
										<li>{t("privacy.sections.dataUse.items.item3")}</li>
										<li>{t("privacy.sections.dataUse.items.item4")}</li>
									</ul>
								</section>

								{/* Data Protection */}
								<section className="mb-10">
									<h2 className="font-heading font-bold text-xl text-foreground mb-4">
										{t("privacy.sections.dataProtection.title")}
									</h2>
									<p className="text-muted-foreground leading-relaxed">
										{t("privacy.sections.dataProtection.content")}
									</p>
								</section>

								{/* Cookies */}
								<section className="mb-10">
									<h2 className="font-heading font-bold text-xl text-foreground mb-4">
										{t("privacy.sections.cookies.title")}
									</h2>
									<p className="text-muted-foreground leading-relaxed">
										{t("privacy.sections.cookies.content")}
									</p>
								</section>

								{/* Third Parties */}
								<section className="mb-10">
									<h2 className="font-heading font-bold text-xl text-foreground mb-4">
										{t("privacy.sections.thirdParties.title")}
									</h2>
									<p className="text-muted-foreground leading-relaxed">
										{t("privacy.sections.thirdParties.content")}
									</p>
								</section>

								{/* User Rights */}
								<section className="mb-10">
									<h2 className="font-heading font-bold text-xl text-foreground mb-4">
										{t("privacy.sections.userRights.title")}
									</h2>
									<p className="text-muted-foreground leading-relaxed mb-4">
										{t("privacy.sections.userRights.content")}
									</p>
									<ul className="list-disc list-inside text-muted-foreground space-y-2">
										<li>{t("privacy.sections.userRights.items.item1")}</li>
										<li>{t("privacy.sections.userRights.items.item2")}</li>
										<li>{t("privacy.sections.userRights.items.item3")}</li>
										<li>{t("privacy.sections.userRights.items.item4")}</li>
									</ul>
								</section>

								{/* Contact */}
								<section className="mb-10">
									<h2 className="font-heading font-bold text-xl text-foreground mb-4">
										{t("privacy.sections.contact.title")}
									</h2>
									<p className="text-muted-foreground leading-relaxed">
										{t("privacy.sections.contact.content")}
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

export default PrivacyModal;
