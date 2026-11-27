"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { languageTag, routing } from "@/i18n/routing";
import HashLink from "./HashLink";

const languageLabels = { pt: "PT", ja: "JP" } as const;

type SectionHash = `#${string}`;

type NavItem =
	| { label: string; route: string }
	| {
			label: string;
			hash: SectionHash;
			dropdown?: { label: string; hash: SectionHash }[];
	  };

const Header = () => {
	const t = useTranslations("header");
	const tA11y = useTranslations("a11y");
	const locale = useLocale();
	const pathname = usePathname();
	const [isScrolled, setIsScrolled] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

	const isHomePage = pathname === "/";

	const navItems: NavItem[] = [
		{
			label: t("about"),
			hash: "#quem-somos",
			dropdown: [
				{ label: t("whoWeAre"), hash: "#quem-somos" },
				{ label: t("history"), hash: "#historia" },
				{ label: t("ourMusic"), hash: "#musica" },
			],
		},
		{ label: t("shop"), route: "/loja" },
		{ label: t("schedule"), hash: "#agenda" },
		{ label: t("photosVideos"), hash: "#galeria" },
		{ label: t("support"), hash: "#apoie" },
		{ label: t("contact"), hash: "#contato" },
	];

	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 50);
		};
		handleScroll();
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<header
			className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
				isScrolled ? "bg-muted/95 backdrop-blur-md shadow-lg" : "bg-transparent"
			}`}
		>
			<div className="container mx-auto px-4">
				<div className="flex items-center justify-between h-20">
					{/* Logo */}
					<Link
						href="/"
						className="flex items-center gap-2"
						onClick={(e) => {
							if (isHomePage) {
								e.preventDefault();
								window.scrollTo({ top: 0, behavior: "smooth" });
							}
						}}
					>
						<span className="font-heading font-black text-xl md:text-2xl tracking-wider text-primary-foreground">
							{t("title1")} <span className="text-primary">{t("title2")}</span>{" "}
							{t("title3")}
						</span>
					</Link>

					{/* Desktop Navigation */}
					<nav
						aria-label={tA11y("mainNav")}
						className="hidden lg:flex items-center gap-8"
					>
						{navItems.map((item) => {
							const dropdown = "hash" in item ? item.dropdown : undefined;

							return (
								// biome-ignore lint/a11y/noStaticElementInteractions: o wrapper só abre e fecha o submenu; os itens em si são links
								<div
									key={item.label}
									className="relative"
									onMouseEnter={() => dropdown && setActiveDropdown(item.label)}
									onMouseLeave={() => setActiveDropdown(null)}
									onFocus={() => dropdown && setActiveDropdown(item.label)}
									onBlur={(e) => {
										if (!e.currentTarget.contains(e.relatedTarget)) {
											setActiveDropdown(null);
										}
									}}
									onKeyDown={(e) => {
										if (e.key === "Escape") {
											setActiveDropdown(null);
										}
									}}
								>
									{"route" in item ? (
										<Link
											href={item.route}
											className="font-heading text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
										>
											{item.label}
										</Link>
									) : (
										<HashLink
											hash={item.hash}
											className="font-heading text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
										>
											{item.label}
											{dropdown && (
												<ChevronDown className="w-4 h-4" aria-hidden="true" />
											)}
										</HashLink>
									)}

									{/* Dropdown */}
									<AnimatePresence>
										{dropdown && activeDropdown === item.label && (
											<motion.div
												initial={{ opacity: 0, y: 10 }}
												animate={{ opacity: 1, y: 0 }}
												exit={{ opacity: 0, y: 10 }}
												className="absolute top-full left-0 mt-2 py-2 bg-muted border border-border rounded-lg shadow-xl min-w-[180px] z-50"
											>
												{dropdown.map((subItem) => (
													<HashLink
														key={subItem.label}
														hash={subItem.hash}
														className="block px-4 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-muted/80 transition-colors"
													>
														{subItem.label}
													</HashLink>
												))}
											</motion.div>
										)}
									</AnimatePresence>
								</div>
							);
						})}
					</nav>

					{/* Language Selector & Mobile Menu Button */}
					<div className="flex items-center gap-4">
						{/* biome-ignore lint/a11y/useSemanticElements: fieldset é para controles de formulário; aqui são links */}
						<div
							role="group"
							aria-label={tA11y("language")}
							className="flex items-center gap-1 text-sm font-heading font-semibold"
						>
							{routing.locales.map((targetLocale, index) => (
								<span key={targetLocale} className="flex items-center gap-1">
									{index > 0 && (
										<span className="text-muted-foreground" aria-hidden="true">
											|
										</span>
									)}
									{/*
									 * Navegação completa de propósito: recarregar a página renova
									 * o cookie de idioma no servidor e descarta o cache do
									 * roteador, que guarda redirecionamentos calculados com o
									 * idioma anterior.
									 */}
									<a
										href={`/${targetLocale}${pathname === "/" ? "" : pathname}`}
										hrefLang={languageTag[targetLocale]}
										aria-current={locale === targetLocale ? "true" : undefined}
										className={`px-2 py-1 transition-colors ${
											locale === targetLocale
												? "text-primary"
												: "text-muted-foreground hover:text-primary"
										}`}
									>
										{languageLabels[targetLocale]}
									</a>
								</span>
							))}
						</div>

						<button
							type="button"
							onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
							aria-label={
								isMobileMenuOpen ? tA11y("closeMenu") : tA11y("openMenu")
							}
							aria-expanded={isMobileMenuOpen}
							aria-controls="menu-mobile"
							className="lg:hidden p-2 text-muted-foreground hover:text-primary transition-colors"
						>
							{isMobileMenuOpen ? (
								<X className="w-6 h-6" aria-hidden="true" />
							) : (
								<Menu className="w-6 h-6" aria-hidden="true" />
							)}
						</button>
					</div>
				</div>

				{/* Mobile Menu */}
				<AnimatePresence>
					{isMobileMenuOpen && (
						<motion.nav
							id="menu-mobile"
							aria-label={tA11y("mainNav")}
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							exit={{ opacity: 0, height: 0 }}
							className="lg:hidden overflow-hidden bg-muted border-t border-border"
						>
							<div className="py-4 space-y-2">
								{navItems.map((item) => (
									<div key={item.label}>
										{"route" in item ? (
											<Link
												href={item.route}
												className="block px-4 py-3 font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground hover:text-primary hover:bg-muted/80 transition-colors"
												onClick={() => setIsMobileMenuOpen(false)}
											>
												{item.label}
											</Link>
										) : (
											<>
												<HashLink
													hash={item.hash}
													className="block px-4 py-3 font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground hover:text-primary hover:bg-muted/80 transition-colors"
													onClick={() => setIsMobileMenuOpen(false)}
												>
													{item.label}
												</HashLink>
												{item.dropdown && (
													<div className="pl-8">
														{item.dropdown.map((subItem) => (
															<HashLink
																key={subItem.label}
																hash={subItem.hash}
																className="block px-4 py-2 text-sm text-muted-foreground hover:text-primary transition-colors"
																onClick={() => setIsMobileMenuOpen(false)}
															>
																{subItem.label}
															</HashLink>
														))}
													</div>
												)}
											</>
										)}
									</div>
								))}
							</div>
						</motion.nav>
					)}
				</AnimatePresence>
			</div>
		</header>
	);
};

export default Header;
