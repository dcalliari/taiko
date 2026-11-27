import { describe, expect, it } from "vitest";
import { buildCsp } from "./csp";

function parse(csp: string): Record<string, string[]> {
	return Object.fromEntries(
		csp.split("; ").map((directive) => {
			const [name = "", ...values] = directive.split(" ");
			return [name, values];
		}),
	);
}

describe("buildCsp", () => {
	it("libera scripts só por nonce em produção", () => {
		const csp = parse(buildCsp({ nonce: "abc123", isDev: false }));

		expect(csp["script-src"]).toEqual([
			"'self'",
			"'nonce-abc123'",
			"'strict-dynamic'",
		]);
	});

	it("permite eval apenas em desenvolvimento", () => {
		const dev = parse(buildCsp({ nonce: "abc123", isDev: true }));

		expect(dev["script-src"]).toContain("'unsafe-eval'");
	});

	it("bloqueia enquadramento, plugins e troca de base", () => {
		const csp = parse(buildCsp({ nonce: "abc123", isDev: false }));

		expect(csp["default-src"]).toEqual(["'self'"]);
		expect(csp["frame-ancestors"]).toEqual(["'none'"]);
		expect(csp["object-src"]).toEqual(["'none'"]);
		expect(csp["base-uri"]).toEqual(["'self'"]);
		expect(csp["form-action"]).toEqual(["'self'"]);
	});

	it("não usa nonce em style-src, o que anularia o unsafe-inline", () => {
		const csp = parse(buildCsp({ nonce: "abc123", isDev: false }));

		expect(csp["style-src"]).toEqual(["'self'", "'unsafe-inline'"]);
	});
});
