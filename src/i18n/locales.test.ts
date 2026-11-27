import { describe, expect, it } from "vitest";
import ja from "./locales/ja.json";
import pt from "./locales/pt.json";

type Messages = { [key: string]: string | Messages };

function flatten(messages: Messages, prefix = ""): Record<string, string> {
	return Object.fromEntries(
		Object.entries(messages).flatMap(([key, value]) => {
			const path = `${prefix}${key}`;
			return typeof value === "string"
				? [[path, value]]
				: Object.entries(flatten(value, `${path}.`));
		}),
	);
}

describe("traduções", () => {
	const ptMessages = flatten(pt);
	const jaMessages = flatten(ja);

	it("têm exatamente as mesmas chaves em português e japonês", () => {
		expect(Object.keys(jaMessages).sort()).toEqual(
			Object.keys(ptMessages).sort(),
		);
	});

	it.each([
		["pt", ptMessages],
		["ja", jaMessages],
	])("não têm texto vazio em %s", (_locale, messages) => {
		const empty = Object.entries(messages)
			.filter(([, value]) => value.trim() === "")
			.map(([key]) => key);

		expect(empty).toEqual([]);
	});
});
