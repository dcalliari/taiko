interface CspOptions {
	nonce: string;
	isDev: boolean;
}

/**
 * Monta a Content-Security-Policy da aplicação.
 *
 * Novas origens (CDN de imagens, APIs externas, scripts de terceiros) entram
 * aqui, na diretiva correspondente.
 */
export function buildCsp({ nonce, isDev }: CspOptions): string {
	const directives: Record<string, string[]> = {
		"default-src": ["'self'"],
		"script-src": [
			"'self'",
			`'nonce-${nonce}'`,
			"'strict-dynamic'",
			// O React usa eval em desenvolvimento para reconstruir stacks do servidor.
			...(isDev ? ["'unsafe-eval'"] : []),
		],
		// framer-motion escreve atributos style no HTML renderizado no servidor,
		// e atributos não aceitam nonce.
		"style-src": ["'self'", "'unsafe-inline'"],
		"img-src": ["'self'", "blob:", "data:"],
		"font-src": ["'self'"],
		"connect-src": ["'self'"],
		"object-src": ["'none'"],
		"base-uri": ["'self'"],
		"form-action": ["'self'"],
		"frame-ancestors": ["'none'"],
	};

	return Object.entries(directives)
		.map(([name, values]) => [name, ...values].join(" "))
		.join("; ");
}
