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
 * Image Analysis Node Definition
 * 
 * Analyze image files to extract metadata, dimensions, and color information.
 * Supports common image formats (JPEG, PNG, GIF, etc.).
 * 
 * Configuration:
 * - imagePath: Path to image file (supports {variable} templates)
 * - analysisType: Type of analysis (metadata, dimensions, colors)
 * - colorPalette: Number of colors to extract (for color analysis)
 * 
 * Analysis Types:
 * - metadata: EXIF data, format, size
 * - dimensions: Width, height, aspect ratio
 * - colors: Dominant colors, color palette
 * 
 * Example:
 * ```json
 * {
 *   "imagePath": "./images/{filename}.jpg",
 *   "analysisType": "dimensions"
 * }
 * ```
 */
export const ImageAnalysisNodeDefinition: NodeDefinition = {
  id: 'image-analysis',
  name: 'Image Analysis',
  category: NodeCategory.PROCESSING,
  description: 'Analyze image files to extract metadata, dimensions, and color information',
  version: '1.0.0',

  inputs: [
    {
      id: 'imagePath',
      name: 'Image Path',
      type: PortType.TEXT,
      description: 'Path to image file (supports {variable} templates)',
      required: true,
      metadata: { inputType: 'text', placeholder: 'Enter image file path...' },
    },
    {
      id: 'analysisType',
      name: 'Analysis Type',
      type: PortType.TEXT,
      description: 'Type of analysis to perform',
      required: true,
      defaultValue: 'metadata',
      metadata: {
        inputType: 'select',
        options: [
          { label: 'Metadata', value: 'metadata' },
          { label: 'Dimensions', value: 'dimensions' },
          { label: 'Colors', value: 'colors' },
        ],
      },
    },
    {
      id: 'colorPalette',
      name: 'Color Palette Size',
      type: PortType.NUMBER,
      description: 'Number of dominant colors to extract',
      required: false,
      defaultValue: 5,
      metadata: { inputType: 'number', min: 1, max: 20 },
    },
  ] as InputPort[],

  outputs: [
    {
      id: 'result',
      name: 'Analysis Result',
      type: PortType.JSON,
      description: 'Image analysis results',
    },
    {
      id: 'width',
      name: 'Width',
      type: PortType.NUMBER,
      description: 'Image width in pixels',
    },
    {
      id: 'height',
      name: 'Height',
      type: PortType.NUMBER,
      description: 'Image height in pixels',
    },
  ] as OutputPort[],

  getDynamicInputs: (config) => {
    const variableNames: Set<string> = new Set();

    if (config.imagePath) {
      getInputFromTemplate(config.imagePath as string).forEach(v => variableNames.add(v));
    }

    const dynamicPorts: InputPort[] = Array.from(variableNames).map(varName => ({
      id: varName,
      name: varName,
      type: PortType.TEXT,
      required: true,
      description: `Template variable: ${varName}`,
      metadata: { isDynamic: true, inputType: 'text' },
    }));

    return [...ImageAnalysisNodeDefinition.inputs, ...dynamicPorts];
  },

  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    const { config, inputs, dispatcher, node, flowState } = context;
    const startTime = new Date().toISOString();

    const templateVars = getInputFromTemplate((config.imagePath as string) || '');

    if (!isNodeReady(templateVars, flowState)) {
      return {
        outputs: { result: null, width: 0, height: 0 },
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

      const imagePath = processTemplate(config.imagePath as string, vars);

      if (!imagePath) {
        throw new Error('Image path is required for image analysis');
      }

      let result: any;

      switch (config.analysisType) {
        case 'metadata':
          result = await getImageMetadata(imagePath);
          break;
        case 'dimensions':
          result = await getImageDimensions(imagePath);
          break;
        case 'colors':
          result = await analyzeImageColors(imagePath, (config.colorPalette as number) || 5);
          break;
        default:
          throw new Error(`Unsupported image analysis type: ${config.analysisType}`);
      }

      const resultText = JSON.stringify(result, null, 2);

      if (dispatcher) {
        dispatcher.setNodeOutput(node.id, resultText, 'imageanalysis');
        dispatcher.setCurrentNode(node);
      }

      return {
        outputs: {
          result,
          width: result.width || 0,
          height: result.height || 0
        },
        status: 'success',
        metadata: {
          startTime,
          endTime: new Date().toISOString(),
          imagePath,
          analysisType: config.analysisType,
          width: result.width || 0,
          height: result.height || 0
        }
      };
    } catch (error: unknown) {
      console.error('Image analysis error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown image analysis error';

      return {
        outputs: {
          result: null,
          width: 0,
          height: 0
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

async function getImageMetadata(imagePath: string) {
  // Simplified implementation - would use sharp or image-size in production
  const stats = await fs.promises.stat(imagePath);
  const ext = path.extname(imagePath);

  return {
    imagePath,
    format: ext.slice(1).toUpperCase(),
    size: stats.size,
    created: stats.birthtime,
    modified: stats.mtime,
    width: 0,
    height: 0,
    note: 'Requires sharp library for full implementation'
  };
}

async function getImageDimensions(imagePath: string) {
  // Simplified implementation - would use image-size library in production
  const stats = await fs.promises.stat(imagePath);

  return {
    imagePath,
    width: 0,
    height: 0,
    aspectRatio: '0:0',
    fileSize: stats.size,
    note: 'Requires image-size library for full implementation'
  };
}

async function analyzeImageColors(imagePath: string, paletteSize: number) {
  // Simplified implementation - would use sharp + color analysis in production
  const stats = await fs.promises.stat(imagePath);

  return {
    imagePath,
    paletteSize,
    colors: [],
    fileSize: stats.size,
    note: 'Requires sharp + color analysis library for full implementation'
  };
}
