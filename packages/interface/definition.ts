import { NodeTypeString } from '@n2flowjs/flow';

export const interfaceType: NodeTypeString = 'interface';

export const interfaceDefinition = {
  type: interfaceType,
  icon: '📊',
  input: 'data',
  output: '',
  data: {
    type: interfaceType,
    form: {
      name: 'Interface',
      description: 'Display interface for data output',
      displayFormat: 'text',
    },
  },
};

export default interfaceDefinition;
