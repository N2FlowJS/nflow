import path from 'path';
import { expect } from '@jest/globals'; // Import expect from Jest

import { readFileContent } from '../lib/workers/parse-file/readFileContent'; // Adjust import if parsePdfFile is exported directly

// Define the path to the test PDF file relative to the project root or test file location
// Adjust the relative path as needed based on your test execution context
const testPdfPath = path.resolve(process.cwd(), 'docs/file/ga/1.01 Mission and Core Beliefs Revision October 31, 2023.pdf');

describe('readFileContent', () => {
    // Test case for parsePdfFile functionality
    it('should parse the content of a PDF file correctly', async () => {

        try {

            const content = await readFileContent(testPdfPath);

            // Basic assertion: Check if the result is a non-empty string
            expect(typeof content).toBe('string');
            expect(content.length).toBeGreaterThan(0);

            // More specific assertion: Check if the parsed JSON has a 'text' property
            const parsedContent = JSON.parse(content);
            expect(parsedContent).toHaveProperty('text');
            expect(typeof parsedContent.text).toBe('string');
            expect(parsedContent.text.length).toBeGreaterThan(0);

            // Optional: Add more specific checks based on expected content
            // expect(parsedContent.text).toContain("Mission and Core Beliefs");

        } catch (error: unknown) {
            // Fail the test if any error occurs during parsing
            console.error("Test failed due to error:", error);
            throw error; // Re-throw to ensure Jest marks the test as failed
        }
    }); // Set timeout for the test itself as well

    // Add more test cases for other file types or scenarios if needed
});
