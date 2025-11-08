import { BaseNodeExecutor, ExecutionContext } from '../@node-plugin/base-executor';
import { TransformForm } from './types';

export class TransformExecutor extends BaseNodeExecutor<TransformForm> {
  constructor() {
    super({
      nodeType: 'transform',
      defaultRole: 'developer',
      checkInputReadiness: true,
      templateFields: ['inputData'],
    });
  }

  protected async executeLogic(form: TransformForm, context: ExecutionContext): Promise<any> {
    let inputData = form.inputData;
    const transformation = form.transformation;
    const transformType = form.transformType || 'json';

    // Template processing
    if (typeof inputData === 'string') {
      inputData = this.processTemplate(inputData, context);
    }

    // Parse input data based on type
    let parsedData: any;
    switch (transformType) {
      case 'json':
      case 'array':
      case 'object':
        parsedData = typeof inputData === 'string' ? JSON.parse(inputData) : inputData;
        break;
      case 'text':
      default:
        parsedData = String(inputData);
        break;
    }

    // Safe JS execution
    const safeGlobals = {
      JSON,
      Object,
      Array,
      String,
      Number,
      Boolean,
      Math,
      Date,
      RegExp,
      parseInt,
      parseFloat,
      isNaN,
      isFinite,
    };

    let transformedData: any;
    const transformFunction = new Function(
      'data',
      ...Object.keys(safeGlobals),
      `"use strict"; return (${transformation});`
    );
    transformedData = transformFunction(parsedData, ...Object.values(safeGlobals));

    return transformedData;
  }
}

export default TransformExecutor;
