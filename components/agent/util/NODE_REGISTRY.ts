import { NodeTypeString, NodeConfig, BeginNodeData, InterfaceNodeData, GenerateNodeData, CategorizeNodeData, RetrievalNodeData, InputOutputInfo } from '../types/flowTypes';

// Central registry of all node types
export const NODE_REGISTRY: Record<NodeTypeString, NodeConfig> = {
  begin: {
    type: 'begin',
    label: 'Begin',
    description: 'Starting point of the flow',
    color: {
      background: '#91caff',
      border: '#69b1ff',
      handle: '#1677ff',
    },
    inputOutputInfo: {
      input: 'None',
      output: 'Initial variables and greeting message',
    },
    defaultData: {
      label: 'Begin',
      type: 'begin',
      form: {
        name: 'Begin',
        greeting: 'Hello!',
        variables: [],
        description: 'Starting point of the flow',
        output: '', // Required by BaseForm
      },
    } as Partial<BeginNodeData>,
  },

  interface: {
    type: 'interface',
    label: 'Interface',
    description: 'Interaction with the user',
    color: {
      background: '#d4e6f9',
      border: '#91caff',
      handle: '#1677ff',
    },
    inputOutputInfo: {
      input: 'Previous node output or user input',
      output: 'User input for next node',
    },
    defaultData: {
      name: 'Interface',
      label: 'Interface',
      type: 'interface',
      form: {
        name: 'Interface',
        description: 'Display output to user and collect input',
        displayFormat: 'text',
        output: '', // Required by BaseForm
      },
    } as Partial<InterfaceNodeData>,
  },

  generate: {
    type: 'generate',
    label: 'Generate',
    description: 'Generate content using AI',
    color: {
      background: '#d9f7be',
      border: '#95de64',
      handle: '#52c41a',
    },
    inputOutputInfo: {
      input: 'Prompt template with variables',
      output: 'AI-generated content',
    },
    defaultData: {
      label: 'Generate',
      type: 'generate',
      form: {
        name: 'Generate',
        description: 'Generate content using AI',
        prompt: '',
        model: '',
        outputVariable: 'generatedText',
        output: '', // Required by BaseForm
      },
    } as Partial<GenerateNodeData>,
  },

  categorize: {
    type: 'categorize',
    label: 'Categorize',
    description: 'Categorize input into different paths',
    color: {
      background: '#ffd6e7',
      border: '#ffadd2',
      handle: '#eb2f96',
    },
 
    defaultData: {
      label: 'Categorize',
      type: 'categorize',
      form: {
        name: 'Categorize',
        model: '',

        description: 'Categorize input into different paths',
        categories: [
          {
            name: 'positive',
            description: 'Positive sentiment or feedback',
            examples: ['I love this product', 'Great service', 'Works perfectly'],
          },
          {
            name: 'negative',
            description: 'Negative sentiment or feedback',
            examples: ['Not working', 'Poor quality', 'Very disappointing'],
          },
        ],
        defaultCategory: 'positive',
        inputRefs: [], // Add this to initialize the input references array
        output: '', // Required by BaseForm
      },
    } as Partial<CategorizeNodeData>,
  },

  retrieval: {
    type: 'retrieval',
    label: 'Retrieval',
    description: 'Retrieve information from knowledge bases',
    color: {
      background: '#d9d9d9',
      border: '#bfbfbf',
      handle: '#595959',
    },
    inputOutputInfo: {
      input: 'Query text for search',
      output: 'Retrieved information from knowledge bases',
    },
    defaultData: {
      label: 'Retrieval',
      type: 'retrieval',
      form: {
        name: 'Retrieval',
        description: 'Retrieve information from knowledge base',
        knowledgeIds: [],
        maxResults: 3,
        threshold: 0.7,
        querySource: 'user_input',
        outputVariable: 'retrievalResults',
        outputFormat: 'text',
        inputRefs: [], // Only retrieval node needs this initialized
        output: '', // Required by BaseForm
      },
    } as Partial<RetrievalNodeData>,
  },
};


// Get available input sources for the query - specifically for nodes that support input references
export function getQueryInputSources(): Array<{ id: string; name: string; description: string }> {
  return [
    {
      id: 'user_input',
      name: 'User Input',
      description: 'The most recent input from the user',
    },
    {
      id: 'generated_text',
      name: 'Generated Text',
      description: 'Output from the most recent Generate node',
    },
    {
      id: 'retrieval_results',
      name: 'Retrieval Results',
      description: 'Results from the most recent Retrieval node',
    },
  ];
}



// Get input/output info for a node type
export function getNodeIOInfo(nodeType: NodeTypeString): InputOutputInfo | undefined {
  return NODE_REGISTRY[nodeType]?.inputOutputInfo;
}

