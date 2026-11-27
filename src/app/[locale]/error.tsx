"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";

export default function ErrorPage({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	const t = useTranslations("error");

	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<main
			id="conteudo"
			className="flex min-h-screen items-center justify-center bg-muted px-4"
		>
			<div className="text-center">
				<h1 className="mb-4 text-4xl font-bold">{t("title")}</h1>
				<p className="mb-6 text-xl text-muted-foreground">{t("description")}</p>
				<button
					type="button"
					onClick={reset}
					className="px-8 py-4 bg-primary text-primary-foreground font-heading font-bold uppercase tracking-wider text-sm hover:bg-primary/90 transition-colors"
				>
					{t("retry")}
				</button>
			</div>
		</main>
	);
}
