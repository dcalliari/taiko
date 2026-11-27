import { describe, expect, it } from "vitest";
import { isKnownSyllable, splitSyllables, syllableInfo } from "../syllables";

describe("splitSyllables", () => {
	it.each([
		["DON", ["DON"]],
		["KONDON", ["KON", "DON"]],
		["DONKON", ["DON", "KON"]],
		["DONdo", ["DON", "do"]],
		["KONko", ["KON", "ko"]],
		["doko", ["do", "ko"]],
		["dokodoko", ["do", "ko", "do", "ko"]],
		["tsuku", ["tsu", "ku"]],
		["tsuteteko", ["tsu", "te", "te", "ko"]],
		["kara", ["ka", "ra"]],
		["chanchiki", ["chan", "chi", "ki"]],
		["tenteke", ["ten", "te", "ke"]],
	])("splits %s", (word, expected) => {
		expect(splitSyllables(word)).toEqual(expected);
	});

	it("keeps an n that opens the next syllable out of the previous one", () => {
		expect(splitSyllables("kana")).toEqual(["ka", "na"]);
	});

	it("keeps a word without vowels in one piece", () => {
		expect(splitSyllables("ドン")).toEqual(["ドン"]);
	});
});

describe("syllableInfo", () => {
	it("reads the hand from the syllable, as the group writes it", () => {
		expect(syllableInfo("DON").hand).toBe("right");
		expect(syllableInfo("kon").hand).toBe("left");
		expect(syllableInfo("do").hand).toBe("right");
		expect(syllableInfo("ko").hand).toBe("left");
	});

	it("puts ka and ra on the rim", () => {
		expect(syllableInfo("ka").zone).toBe("rim");
		expect(syllableInfo("ra").zone).toBe("rim");
		expect(syllableInfo("don").zone).toBe("center");
	});

	it("marks su as spoken and tsu as light", () => {
		expect(syllableInfo("su").silent).toBe(true);
		expect(syllableInfo("tsu").soft).toBe(true);
	});

	it("still plays a syllable it does not know", () => {
		expect(isKnownSyllable("bam")).toBe(false);
		expect(syllableInfo("bam")).toMatchObject({
			zone: "center",
			silent: false,
		});
	});
});
