
export interface CustomNodeDefinition {
  id: string;
  name: string;
  description: string;
  code: string;
  inputPorts: Array<{
    name: string;
    type: string;
    required: boolean;
  }>;
  outputPorts: Array<{
    name: string;
    type: string;
  }>;
  icon?: string;
  category: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
  teamId?: string;
}

// Generate a unique package name for the custom node
export const generatePackageName = (definition: CustomNodeDefinition): string => {
  return `custom-${definition.id.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
};

// Create package files for a custom node
export const createCustomNodePackage = (definition: CustomNodeDefinition) => {
  const packageName = generatePackageName(definition);
  const packageDir = `packages/${packageName}`;

  // Create definition.ts
  const definitionContent = `export interface CustomNodeDefinition {

export const ${packageName.toUpperCase().replace(/-/g, '_')}_TYPE: NodeTypeString = '${packageName}';

export const ${packageName}Definition = {
  type: ${packageName.toUpperCase().replace(/-/g, '_')}_TYPE,
  icon: '${definition.icon || '⚙️'}',
  input: '${definition.inputPorts.map(p => p.name).join(', ')}',
  output: '${definition.outputPorts.map(p => p.name).join(', ')}',
  data: {
    type: ${packageName.toUpperCase().replace(/-/g, '_')}_TYPE,
    form: {
      name: '${definition.name}',
      description: '${definition.description.replace(/'/g, "\\'")}',
      code: \`${definition.code.replace(/`/g, '\\`')}\`,
      inputPorts: ${JSON.stringify(definition.inputPorts)},
      outputPorts: ${JSON.stringify(definition.outputPorts)},
    },
  },
};

export default ${packageName}Definition;`;

  // Create executor.ts
  const executorContent = `import { BaseNodeExecutor, ExecutionContext } from '../@node-plugin/base-executor';

export interface ${packageName.charAt(0).toUpperCase() + packageName.slice(1).replace(/-./g, x => x[1].toUpperCase())}Form {
  code: string;
  inputPorts: Array<{
    name: string;
    type: string;
    required: boolean;
  }>;
  outputPorts: Array<{
    name: string;
    type: string;
  }>;
}

export class ${packageName.charAt(0).toUpperCase() + packageName.slice(1).replace(/-./g, x => x[1].toUpperCase())}Executor extends BaseNodeExecutor<${packageName.charAt(0).toUpperCase() + packageName.slice(1).replace(/-./g, x => x[1].toUpperCase())}Form> {
  constructor() {
    super({
      nodeType: '${packageName}',
      defaultRole: 'developer',
      checkInputReadiness: true,
      templateFields: [],
    });
  }

  protected async executeLogic(form: ${packageName.charAt(0).toUpperCase() + packageName.slice(1).replace(/-./g, x => x[1].toUpperCase())}Form, context: ExecutionContext): Promise<any> {
    const { code, inputPorts, outputPorts } = form;

    // Create a safe execution context
    const executionContext = {
      inputs: context.resolvedInputs || {},
      outputs: {},
      // Provide utility functions
      console: {
        log: (...args: any[]) => {
          console.log('[${definition.name}]', ...args);
        },
        error: (...args: any[]) => {
          console.error('[${definition.name}]', ...args);
        },
        warn: (...args: any[]) => {
          console.warn('[${definition.name}]', ...args);
        },
      },
      // Safe JSON utilities
      JSON: {
        parse: JSON.parse,
        stringify: JSON.stringify,
      },
      // Safe Date utilities
      Date: Date,
      // Safe Math utilities
      Math: Math,
      // Safe string utilities
      String: String,
      // Safe number utilities
      Number: Number,
      // Safe array utilities
      Array: Array,
      // Safe object utilities
      Object: Object,
    };

    try {
      // Create a function from the user code
      const userFunction = new Function(
        'context',
        'inputs',
        'outputs',
        \`
        "use strict";
        \${code}
        \`
      );

      // Execute the user code
      const result = userFunction(
        executionContext,
        executionContext.inputs,
        executionContext.outputs
      );

      // Handle both synchronous and asynchronous execution
      const finalResult = result instanceof Promise ? await result : result;

      // Return the outputs
      return executionContext.outputs;

    } catch (error) {
      throw new Error(\`Custom node execution failed: \${error instanceof Error ? error.message : String(error)}\`);
    }
  }
}

export const ${packageName}Executor = new ${packageName.charAt(0).toUpperCase() + packageName.slice(1).replace(/-./g, x => x[1].toUpperCase())}Executor();`;


  return {
    packageName,
    packageDir,
    definitionContent,
    nflow: {
       name: packageName,
        version: '1.0.0',
        description: definition.description,
        enabled: true,
        input: definition.inputPorts.map(p => p.name).join(', '),
        output: definition.outputPorts.map(p => p.name).join(', '),
        defaults: {
          form: {
            name: definition.name,
            description: definition.description,
            code: definition.code,
            inputPorts: definition.inputPorts,
            outputPorts: definition.outputPorts,
          }
        }
    }
  
    
  };
};
