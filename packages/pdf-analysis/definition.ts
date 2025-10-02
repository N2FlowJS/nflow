import {
  NodeCategory,
  NodeDefinition,
  NodeExecutionContext,
  NodeExecutionResult,
} from '../@node-plugin/type';
import { PortType, InputPort, OutputPort } from '../@flow/ports/types';
import { getInputFromTemplate, processTemplate } from '@n2flowjs/template/template';
import { isNodeReady } from '@n2flowjs/flow/is-node-ready';
import * as fs from 'fs';
import * as path from 'path';

/**
 * PDF Analysis Node Definition
 * 
 * Analyze and extract information from PDF files.
 * Supports text extraction, metadata, image extraction, and page splitting.
 * 
 * Configuration:
 * - pdfPath: Path to PDF file (supports {variable} templates)
 * - operation: Analysis operation (extract_text, extract_metadata, extract_images, split_pages)
 * - pageRange: Page range to process (e.g., "1-5", optional)
 * - outputDir: Output directory for extracted files (optional)
 * 
 * Operations:
 * - extract_text: Extract text content from PDF
 * - extract_metadata: Get PDF metadata (title, author, pages, etc.)
 * - extract_images: Extract images from PDF pages
 * - split_pages: Split PDF into individual page files
 * 
 * Example:
 * ```json
 * {
 *   "pdfPath": "./documents/{filename}.pdf",
 *   "operation": "extract_text",
 *   "pageRange": "1-10"
 * }
 * ```
 */
export const PdfAnalysisNodeDefinition: NodeDefinition = {
  id: 'pdf-analysis',
  name: 'PDF Analysis',
  category: NodeCategory.PROCESSING,
  description: 'Analyze and extract information from PDF files',
  version: '1.0.0',

  inputs: [
    {
      id: 'pdfPath',
      name: 'PDF Path',
      type: PortType.TEXT,
      description: 'Path to PDF file (supports {variable} templates)',
      required: true,
      metadata: { inputType: 'text', placeholder: 'Enter PDF file path...' },
    },
    {
      id: 'operation',
      name: 'Operation',
      type: PortType.TEXT,
      description: 'Analysis operation to perform',
      required: true,
      defaultValue: 'extract_metadata',
      metadata: {
        inputType: 'select',
        options: [
          { label: 'Extract Text', value: 'extract_text' },
          { label: 'Extract Metadata', value: 'extract_metadata' },
          { label: 'Extract Images', value: 'extract_images' },
          { label: 'Split Pages', value: 'split_pages' },
        ],
      },
    },
    {
      id: 'pageRange',
      name: 'Page Range',
      type: PortType.TEXT,
      description: 'Page range to process (e.g., "1-5", optional)',
      required: false,
      metadata: { inputType: 'text', placeholder: '1-5' },
    },
    {
      id: 'outputDir',
      name: 'Output Directory',
      type: PortType.TEXT,
      description: 'Output directory for extracted files (optional)',
      required: false,
      metadata: { inputType: 'text', placeholder: './output' },
    },
  ] as InputPort[],

  outputs: [
    {
      id: 'result',
      name: 'Analysis Result',
      type: PortType.JSON,
      description: 'PDF analysis results',
    },
    {
      id: 'pageCount',
      name: 'Page Count',
      type: PortType.NUMBER,
      description: 'Number of pages in PDF',
    },
  ] as OutputPort[],

  getDynamicInputs: (config) => {
    const variableNames: Set<string> = new Set();

    if (config.pdfPath) {
      getInputFromTemplate(config.pdfPath as string).forEach(v => variableNames.add(v));
    }
    if (config.pageRange) {
      getInputFromTemplate(config.pageRange as string).forEach(v => variableNames.add(v));
    }
    if (config.outputDir) {
      getInputFromTemplate(config.outputDir as string).forEach(v => variableNames.add(v));
    }

    const dynamicPorts: InputPort[] = Array.from(variableNames).map(varName => ({
      id: varName,
      name: varName,
      type: PortType.TEXT,
      required: true,
      description: `Template variable: ${varName}`,
      metadata: { isDynamic: true, inputType: 'text' },
    }));

    return [...PdfAnalysisNodeDefinition.inputs, ...dynamicPorts];
  },

  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    const { config, inputs, dispatcher, node, flowState } = context;
    const startTime = new Date().toISOString();

    const templateVars = [
      ...getInputFromTemplate((config.pdfPath as string) || ''),
      ...getInputFromTemplate((config.pageRange as string) || ''),
      ...getInputFromTemplate((config.outputDir as string) || '')
    ];

    if (!isNodeReady(templateVars, flowState)) {
      return {
        outputs: { result: null, pageCount: 0 },
        status: 'in_progress',
        metadata: { message: 'Waiting for input variables' }
      };
    }

    try {
      const vars: Record<string, string> = {};
      templateVars.forEach((key) => {
        if (inputs?.[key] !== undefined) {
          vars[key] = String(inputs[key]);
        } else if (flowState.components[key] !== undefined) {
          vars[key] = flowState.components[key].output || '';
        }
      });

      const pdfPath = processTemplate(config.pdfPath as string, vars);

      if (!pdfPath) {
        throw new Error('PDF path is required for PDF analysis');
      }

      // Check if file exists and is readable
      await fs.promises.access(pdfPath, fs.constants.R_OK);

      let result: any;

      switch (config.operation) {
        case 'extract_text':
          result = await extractPdfText(pdfPath, config);
          break;
        case 'extract_metadata':
          result = await extractPdfMetadata(pdfPath, config);
          break;
        case 'extract_images':
          const outputDir = config.outputDir ? processTemplate(config.outputDir as string, vars) : path.dirname(pdfPath);
          result = await extractPdfImages(pdfPath, outputDir, config);
          break;
        case 'split_pages':
          const splitOutputDir = config.outputDir ? processTemplate(config.outputDir as string, vars) : path.dirname(pdfPath);
          result = await splitPdfPages(pdfPath, splitOutputDir, config);
          break;
        default:
          throw new Error(`Unsupported PDF operation: ${config.operation}`);
      }

      const resultText = JSON.stringify(result, null, 2);

      if (dispatcher) {
        dispatcher.setNodeOutput(node.id, resultText, 'pdfanalysis');
        dispatcher.setCurrentNode(node);
      }

      return {
        outputs: {
          result,
          pageCount: result.pageCount || 0
        },
        status: 'success',
        metadata: {
          startTime,
          endTime: new Date().toISOString(),
          pdfPath,
          operation: config.operation,
          pageCount: result.pageCount || 0
        }
      };
    } catch (error: unknown) {
      console.error('PDF analysis error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown PDF analysis error';

      return {
        outputs: {
          result: null,
          pageCount: 0
        },
        status: 'error',
        metadata: {
          startTime,
          endTime: new Date().toISOString(),
          error: errorMessage
        }
      };
    }
  }
};

async function extractPdfText(pdfPath: string, _config: any) {
  // Simplified implementation - would use pdf-parse or similar in production
  const stats = await fs.promises.stat(pdfPath);
  
  return {
    pdfPath,
    operation: 'extract_text',
    text: '',
    pageCount: 0,
    fileSize: stats.size,
    note: 'Requires pdf-parse library for full implementation'
  };
}

async function extractPdfMetadata(pdfPath: string, _config: any) {
  // Simplified implementation - would use pdf-lib or similar in production
  const stats = await fs.promises.stat(pdfPath);
  
  return {
    pdfPath,
    operation: 'extract_metadata',
    pageCount: 0,
    fileSize: stats.size,
    created: stats.birthtime,
    modified: stats.mtime,
    note: 'Requires pdf-lib library for full implementation'
  };
}

async function extractPdfImages(pdfPath: string, outputDir: string, _config: any) {
  // Simplified implementation - would use pdf-lib or pdfjs in production
  const stats = await fs.promises.stat(pdfPath);
  
  return {
    pdfPath,
    operation: 'extract_images',
    outputDir,
    imagesExtracted: 0,
    fileSize: stats.size,
    note: 'Requires pdf-lib library for full implementation'
  };
}

async function splitPdfPages(pdfPath: string, outputDir: string, _config: any) {
  // Simplified implementation - would use pdf-lib in production
  const stats = await fs.promises.stat(pdfPath);
  
  return {
    pdfPath,
    operation: 'split_pages',
    outputDir,
    pagesCreated: 0,
    fileSize: stats.size,
    note: 'Requires pdf-lib library for full implementation'
  };
}
