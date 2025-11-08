import {
  NodeCategory,
  NodeDefinition,
} from '../@node-plugin/type';
import { PortType, InputPort, OutputPort } from '../@flow/ports/types';
import { getInputFromTemplate } from '@n2flowjs/template/template';
import PdfAnalysisExecutor from './executor';

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

  async execute(context) {
    // Delegate to new executor for unified execution
    const executor = new PdfAnalysisExecutor();
    const { node, flowState, dispatcher } = context;
    // Compose minimal FlowExecutionContext
    const execResult = await executor.execute(node, {
      flow: { nodes: [], edges: [] },
      flowState,
      input: { role: 'system', content: '' },
    }, dispatcher);
    let outputs: Record<string, any> = {};
    try {
      outputs = JSON.parse(execResult.execution.output);
    } catch {
      outputs = { result: execResult.execution.output };
    }
    return {
      outputs,
      status: execResult.status as any,
      error: execResult.status === 'error' ? execResult.message : undefined,
      metadata: execResult.nodeInfo,
    };
  },
};

