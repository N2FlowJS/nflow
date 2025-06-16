import { ExecutionResult, FlowExecutionContext } from '../../../../models/flowExecutionTypes';
import { PdfAnalysisNodeData, FlowNode } from '../../../../models/flowTypes';
import { findNextNodes } from '../../../../utils/server/findNextNode';
import { getInputFromTemplate, processTemplate } from '../../templateProcessor';
import { isNodeReady } from '../../isNodeReady';
import { FlowStateDispatcher } from '../flowStateDispatcher';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Handler for executing PDF Analysis nodes
 */
export async function executePdfAnalysisNode(
  node: FlowNode,
  { flow, flowState }: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const data = node.data as PdfAnalysisNodeData;
  const form = data.form || {};
  const startTime = new Date().toISOString();

  // Extract variables from PDF path
  const inputs: string[] = [
    ...getInputFromTemplate(form.pdfPath || ''),
    ...getInputFromTemplate(form.pageRange || ''),
    ...getInputFromTemplate(form.outputDir || ''),
  ];

  const ready = isNodeReady(inputs, flowState);

  if (!ready) {
    return {
      nextNodes: [],
      status: 'waiting',
      message: 'Waiting for input variables for PDF analysis',
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'pdfanalysis',
        role: 'developer',
      },
      execution: {
        output: 'Waiting for input variables',
        nodeId: node.id,
        nodeName: node.data?.label || node.id,
        startTime: startTime,
      },
    };
  }

  // Prepare variables for template processing
  const vars: Record<string, string> = {};
  inputs.forEach((key) => {
    if (flowState.components[key] !== undefined) {
      vars[key] = flowState.components[key].output || '';
    }
  });

  try {
    console.log(`Executing PDF Analysis node: ${node.id} with operation: ${form.operation}`);

    const pdfPath = processTemplate(form.pdfPath || '', vars);
    
    if (!pdfPath) {
      throw new Error('PDF path is required for PDF analysis');
    }

    // Check if file exists and is readable
    await fs.promises.access(pdfPath, fs.constants.R_OK);

    let result: any;

    switch (form.operation) {
      case 'extract_text':
        result = await extractPdfText(pdfPath, form);
        break;
      case 'extract_metadata':
        result = await extractPdfMetadata(pdfPath, form);
        break;
      case 'extract_images':
        const outputDir = form.outputDir ? processTemplate(form.outputDir, vars) : path.dirname(pdfPath);
        result = await extractPdfImages(pdfPath, outputDir, form);
        break;
      case 'split_pages':
        const splitOutputDir = form.outputDir ? processTemplate(form.outputDir, vars) : path.dirname(pdfPath);
        result = await splitPdfPages(pdfPath, splitOutputDir, form);
        break;
      case 'merge_pdfs':
        throw new Error('PDF merge operation requires multiple input files - not yet implemented');
      default:
        throw new Error(`Unsupported PDF operation: ${form.operation}`);
    }

    const resultText = JSON.stringify(result, null, 2);

    console.log(`PDF Analysis node completed: ${node.id}`);

    // Use shared dispatcher if available
    let finalState = flowState;

    if (dispatcher) {
      dispatcher.setNodeOutput(node.id, resultText, 'pdfanalysis');
      dispatcher.setCurrentNode(node);
      finalState = dispatcher.getState();
    } else {
      // Fallback to local state update
      flowState.components[node.id]['output'] = resultText;
      flowState.components[node.id]['type'] = 'pdfanalysis';
      flowState.components[node.id]['executionTime'] = Date.now();
      flowState.currentNode = node;
      finalState = flowState;
    }

    const nextNodes = findNextNodes(flow, node.id);

    if (nextNodes.length === 0) {
      throw new Error(`At the Node ${node.data.label} no next node found in the flow`);
    }

    return {
      status: 'in_progress',
      nextNodes,
      flowState: finalState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'pdfanalysis',
        role: 'developer',
      },
      execution: {
        nodeId: node.id,
        nodeName: node.data?.form?.name || node.id,
        startTime: startTime,
        endTime: new Date().toISOString(),
        output: resultText,
      },
    };
  } catch (error: unknown) {
    console.error('PDF analysis execution error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown PDF analysis error';

    return {
      nextNodes: [],
      status: 'error',
      message: `PDF analysis failed: ${errorMessage}`,
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'pdfanalysis',
        role: 'developer',
      },
      execution: {
        output: `Error: ${errorMessage}`,
        nodeId: node.id,
        nodeName: node.data?.label || node.id,
        startTime: startTime,
        endTime: new Date().toISOString(),
      },
    };
  }
}

async function extractPdfText(pdfPath: string, form: any) {
  // This is a simplified implementation
  // In a real scenario, you'd use a library like pdf-parse, pdf2pic, or pdf-lib
  const stats = await fs.promises.stat(pdfPath);
  
  return {
    pdfPath: pdfPath,
    operation: 'extract_text',
    fileSize: stats.size,
    pageRange: form.pageRange || 'all',
    preserveFormatting: form.preserveFormatting || false,
    extractedPages: 0, // Would be actual page count
    textLength: 0, // Would be actual text length
    extractedText: '', // Would contain actual extracted text
    note: 'PDF text extraction requires additional PDF processing libraries like pdf-parse or pdf-lib',
    timestamp: new Date().toISOString(),
  };
}

async function extractPdfMetadata(pdfPath: string, _form: any) {
  // This is a simplified implementation
  // In a real scenario, you'd use a library like pdf-lib or pdf-parse
  const stats = await fs.promises.stat(pdfPath);
  
  return {
    pdfPath: pdfPath,
    operation: 'extract_metadata',
    fileSize: stats.size,
    created: stats.birthtime,
    modified: stats.mtime,
    // These would be extracted from actual PDF metadata
    title: 'Unknown',
    author: 'Unknown',
    subject: 'Unknown',
    creator: 'Unknown',
    producer: 'Unknown',
    creationDate: null,
    modificationDate: null,
    pageCount: 0,
    pdfVersion: 'Unknown',
    encrypted: false,
    note: 'PDF metadata extraction requires additional PDF processing libraries like pdf-lib',
    timestamp: new Date().toISOString(),
  };
}

async function extractPdfImages(pdfPath: string, outputDir: string, form: any) {
  // This is a simplified implementation
  // In a real scenario, you'd use a library like pdf2pic or pdf-lib
  const stats = await fs.promises.stat(pdfPath);
  
  // Ensure output directory exists
  try {
    await fs.promises.access(outputDir);
  } catch {
    await fs.promises.mkdir(outputDir, { recursive: true });
  }
  
  return {
    pdfPath: pdfPath,
    operation: 'extract_images',
    outputDirectory: outputDir,
    fileSize: stats.size,
    pageRange: form.pageRange || 'all',
    extractedImages: 0, // Would be actual count
    imageFiles: [], // Would contain list of extracted image files
    note: 'PDF image extraction requires additional PDF processing libraries like pdf2pic or pdf-lib',
    timestamp: new Date().toISOString(),
  };
}

async function splitPdfPages(pdfPath: string, outputDir: string, form: any) {
  // This is a simplified implementation
  // In a real scenario, you'd use a library like pdf-lib
  const stats = await fs.promises.stat(pdfPath);
  
  // Ensure output directory exists
  try {
    await fs.promises.access(outputDir);
  } catch {
    await fs.promises.mkdir(outputDir, { recursive: true });
  }
  
  return {
    pdfPath: pdfPath,
    operation: 'split_pages',
    outputDirectory: outputDir,
    fileSize: stats.size,
    pageRange: form.pageRange || 'all',
    splitFiles: [], // Would contain list of split PDF files
    totalPages: 0, // Would be actual page count
    note: 'PDF page splitting requires additional PDF processing libraries like pdf-lib',
    timestamp: new Date().toISOString(),
  };
}
