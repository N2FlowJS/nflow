import { BaseForm, BaseNodeData } from '@n2flowjs/flow';

export interface JsonParseForm extends BaseForm {
	name: string;
	description?: string;
	jsonData: string;
	operation: 'parse' | 'stringify' | 'extract' | 'validate';
	jsonPath?: string;
	outputFormat?: 'object' | 'string';
}

export type JsonParseNodeData = BaseNodeData<JsonParseForm> & { type: 'json-parse' };

declare module '../../models/nodeDataMap' {
	interface NodeDataMap {
		JsonParseNodeData: JsonParseNodeData;
	}
}

