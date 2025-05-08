import {expect} from '@jest/globals';

import { chunkText } from "../lib/utils/textChunker";
import { readFileContent } from "../lib/workers/parse-file/readFileContent";
import path from "path";

describe("chunkText", () => {
    it("splits text from file by default separator (newline)", async () => {
        const testFilePath = path.resolve(process.cwd(), "docs/file/ga/1.01 Mission and Core Beliefs Revision October 31, 2023.pdf");
        const fileContent = await readFileContent(testFilePath);
        const parsed = JSON.parse(fileContent);
        const text = parsed.text || "";

        const chunks = chunkText(text, [`\n`], 128);
        console.log(chunks.flatMap(p => p.length));

        expect(Array.isArray(chunks)).toBe(true);
        expect(chunks.length).toBeGreaterThan(0);
        expect(chunks.join("").replace(/\s/g, "")).toContain(text.replace(/\s/g, "").substring(0, 20));
    });

    it("splits text by custom separator", () => {
        const text = "a--b--c";
        const chunks = chunkText(text, ["--"]);

        expect(chunks.length).toBe(1);
        expect(chunks[0]).toContain("a b c");

    });

    it("respects maxTokensPerChunk", () => {
        const text = "a b c d e f g h i j";
        const chunks = chunkText(text, [" "], 3);
        expect(chunks.length).toBeGreaterThan(1);
    });

    it("handles empty text", () => {
        const chunks = chunkText("");
        expect(Array.isArray(chunks)).toBe(true);
        expect(chunks.length).toBe(0);
    });

    it("handles no separator provided", () => {
        const text = "abc";
        const chunks = chunkText(text, []);
        expect(chunks.length).toBe(1);
        expect(chunks[0]).toContain("abc");
    });
});
