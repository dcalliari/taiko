import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const Header = () => {
	const { t, i18n } = useTranslation();
	const [isScrolled, setIsScrolled] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

	const currentLang = i18n.language === "ja" ? "JP" : "PT";

	const navItems = [
		{
			label: t("header.about"),
			href: "#sobre",
			dropdown: [
				{ label: t("header.whoWeAre"), href: "#quem-somos" },
				{ label: t("header.ourMusic"), href: "#musica" },
				{ label: t("header.history"), href: "#historia" },
			],
		},
		{ label: t("header.shop"), href: "/loja", isRoute: true },
		{ label: t("header.cdsMusic"), href: "#cds" },
		{ label: t("header.schedule"), href: "#agenda" },
		{ label: t("header.photosVideos"), href: "#galeria" },
		{ label: t("header.support"), href: "#apoie" },
		{ label: t("header.contact"), href: "#contato" },
	];

	const changeLanguage = (lang: "PT" | "JP") => {
		i18n.changeLanguage(lang === "JP" ? "ja" : "pt");
	};

	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 50);
		};
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
					{/** biome-ignore lint/a11y/useValidAnchor: This is the intended behavior, to go back to the top of the page */}
					<a href="#" className="flex items-center gap-2">
						<span className="font-heading font-black text-xl md:text-2xl tracking-wider text-primary-foreground">
							{t("header.title1")}{" "}
							<span className="text-primary">{t("header.title2")}</span>{" "}
							{t("header.title3")}
						</span>
					</a>

					{/* Desktop Navigation */}
					<nav className="hidden lg:flex items-center gap-8">
						{navItems.map((item) => (
							// biome-ignore lint/a11y/noStaticElementInteractions: Dropdown handled with mouse events
							<div
								key={item.label}
								className="relative"
								onMouseEnter={() =>
									item.dropdown && setActiveDropdown(item.label)
								}
								onMouseLeave={() => setActiveDropdown(null)}
							>
								{item.isRoute ? (
									<Link
										to={item.href}
										className="font-heading text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
									>
										{item.label}
									</Link>
								) : (
									<a
										href={item.href}
										className="font-heading text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
									>
										{item.label}
										{item.dropdown && <ChevronDown className="w-4 h-4" />}
									</a>
								)}

								{/* Dropdown */}
								<AnimatePresence>
									{item.dropdown && activeDropdown === item.label && (
										<motion.div
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: 10 }}
											className="absolute top-full left-0 mt-2 py-2 bg-muted border border-border rounded-lg shadow-xl min-w-[180px] z-50"
										>
											{item.dropdown.map((subItem) => (
												<a
													key={subItem.label}
													href={subItem.href}
													className="block px-4 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-muted/80 transition-colors"
												>
													{subItem.label}
												</a>
											))}
										</motion.div>
									)}
								</AnimatePresence>
							</div>
						))}
					</nav>

					{/* Language Selector & Mobile Menu Button */}
					<div className="flex items-center gap-4">
						<div className="flex items-center gap-1 text-sm font-heading font-semibold">
							<button
								type="button"
								onClick={() => changeLanguage("PT")}
								className={`px-2 py-1 transition-colors ${
									currentLang === "PT"
										? "text-primary"
										: "text-muted-foreground hover:text-primary"
								}`}
							>
								PT
							</button>
							<span className="text-muted-foreground">|</span>
							<button
								type="button"
								onClick={() => changeLanguage("JP")}
								className={`px-2 py-1 transition-colors ${
									currentLang === "JP"
										? "text-primary"
										: "text-muted-foreground hover:text-primary"
								}`}
							>
								JP
							</button>
						</div>

						<button
							type="button"
							onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
							className="lg:hidden p-2 text-muted-foreground hover:text-primary transition-colors"
						>
							{isMobileMenuOpen ? (
								<X className="w-6 h-6" />
							) : (
								<Menu className="w-6 h-6" />
							)}
						</button>
					</div>
				</div>

				{/* Mobile Menu */}
				<AnimatePresence>
					{isMobileMenuOpen && (
						<motion.nav
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							exit={{ opacity: 0, height: 0 }}
							className="lg:hidden overflow-hidden bg-muted border-t border-border"
						>
							<div className="py-4 space-y-2">
								{navItems.map((item) => (
									<div key={item.label}>
										{item.isRoute ? (
											<Link
												to={item.href}
												className="block px-4 py-3 font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground hover:text-primary hover:bg-muted/80 transition-colors"
												onClick={() => setIsMobileMenuOpen(false)}
											>
												{item.label}
											</Link>
										) : (
											<a
												href={item.href}
												className="block px-4 py-3 font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground hover:text-primary hover:bg-muted/80 transition-colors"
												onClick={() => setIsMobileMenuOpen(false)}
											>
												{item.label}
											</a>
										)}
										{item.dropdown && (
											<div className="pl-8">
												{item.dropdown.map((subItem) => (
													<a
														key={subItem.label}
														href={subItem.href}
														className="block px-4 py-2 text-sm text-muted-foreground hover:text-primary transition-colors"
														onClick={() => setIsMobileMenuOpen(false)}
													>
														{subItem.label}
													</a>
												))}
											</div>
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
