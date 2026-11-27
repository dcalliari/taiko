"use client";

import type { ComponentProps } from "react";
import { Link, usePathname } from "@/i18n/navigation";

interface HashLinkProps extends Omit<ComponentProps<"a">, "href"> {
	/** Âncora de uma seção da página inicial, ex.: "#agenda". */
	hash: `#${string}`;
}

/**
 * Link para uma seção da página inicial. Na própria home é uma âncora comum
 * (rolagem suave do navegador); nas demais páginas navega até a home.
 */
export default function HashLink({ hash, ...props }: HashLinkProps) {
	const isHomePage = usePathname() === "/";

	if (isHomePage) {
		return <a href={hash} {...props} />;
	}

	return <Link href={`/${hash}`} {...props} />;
}
