import {
  NodeCategory,
  NodeDefinition,
} from '../@node-plugin/type';
import { ImageAnalysisExecutor } from './executor';
import { PortType, InputPort, OutputPort } from '../@flow/ports/types';
import { getInputFromTemplate } from '@n2flowjs/template/template';
// Removed unused imports after migration

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

  async execute({ node, config, inputs, dispatcher }) {
    const executor = new ImageAnalysisExecutor();
    // Merge config and inputs for form
    const form = { ...config, ...inputs };
    // Minimal context for executor
    const context = {
      flow: { nodes: [], edges: [] },
      flowState: {
        currentNode: node,
        executionTime: Date.now(),
        components: { ...inputs },
        variables: {},
        history: [],
      },
      input: { role: 'developer' as 'developer', content: inputs.imagePath || '' },
    };
    try {
      const output = await executor.execute(node, context, dispatcher);
  const resultObj = typeof output.execution.output === 'object' && output.execution.output !== null ? output.execution.output as any : {};
      return {
        outputs: {
          result: output.execution.output,
          width: resultObj?.width ?? 0,
          height: resultObj?.height ?? 0,
        },
        status: output.status === 'error' ? 'error' : 'success',
        metadata: {
          startTime: output.execution.startTime,
          endTime: output.execution.endTime,
          imagePath: form.imagePath,
          analysisType: form.analysisType,
          width: resultObj?.width ?? 0,
          height: resultObj?.height ?? 0,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown image analysis error';
      return {
        outputs: {
          result: null,
          width: 0,
          height: 0,
        },
        status: 'error',
        metadata: {
          error: errorMessage,
        },
      };
    }
  },
};

// Removed unused legacy functions after migration
