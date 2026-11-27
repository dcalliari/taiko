import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
	const t = await getTranslations("notFound");

	return (
		<main
			id="conteudo"
			className="flex min-h-screen items-center justify-center bg-muted px-4"
		>
			<div className="text-center">
				<h1 className="mb-4 text-4xl font-bold">404</h1>
				<p className="mb-2 text-xl text-foreground">{t("title")}</p>
				<p className="mb-4 text-muted-foreground">{t("description")}</p>
				<Link href="/" className="text-primary underline hover:text-primary/90">
					{t("backHome")}
				</Link>
			</div>
		</main>
	);
}
