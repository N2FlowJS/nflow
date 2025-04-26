import { NodeTypeString, NodeConfig, BeginNodeData, InterfaceNodeData, GenerateNodeData, CategorizeNodeData, RetrievalNodeData, InputOutputInfo, DecisionNodeData } from '../../models/flowTypes';
import { BranchesOutlined, DatabaseOutlined, PlayCircleOutlined, QuestionOutlined, RobotOutlined, SendOutlined } from '@ant-design/icons';

// Central registry of all node types
export const NODE_REGISTRY: Record<NodeTypeString, NodeConfig> = {
  begin: {
    type: 'begin',
    icon: <PlayCircleOutlined style={{ color: '#1677ff' }} />,
    color: {
      background: '#91caff',
      border: '#69b1ff',
      handle: '#1677ff',
    },
    input: 'None',
    output: 'Initial variables and greeting message',
    data: {
      type: 'begin',
      form: {
        role: 'system',
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
    icon: <SendOutlined style={{ color: '#1677ff' }} />,
    color: {
      background: '#d4e6f9',
      border: '#91caff',
      handle: '#1677ff',
    },
    input: 'Previous node output or user input',
    output: 'User input for next node',
    data: {
      name: 'Interface',
      type: 'interface',
      form: {
        role: 'assistant',
        name: 'Interface',
        description: 'Display output to user and collect input',
        displayFormat: 'text',
        output: '', // Required by BaseForm
      },
    } as Partial<InterfaceNodeData>,
  },

  generate: {
    type: 'generate',
    icon: <RobotOutlined style={{ color: '#52c41a' }} />,
    color: {
      background: '#d9f7be',
      border: '#95de64',
      handle: '#52c41a',
    },
    input: 'Prompt template with variables',
    output: 'AI-generated content',
    data: {
      type: 'generate',
      form: {
        name: 'Generate',
        role: 'assistant',
        description: 'Generate content using AI',
        prompt: `Role: Be a helpful assistant.
- Additional knowledge: @`,
        model: '',
        outputVariable: 'generatedText',
        output: '', // Required by BaseForm
      },
    } as Partial<GenerateNodeData>,

  },

  categorize: {
    type: 'categorize',
    icon: <BranchesOutlined style={{ color: "#eb2f96" }} />,
    color: {
      background: '#ffd6e7',
      border: '#ffadd2',
      handle: '#eb2f96',
    },
    input: 'Text to categorize',
    output: 'Categorized output',

    data: {
      type: 'categorize',
      form: {
        role: 'developer',
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
    icon: <DatabaseOutlined style={{ color: '#595959' }} />,
    color: {
      background: '#d9d9d9',
      border: '#bfbfbf',
      handle: '#595959',
    },
    input: 'Query text for search',
    output: 'Retrieved information from knowledge bases',
    data: {
      type: 'retrieval',
      form: {
        name: 'Retrieval',
        role: 'developer',
        description: 'Retrieve information from knowledge base',
        knowledgeIds: [],
        maxResults: 3,
        threshold: 0.7,
        inputRefs: [], // Only retrieval node needs this initialized
      },
    } as Partial<RetrievalNodeData>,
  },
  decision: {
    type: 'decision',
    icon: <QuestionOutlined style={{ color: '#fa8c16' }} />,
    color: {
      background: '#fff7e6',
      border: '#ffe58f',
      handle: '#fa8c16',
    },
    input: 'Decision criteria or condition',
    output: 'Path based on decision outcome',
    data: {
      type: 'decision',
      form: {
        name: 'Decision',
        description: 'Make a decision based on input',
      },
    } as Partial<DecisionNodeData>,
  }
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
export function getNodeInputInfo(nodeType: NodeTypeString): InputOutputInfo | undefined {
  return NODE_REGISTRY[nodeType]?.input ?? undefined;
}

