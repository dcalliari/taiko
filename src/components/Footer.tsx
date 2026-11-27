"use client";

import {
	Facebook,
	Instagram,
	Mail,
	MapPin,
	Phone,
	Youtube,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import HashLink from "./HashLink";
import PrivacyModal from "./PrivacyModal";
import TermsModal from "./TermsModal";

const Footer = () => {
	const t = useTranslations("footer");
	const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
	const [isTermsOpen, setIsTermsOpen] = useState(false);

	const quickLinkClassName =
		"text-muted-foreground hover:text-primary transition-colors";

	return (
		<>
			<footer id="contato" className="bg-muted pt-16 pb-8">
				<div className="container mx-auto px-4">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
						{/* Logo & Description */}
						<div className="lg:col-span-2">
							<h2 className="font-heading font-black text-2xl text-primary-foreground mb-4">
								{t("title1")}{" "}
								<span className="text-primary">{t("title2")}</span>{" "}
								{t("title3")}
							</h2>
							<p className="text-muted-foreground mb-6 max-w-md">
								{t("description")}
							</p>
							{/* Social Icons */}
							<div className="flex gap-4">
								<a
									href="https://www.instagram.com/kodonamazontaiko/"
									className="w-10 h-10 bg-background rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
									aria-label="Instagram"
								>
									<Instagram className="w-5 h-5" aria-hidden="true" />
								</a>
								<a
									href="https://www.facebook.com/kodonamazontaiko"
									className="w-10 h-10 bg-background rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
									aria-label="Facebook"
								>
									<Facebook className="w-5 h-5" aria-hidden="true" />
								</a>
								<a
									href="https://www.youtube.com/@kodonamazontaiko"
									className="w-10 h-10 bg-background rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
									aria-label="YouTube"
								>
									<Youtube className="w-5 h-5" aria-hidden="true" />
								</a>
							</div>
						</div>

						{/* Quick Links */}
						<div>
							<h3 className="font-heading font-bold text-primary-foreground uppercase tracking-wider text-sm mb-4">
								{t("quickLinks")}
							</h3>
							<ul className="space-y-3">
								<li>
									<HashLink hash="#quem-somos" className={quickLinkClassName}>
										{t("aboutUs")}
									</HashLink>
								</li>
								<li>
									<HashLink hash="#galeria" className={quickLinkClassName}>
										{t("presentations")}
									</HashLink>
								</li>
								<li>
									<HashLink hash="#agenda" className={quickLinkClassName}>
										{t("workshops")}
									</HashLink>
								</li>
								<li>
									<Link href="/loja" className={quickLinkClassName}>
										{t("shop")}
									</Link>
								</li>
								<li>
									<HashLink hash="#apoie" className={quickLinkClassName}>
										{t("supportUs")}
									</HashLink>
								</li>
							</ul>
						</div>

						{/* Contact */}
						<div>
							<h3 className="font-heading font-bold text-primary-foreground uppercase tracking-wider text-sm mb-4">
								{t("contact")}
							</h3>
							<ul className="space-y-4">
								<li className="flex items-start gap-3">
									<Mail
										className="w-5 h-5 text-primary flex-shrink-0 mt-0.5"
										aria-hidden="true"
									/>
									<a
										href="mailto:contato@kodonamazontaiko.com.br"
										className="text-muted-foreground hover:text-primary transition-colors"
									>
										contato@kodonamazontaiko.com.br
									</a>
								</li>
								<li className="flex items-start gap-3">
									<Phone
										className="w-5 h-5 text-primary flex-shrink-0 mt-0.5"
										aria-hidden="true"
									/>
									<a
										href="tel:+5591999999999"
										className="text-muted-foreground hover:text-primary transition-colors"
									>
										(91) 99999-9999
									</a>
								</li>
								<li className="flex items-start gap-3">
									<MapPin
										className="w-5 h-5 text-primary flex-shrink-0 mt-0.5"
										aria-hidden="true"
									/>
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
							{t("copyright")}
						</p>
						<div className="flex gap-6 text-sm">
							<button
								type="button"
								onClick={() => setIsPrivacyOpen(true)}
								className="text-muted-foreground hover:text-primary transition-colors"
							>
								{t("privacy")}
							</button>
							<button
								type="button"
								onClick={() => setIsTermsOpen(true)}
								className="text-muted-foreground hover:text-primary transition-colors"
							>
								{t("terms")}
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
