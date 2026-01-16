import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

const navItems = [
	{
		label: "Sobre o Kodon",
		href: "#sobre",
		dropdown: [
			{ label: "Quem Somos", href: "#quem-somos" },
			{ label: "Nossa Música", href: "#musica" },
			{ label: "História", href: "#historia" },
		],
	},
	{ label: "Loja", href: "#loja" },
	{ label: "CDs e Músicas", href: "#cds" },
	{ label: "Agenda e Notícias", href: "#agenda" },
	{ label: "Fotos e Vídeos", href: "#galeria" },
	{ label: "Apoie-nos", href: "#apoie" },
	{ label: "Contato", href: "#contato" },
];

const Header = () => {
	const [isScrolled, setIsScrolled] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
	const [language, setLanguage] = useState<"PT" | "JP">("PT");

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
					<a href="/" className="flex items-center gap-2">
						<span className="font-heading font-black text-xl md:text-2xl tracking-wider text-primary-foreground">
							KODON <span className="text-primary">AMAZON</span> TAIKO
						</span>
					</a>

					{/* Desktop Navigation */}
					<nav className="hidden lg:flex items-center gap-8">
						{navItems.map((item) => (
							<div
								key={item.label}
								className="relative"
								onMouseEnter={() =>
									item.dropdown && setActiveDropdown(item.label)
								}
								onMouseLeave={() => setActiveDropdown(null)}
							>
								<a
									href={item.href}
									className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
								>
									{item.label}
									{item.dropdown && <ChevronDown className="w-4 h-4" />}
								</a>

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
								onClick={() => setLanguage("PT")}
								className={`px-2 py-1 transition-colors ${
									language === "PT"
										? "text-primary"
										: "text-muted-foreground hover:text-primary"
								}`}
							>
								PT
							</button>
							<span className="text-muted-foreground">|</span>
							<button
								type="button"
								onClick={() => setLanguage("JP")}
								className={`px-2 py-1 transition-colors ${
									language === "JP"
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
										<a
											href={item.href}
											className="block px-4 py-3 font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground hover:text-primary hover:bg-muted/80 transition-colors"
											onClick={() => setIsMobileMenuOpen(false)}
										>
											{item.label}
										</a>
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
