import { BaseNodeExecutor, ExecutionContext } from '../@node-plugin/base-executor';
import { VariableForm } from './types';
import { getInputFromTemplate, processTemplate } from '@n2flowjs/template/template';

export class VariableNodeExecutor extends BaseNodeExecutor<VariableForm> {
	constructor() {
		super({
			nodeType: 'variable',
			defaultRole: 'developer',
			checkInputReadiness: true,
			templateFields: ['variableValue', 'defaultValue'],
		});
	}

	protected async executeLogic(form: VariableForm, context: ExecutionContext): Promise<string> {
		const operation = form.operation || 'set';
		const variableName = form.variableName;
		let variableValue = form.variableValue;
		let defaultValue = form.defaultValue;

		if (!variableName) {
			throw new Error('Variable name is required');
		}

		// Process templates
		if (typeof variableValue === 'string' && Object.keys(context.templateVariables).length > 0) {
			variableValue = processTemplate(variableValue, context.templateVariables);
		}
		if (typeof defaultValue === 'string' && Object.keys(context.templateVariables).length > 0) {
			defaultValue = processTemplate(defaultValue, context.templateVariables);
		}

		// Initialize flow variables if not exists
		if (!context.flowState.variables) {
			context.flowState.variables = {};
		}

		let result: any;
		let outputValue: any;

		switch (operation) {
			case 'set':
				if (variableValue === undefined) {
					throw new Error('Variable value is required for set operation');
				}
				context.flowState.variables[variableName] = variableValue;
				result = { operation: 'set', variable: variableName, value: variableValue };
				outputValue = variableValue;
				break;

			case 'get':
				const currentValue = context.flowState.variables[variableName];
				if (currentValue === undefined) {
					outputValue = defaultValue ?? null;
					result = { operation: 'get', variable: variableName, value: outputValue, usedDefault: true };
				} else {
					outputValue = currentValue;
					result = { operation: 'get', variable: variableName, value: outputValue, usedDefault: false };
				}
				break;

			case 'delete':
				const existed = variableName in context.flowState.variables;
				delete context.flowState.variables[variableName];
				result = { operation: 'delete', variable: variableName, existed };
				outputValue = null;
				break;

			case 'append':
				if (!context.flowState.variables[variableName]) {
					context.flowState.variables[variableName] = [];
				}
				if (Array.isArray(context.flowState.variables[variableName])) {
					context.flowState.variables[variableName].push(variableValue);
				} else {
					context.flowState.variables[variableName] = [context.flowState.variables[variableName], variableValue];
				}
				result = { operation: 'append', variable: variableName, value: context.flowState.variables[variableName] };
				outputValue = context.flowState.variables[variableName];
				break;

			default:
				throw new Error(`Unsupported variable operation: ${operation}`);
		}

		// Output is JSON string for flowState
		return JSON.stringify({ result, value: outputValue, operation });
	}

	getDynamicInputs(config: VariableForm) {
		const variables = new Set<string>();
		if (config?.variableValue) {
			getInputFromTemplate(config.variableValue).forEach(v => variables.add(v));
		}
		if (config?.defaultValue) {
			getInputFromTemplate(config.defaultValue).forEach(v => variables.add(v));
		}
		return Array.from(variables)
			.sort()
			.map(varName => ({
				id: varName,
				name: varName,
				type: 'text',
				description: `Template variable: {${varName}}`,
				required: false,
				metadata: {
					isDynamic: true,
					sourceTemplate: `{${varName}}`,
				},
			}));
	}
}