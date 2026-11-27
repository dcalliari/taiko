import Footer from "@/components/Footer";
import Header from "@/components/Header";

/** Casca das páginas públicas: cabeçalho, conteúdo e rodapé. */
export default function SiteLayout({ children }: LayoutProps<"/[locale]">) {
	return (
		<div className="min-h-screen">
			<Header />
			<main id="conteudo">{children}</main>
			<Footer />
		</div>
	);
}
