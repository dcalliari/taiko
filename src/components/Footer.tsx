import {
	Facebook,
	Instagram,
	Mail,
	MapPin,
	Phone,
	Youtube,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import PrivacyModal from "./PrivacyModal";
import TermsModal from "./TermsModal";

const Footer = () => {
	const { t } = useTranslation();
	const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
	const [isTermsOpen, setIsTermsOpen] = useState(false);

	return (
		<>
			<footer id="contato" className="bg-muted pt-16 pb-8">
				<div className="container mx-auto px-4">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
						{/* Logo & Description */}
						<div className="lg:col-span-2">
							<h3 className="font-heading font-black text-2xl text-primary-foreground mb-4">
								KODON <span className="text-primary">AMAZON</span> TAIKO
							</h3>
							<p className="text-muted-foreground mb-6 max-w-md">
								{t("footer.description")}
							</p>
							{/* Social Icons */}
							<div className="flex gap-4">
								<a
									href="https://www.instagram.com/kodonamazontaiko/"
									className="w-10 h-10 bg-background rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
									aria-label="Instagram"
								>
									<Instagram className="w-5 h-5" />
								</a>
								<a
									href="https://www.facebook.com/kodonamazontaiko"
									className="w-10 h-10 bg-background rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
									aria-label="Facebook"
								>
									<Facebook className="w-5 h-5" />
								</a>
								<a
									href="https://www.youtube.com/@kodonamazontaiko"
									className="w-10 h-10 bg-background rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
									aria-label="YouTube"
								>
									<Youtube className="w-5 h-5" />
								</a>
							</div>
						</div>

						{/* Quick Links */}
						<div>
							<h4 className="font-heading font-bold text-primary-foreground uppercase tracking-wider text-sm mb-4">
								{t("footer.quickLinks")}
							</h4>
							<ul className="space-y-3">
								{[
									{ label: t("footer.aboutUs"), href: "#quem-somos" },
									{ label: t("footer.presentations"), href: "#galeria" },
									{ label: t("footer.workshops"), href: "#agenda" },
									{ label: t("footer.shop"), href: "#loja" },
									{ label: t("footer.supportUs"), href: "#apoie" },
								].map((link) => (
									<li key={link.label}>
										<a
											href={link.href}
											className="text-muted-foreground hover:text-primary transition-colors"
										>
											{link.label}
										</a>
									</li>
								))}
							</ul>
						</div>

						{/* Contact */}
						<div>
							<h4 className="font-heading font-bold text-primary-foreground uppercase tracking-wider text-sm mb-4">
								{t("footer.contact")}
							</h4>
							<ul className="space-y-4">
								<li className="flex items-start gap-3">
									<Mail className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
									<a
										href="mailto:contato@kodonamazontaiko.com.br"
										className="text-muted-foreground hover:text-primary transition-colors"
									>
										contato@kodonamazontaiko.com.br
									</a>
								</li>
								<li className="flex items-start gap-3">
									<Phone className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
									<a
										href="tel:+5591999999999"
										className="text-muted-foreground hover:text-primary transition-colors"
									>
										(91) 99999-9999
									</a>
								</li>
								<li className="flex items-start gap-3">
									<MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
									<span className="text-muted-foreground">
										Belém, Pará
										<br />
										Brasil
									</span>
								</li>
							</ul>
						</div>
					</div>

					{/* Bottom Bar */}
					<div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
						<p className="text-sm text-muted-foreground text-center md:text-left">
							{t("footer.copyright")}
						</p>
						<div className="flex gap-6 text-sm">
							<button
								type="button"
								onClick={() => setIsPrivacyOpen(true)}
								className="text-muted-foreground hover:text-primary transition-colors"
							>
								{t("footer.privacy")}
							</button>
							<button
								type="button"
								onClick={() => setIsTermsOpen(true)}
								className="text-muted-foreground hover:text-primary transition-colors"
							>
								{t("footer.terms")}
							</button>
						</div>
					</div>
				</div>
			</footer>

			<PrivacyModal
				isOpen={isPrivacyOpen}
				onClose={() => setIsPrivacyOpen(false)}
			/>
			<TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
		</>
	);
};

export default Footer;
