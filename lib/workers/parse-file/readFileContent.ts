import fs from 'fs';
import path from 'path';
import { marked } from 'marked';
import PDFParser from "pdf2json"; // Import pdf2json
import officeParser from 'officeparser'; // Import officeParser

/**
 * Read and parse file content based on file type
 */
export async function readFileContent(filePath: string): Promise<string> {
    try {
        // Determine file extension
        const extension = path.extname(filePath).toLowerCase();

        // Parse different file types
        switch (extension) {
            case '.md':
                return parseMarkdownFile(filePath);
            case '.txt':
                return parseTextFile(filePath);
            case '.docx': // Use officeParser
            case '.xlsx': // Use officeParser
            case '.xls':  // Use officeParser
            case '.pptx': // Use officeParser
            case '.ppt':  // Use officeParser
                return await parseOfficeFile(filePath);
            case '.pdf':
                return await parsePdfFile(filePath);
            default:
                // For unknown file types, try to read as text
                return parseTextFile(filePath);
        }
    } catch (error: unknown) {
        throw new Error(`Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Parse a Markdown file
 */
async function parseMarkdownFile(filePath: string): Promise<string> {
    try {
        // Read markdown content
        const mdContent = fs.readFileSync(filePath, 'utf8');

        // Parse markdown to HTML (optional - depends on your needs)
        const htmlContent = marked(mdContent);

        // Return both formats
        return JSON.stringify({
            markdown: mdContent,
            html: htmlContent,
        });
    } catch (error: any) {
        throw new Error(`Error parsing markdown: ${error.message}`);
    }
}

/**
 * Parse a plain text file
 */
function parseTextFile(filePath: string): string {
    return fs.readFileSync(filePath, 'utf8');
}

/**
 * Parse a PDF file using pdf2json
 */
async function parsePdfFile(filePath: string): Promise<string> {

    // pdf2json is event-based, so we wrap it in a Promise
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser(); // Create a new instance

        // Event handler for successful parsing
        pdfParser.on("pdfParser_dataReady", ({ Pages }: any) => {
            try {
                let content = "";
                for (let i = 0; i < Pages.length; i++) {
                    content += `
___________________________
Page ${(i + 1)}
___________________________
`
                    const page = Pages[i];
                    content += extractLinesFromPage(page).join('\n')

                }


                // Extract text content. pdf2json structures data differently.
                // This extracts text from all pages. Adjust if needed.

                resolve(JSON.stringify({
                    text: decodeURIComponent(content),
                    // pdf2json provides data in pdfData.Pages, pdfData.Meta etc.
                    // You can extract more details here if required.
                    // numPages: pdfData.Pages?.length
                }));
            } catch (error: any) {
                reject(new Error(`Error processing PDF data: ${error.message}`));
            }
        });

        // Event handler for errors during parsing
        pdfParser.on("pdfParser_dataError", (errData: any) => {
            reject(new Error(`Error parsing PDF file: ${errData?.parserError ?? 'Unknown pdf2json error'}`));
        });

        // Load the PDF file buffer
        // pdf2json expects a buffer, but its loadPDF method takes the path.
        // If loadPDF fails with path, read the buffer first:
        // const pdfBuffer = fs.readFileSync(filePath);
        // pdfParser.parseBuffer(pdfBuffer);
        pdfParser.loadPDF(filePath);
    });
}

/**
 * Parse an Office file (Word, Excel, PowerPoint) using officeParser
 */
async function parseOfficeFile(filePath: string): Promise<string> {
    try {
        // Use officeParser to extract text content
        const textContent = await officeParser.parseOfficeAsync(filePath);

        // Return the extracted text directly or wrap in JSON if preferred
        // Wrapping in JSON for consistency with other parsers
        return JSON.stringify({
            text: textContent
        });
    } catch (error: any) {
        // Handle potential errors from officeParser
        throw new Error(`Error parsing Office file (${path.basename(filePath)}): ${error.message}`);
    }
}


function extractLinesFromPage(page: any) {
    const lines = [];
    let currentLine = [];
    let lastY = null;
    const yThreshold = 0.5;

    const sortedTexts = page.Texts.sort((a: any, b: any) => {
        if (Math.abs(a.y - b.y) > yThreshold) {
            return a.y - b.y;
        }
        return a.x - b.x;
    });

    for (const text of sortedTexts) {
        const textContent = text.R.map((r: any) => decodeURIComponent(r.T)).join('');
        if (lastY === null || Math.abs(text.y - lastY) <= yThreshold) {
            currentLine.push(textContent);
        } else {
            lines.push(currentLine.join(' '));
            currentLine = [textContent];
        }
        lastY = text.y;
    }

    if (currentLine.length > 0) {
        lines.push(currentLine.join(' ').trim());
    }

    return lines.filter(p => p.length > 0);
}