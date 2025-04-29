import { NodeTypeString, NodeConfig, BeginNodeData, InterfaceNodeData, GenerateNodeData, CategorizeNodeData, RetrievalNodeData, InputOutputInfo, DecisionNodeData } from '../../models/flowTypes';
import { BranchesOutlined, DatabaseOutlined, PlayCircleOutlined, QuestionOutlined, RobotOutlined, SendOutlined } from '@ant-design/icons';

// Central registry of all node types
export const NODE_REGISTRY: Record<NodeTypeString, NodeConfig> = {
  begin: {
    type: 'begin',
    icon: <PlayCircleOutlined style={{ color: '#1677ff' }} />,
    color: {
      background: 'rgba(145, 202, 255, .45)',
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
      background: 'rgba(212, 230, 249, .45)',
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
      background: 'rgba(217, 247, 190, .45)',
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
      background: 'rgba(255, 214, 231,.45)',
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
      background: 'rgba(217, 217, 217,.45)',
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
        maxResults: 15,
        threshold: 0.7,
        inputRefs: [], // Only retrieval node needs this initialized
      },
    } as Partial<RetrievalNodeData>,
  },
  decision: {
    type: 'decision',
    icon: <QuestionOutlined style={{ color: '#fa8c16' }} />,
    color: {
      background: 'rgba(255, 247, 230,0.45)',
      border: '#ffe58f',
      handle: '#fa8c16',
    },
    input: 'Variables from previous nodes',
    output: 'Path based on condition groups',
    data: {
      type: 'decision',

      form: {
        name: 'Decision',
        description: 'Route flow based on conditional logic',
        role: 'developer',
        branches: [{
          name: 'Branch 1',
          groups: [{
            conditions: [{ input: '', operator: 'equals', value: '' }],
            logicalOperator: 'AND'
          }],
          groupOperator: 'OR',
          targetNode: ''
        }],
        defaultTarget: '',
        inputRefs: []
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

