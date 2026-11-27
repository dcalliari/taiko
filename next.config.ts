import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

// A Content-Security-Policy leva nonce por requisição e por isso é emitida em src/proxy.ts.
const securityHeaders = [
	{
		key: "Strict-Transport-Security",
		value: "max-age=63072000; includeSubDomains",
	},
	{ key: "X-Content-Type-Options", value: "nosniff" },
	{ key: "X-Frame-Options", value: "DENY" },
	{ key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
	{ key: "Cross-Origin-Opener-Policy", value: "same-origin" },
	{
		key: "Permissions-Policy",
		value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
	},
];

const nextConfig: NextConfig = {
	reactStrictMode: true,
	poweredByHeader: false,
	// Sem isso o `next dev` cria um AGENTS.md na raiz ao detectar um agente de IA.
	agentRules: false,
	images: {
		// Fotos dos produtos fictícios da loja demonstrativa.
		remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
	},
	async headers() {
		return [{ source: "/(.*)", headers: securityHeaders }];
	},
};

export default withNextIntl(nextConfig);
