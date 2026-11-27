import type { NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { buildCsp } from "@/lib/security/csp";

const handleI18nRouting = createIntlMiddleware(routing);

export function proxy(request: NextRequest) {
	const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
	const csp = buildCsp({
		nonce,
		isDev: process.env.NODE_ENV === "development",
	});

	// O Next lê o nonce do cabeçalho CSP da requisição para aplicá-lo aos
	// scripts que gera; x-nonce fica disponível para <Script nonce>.
	request.headers.set("x-nonce", nonce);
	request.headers.set("Content-Security-Policy", csp);

	const response = handleI18nRouting(request);
	response.headers.set("Content-Security-Policy", csp);
	return response;
}

export const config = {
	// Páginas apenas: /api, internos do Next e arquivos (com ponto) ficam de fora.
	matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
