import { expect } from "chai";
import { chunkText } from "./textChunker";
import { readFileContent } from "../workers/parse-file/readFileContent";
import path from "path";

describe("chunkText", () => {
    it("splits text from file by default separator (newline)", async () => {
        const testFilePath = path.resolve(process.cwd(), "docs/file/ga/1.01 Mission and Core Beliefs Revision October 31, 2023.pdf");
        const fileContent = await readFileContent(testFilePath);
        const parsed = JSON.parse(fileContent);
        const text = parsed.text || "";

        const chunks = chunkText(text, [`\n`], 128);
        console.log(chunks.flatMap(p => p.length));

        expect(chunks).to.be.an("array");
        expect(chunks.length).to.be.greaterThan(0);
        expect(chunks.join("").replace(/\s/g, "")).to.include(text.replace(/\s/g, "").substring(0, 20));
    });

    it("splits text by custom separator", () => {
        const text = "a--b--c";
        const chunks = chunkText(text, ["--"]);

        expect(chunks.length).to.equal(1);
        expect(chunks[0]).to.include("a b c");

    });

    it("respects maxTokensPerChunk", () => {
        const text = "a b c d e f g h i j";
        const chunks = chunkText(text, [" "], 3);
        expect(chunks.length).to.be.greaterThan(1);
    });

    it("handles empty text", () => {
        const chunks = chunkText("");
        expect(chunks).to.be.an("array");
        expect(chunks.length).to.be.equal(0);
    });

    it("handles no separator provided", () => {
        const text = "abc";
        const chunks = chunkText(text, []);
        expect(chunks.length).to.equal(1);
        expect(chunks[0]).to.include("a b c");
    });
});
