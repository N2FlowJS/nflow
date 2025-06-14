import {
  NodeTypeString,
  NodeConfig,
  BeginNodeData,
  InterfaceNodeData,
  GenerateNodeData,
  CategorizeNodeData,
  RetrievalNodeData,
  DecisionNodeData,
  KeywordsNodeData,
  ExecMysqlNodeData,
  ExecMssqlNodeData,
  SubAgentNodeData,
  SendMailNodeData,
  GoogleSearchNodeData,
  WikipediaSearchNodeData,
  RewriteNodeData,
  HttpRequestNodeData,
  TransformNodeData,
  FileReadNodeData,
  FileWriteNodeData,
  DelayNodeData,
  WebhookNodeData,
  TextProcessNodeData,
  JsonParseNodeData,
  ValidateNodeData,
  MathNodeData,
  DateTimeNodeData,
  ConditionNodeData,
  MattermostNodeData,
  SlackNodeData,
  JiraNodeData,
  GitLabNodeData,
} from '../../models/flowTypes';
import {
  BranchesOutlined,
  DatabaseOutlined,
  PlayCircleOutlined,
  QuestionOutlined,
  RobotOutlined,
  SendOutlined,
  TagsOutlined,
  TeamOutlined,
  MailOutlined,
  SearchOutlined,
  GlobalOutlined,
  EditOutlined,
  ApiOutlined,
  SwapOutlined,
  FileTextOutlined,
  SaveOutlined,
  ClockCircleOutlined,
  LinkOutlined,
  CodeOutlined,
  FontSizeOutlined,
  CheckCircleOutlined,
  CalculatorOutlined,
  FieldTimeOutlined,
  BranchesOutlined as ConditionOutlined,
  MessageOutlined,
  SlackOutlined,
  BugOutlined,
  GitlabOutlined,
} from '@ant-design/icons';

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
        numberHistory: 8, // Default to 8, can be set by user
      },
    } as Partial<GenerateNodeData>,
  },

  categorize: {
    type: 'categorize',
    icon: <BranchesOutlined style={{ color: '#eb2f96' }} />,
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
        branches: [
          {
            name: 'Branch 1',
            groups: [
              {
                conditions: [{ input: '', operator: 'equals', value: '' }],
                logicalOperator: 'AND',
              },
            ],
            groupOperator: 'OR',
            targetNode: '',
          },
        ],
        defaultTarget: '',
        inputRefs: [],
      },
    } as Partial<DecisionNodeData>,
  },
  keywords: {
    type: 'keywords',
    icon: <TagsOutlined style={{ color: '#722ed1' }} />,
    color: {
      background: 'rgba(212, 230, 249, .45)',
      border: '#91caff',
      handle: '#722ed1',
    },
    input: 'Text to extract keywords from',
    output: 'Extracted keywords',
    data: {
      type: 'keywords',
      form: {
        role: 'developer',
        name: 'Keywords',
        description: 'Extract keywords from input text',
        model: '',
        prompt: `Extract keywords from conversation:
        The conversation below is between a user and an AI assistant.
        {{conversation}}
        {{extraInfo}}
        Extract the most relevant keywords from the conversation above.
        Keywords should be separated by commas.`,
        maxResults: 10,
        inputRefs: [],
        output: '',
        numberHistory: 8, // Default to 8, can be set by user
      },
    } as Partial<KeywordsNodeData>,
  },
  execmysql: {
    type: 'execmysql',
    icon: <DatabaseOutlined style={{ color: '#ff7a00' }} />,
    color: {
      background: 'rgba(255, 247, 230, .45)',
      border: '#ffb366',
      handle: '#ff7a00',
    },
    input: 'Variables for SQL query substitution',
    output: 'Query results as JSON array',
    data: {
      type: 'execmysql',
      form: {
        role: 'developer',
        name: 'MySQL Execution',
        description: 'Execute MySQL queries and return results',
        query: 'SELECT * FROM table_name LIMIT 10',
        server: 'localhost',
        port: 3306,
        user: '',
        password: '',
        database: '',
        timeout: 30,
        maxRows: 100,
        inputRefs: [],
        output: '',
      },
    } as Partial<ExecMysqlNodeData>,
  },
  execmssql: {
    type: 'execmssql',
    icon: <DatabaseOutlined style={{ color: '#0078d4' }} />,
    color: {
      background: 'rgba(0, 120, 212, .1)',
      border: '#40a9ff',
      handle: '#0078d4',
    },
    input: 'Variables for SQL query substitution',
    output: 'Query results as JSON array',
    data: {
      type: 'execmssql',
      form: {
        role: 'developer',
        name: 'MSSQL Execution',
        description: 'Execute Microsoft SQL Server queries and return results',
        query: 'SELECT * FROM table_name',
        server: 'localhost',
        port: 1433,
        user: '',
        password: '',
        database: '',
        timeout: 30,
        maxRows: 100,
        trustServerCertificate: true,
        inputRefs: [],
        output: '',
      },
    } as Partial<ExecMssqlNodeData>,
  },
  subagent: {
    type: 'subagent',
    icon: <TeamOutlined style={{ color: '#13c2c2' }} />,
    color: {
      background: 'rgba(230, 255, 251, .45)',
      border: '#5cdbd3',
      handle: '#13c2c2',
    },
    input: 'Variables and context from current flow',
    output: 'Results from sub-agent execution',
    data: {
      type: 'subagent',
      form: {
        role: 'developer',
        name: 'Sub Agent',
        description: 'Execute another agent/flow as a sub-process',
        agentId: '',
        agentName: '',
        variables: {},
        timeout: 300,
        inheritContext: true,
        inputRefs: [],
        output: '',
      },
    } as Partial<SubAgentNodeData>,
  },
  sendmail: {
    type: 'sendmail',
    icon: <MailOutlined style={{ color: '#1890ff' }} />,
    color: {
      background: 'rgba(24, 144, 255, .1)',
      border: '#69c0ff',
      handle: '#1890ff',
    },
    input: 'Email content and recipient information',
    output: 'Email sending status and result',
    data: {
      type: 'sendmail',
      form: {
        role: 'developer',
        name: 'Send Mail',
        description: 'Send emails with dynamic content',
        to: '',
        subject: 'Notification from Flow',
        body: 'Hello,\n\nThis is an automated message from your flow.\n\nBest regards',
        isHtml: false,
        useSystemConfig: true,
        smtpHost: 'smtp.gmail.com',
        smtpPort: 587,
        smtpUser: '',
        smtpPassword: '',
        smtpSecure: true,
        inputRefs: [],
        output: '',
      },
    } as Partial<SendMailNodeData>,
  },
  googlesearch: {
    type: 'googlesearch',
    icon: <SearchOutlined style={{ color: '#4285f4' }} />,
    color: {
      background: 'rgba(66, 133, 244, .1)',
      border: '#4285f4',
      handle: '#4285f4',
    },
    input: 'Search query text',
    output: 'Search results with titles, descriptions, and URLs',
    data: {
      type: 'googlesearch',
      form: {
        role: 'developer',
        name: 'Google Search',
        description: 'Search Google for information and return results',
        query: '{{searchTerm}}',
        maxResults: 10,
        safeSearch: 'moderate',
        language: 'en',
        country: 'us',
        useSystemConfig: true,
        inputRefs: [],
        output: '',
      },
    } as Partial<GoogleSearchNodeData>,
  },
  wikipediasearch: {
    type: 'wikipediasearch',
    icon: <GlobalOutlined style={{ color: '#000000' }} />,
    color: {
      background: 'rgba(0, 0, 0, .05)',
      border: '#595959',
      handle: '#000000',
    },
    input: 'Search query text',
    output: 'Wikipedia articles with summaries and URLs',
    data: {
      type: 'wikipediasearch',
      form: {
        role: 'developer',
        name: 'Wikipedia Search',
        description: 'Search Wikipedia for information and return articles',
        query: '{{searchTerm}}',
        maxResults: 5,
        language: 'en',
        summaryOnly: true,
        inputRefs: [],
        output: '',
      },
    } as Partial<WikipediaSearchNodeData>,
  },
  rewrite: {
    type: 'rewrite',
    icon: <EditOutlined style={{ color: '#52c41a' }} />,
    color: {
      background: 'rgba(82, 196, 26, .1)',
      border: '#73d13d',
      handle: '#52c41a',
    },
    input: 'Text and conversation history to rewrite',
    output: 'Rewritten and improved text',
    data: {
      type: 'rewrite',
      form: {
        role: 'assistant',
        name: 'Rewrite',
        description: 'Rewrite and improve questions from conversation history',
        model: '',
        prompt: `Based on the conversation history, rewrite the user's latest question to be more complete, clear, and contextually aware.

Conversation history:
{{conversation}}

Current question: {{userInput}}

Instructions:
- Make the question self-contained and complete
- Include relevant context from the conversation
- Maintain the original intent and meaning
- Make it more specific and actionable
- Use professional language

Rewritten question:`,
        numberHistory: 5,
        preserveMeaning: true,
        outputStyle: 'professional',
        inputRefs: [],
        output: '',
      },
    } as Partial<RewriteNodeData>,
  },
  httprequest: {
    type: 'httprequest',
    icon: <ApiOutlined style={{ color: '#fa8c16' }} />,
    color: {
      background: 'rgba(250, 140, 22, .1)',
      border: '#ffa940',
      handle: '#fa8c16',
    },
    input: 'URL parameters and request data',
    output: 'HTTP response data',
    data: {
      type: 'httprequest',
      form: {
        role: 'developer',
        name: 'HTTP Request',
        description: 'Make HTTP requests to external APIs',
        method: 'GET',
        url: 'https://api.example.com/{{endpoint}}',
        timeout: 30,
        followRedirects: true,
        inputRefs: [],
        output: '',
      },
    } as Partial<HttpRequestNodeData>,
  },
  transform: {
    type: 'transform',
    icon: <SwapOutlined style={{ color: '#722ed1' }} />,
    color: {
      background: 'rgba(114, 46, 209, .1)',
      border: '#b37feb',
      handle: '#722ed1',
    },
    input: 'Data to transform',
    output: 'Transformed data',
    data: {
      type: 'transform',
      form: {
        role: 'developer',
        name: 'Transform',
        description: 'Transform and manipulate data',
        transformType: 'json',
        transformation: 'data.map(item => ({ ...item, processed: true }))',
        inputData: '{{previousNodeOutput}}',
        inputRefs: [],
        output: '',
      },
    } as Partial<TransformNodeData>,
  },
  fileread: {
    type: 'fileread',
    icon: <FileTextOutlined style={{ color: '#52c41a' }} />,
    color: {
      background: 'rgba(82, 196, 26, .1)',
      border: '#95de64',
      handle: '#52c41a',
    },
    input: 'File path to read',
    output: 'File content',
    data: {
      type: 'fileread',
      form: {
        role: 'developer',
        name: 'File Read',
        description: 'Read content from files',
        filePath: '/path/to/file.txt',
        encoding: 'utf8',
        maxSize: 1048576, // 1MB
        inputRefs: [],
        output: '',
      },
    } as Partial<FileReadNodeData>,
  },
  filewrite: {
    type: 'filewrite',
    icon: <SaveOutlined style={{ color: '#1890ff' }} />,
    color: {
      background: 'rgba(24, 144, 255, .1)',
      border: '#69c0ff',
      handle: '#1890ff',
    },
    input: 'Content to write to file',
    output: 'Write operation result',
    data: {
      type: 'filewrite',
      form: {
        role: 'developer',
        name: 'File Write',
        description: 'Write content to files',
        filePath: '/path/to/output.txt',
        content: '{{contentToWrite}}',
        encoding: 'utf8',
        overwrite: true,
        inputRefs: [],
        output: '',
      },
    } as Partial<FileWriteNodeData>,
  },
  delay: {
    type: 'delay',
    icon: <ClockCircleOutlined style={{ color: '#fa8c16' }} />,
    color: {
      background: 'rgba(250, 140, 22, .1)',
      border: '#ffa940',
      handle: '#fa8c16',
    },
    input: 'Previous node output',
    output: 'Same as input after delay',
    data: {
      type: 'delay',
      form: {
        role: 'developer',
        name: 'Delay',
        description: 'Add a delay in flow execution',
        duration: 5,
        unit: 'seconds',
        inputRefs: [],
        output: '',
      },
    } as Partial<DelayNodeData>,
  },
  webhook: {
    type: 'webhook',
    icon: <LinkOutlined style={{ color: '#13c2c2' }} />,
    color: {
      background: 'rgba(19, 194, 194, .1)',
      border: '#5cdbd3',
      handle: '#13c2c2',
    },
    input: 'Data to send via webhook',
    output: 'Webhook response',
    data: {
      type: 'webhook',
      form: {
        role: 'developer',
        name: 'Webhook',
        description: 'Send data to webhook endpoints',
        webhookUrl: 'https://hooks.example.com/webhook',
        method: 'POST',
        payload: '{{dataToSend}}',
        retryCount: 3,
        inputRefs: [],
        output: '',
      },
    } as Partial<WebhookNodeData>,
  },
  jsonparse: {
    type: 'jsonparse',
    icon: <CodeOutlined style={{ color: '#13c2c2' }} />,
    color: {
      background: 'rgba(19, 194, 194, .1)',
      border: '#5cdbd3',
      handle: '#13c2c2',
    },
    input: 'JSON data to parse or manipulate',
    output: 'Processed JSON result',
    data: {
      type: 'jsonparse',
      form: {
        role: 'developer',
        name: 'JSON Parse',
        description: 'Parse, stringify, or extract data from JSON',
        jsonData: '{{inputData}}',
        operation: 'parse',
        outputFormat: 'object',
        inputRefs: [],
        output: '',
      },
    } as Partial<JsonParseNodeData>,
  },
  textprocess: {
    type: 'textprocess',
    icon: <FontSizeOutlined style={{ color: '#eb2f96' }} />,
    color: {
      background: 'rgba(235, 47, 150, .1)',
      border: '#ffadd2',
      handle: '#eb2f96',
    },
    input: 'Text to process',
    output: 'Processed text result',
    data: {
      type: 'textprocess',
      form: {
        role: 'developer',
        name: 'Text Process',
        description: 'Process and manipulate text strings',
        inputText: '{{textInput}}',
        operation: 'trim',
        inputRefs: [],
        output: '',
      },
    } as Partial<TextProcessNodeData>,
  },
  validate: {
    type: 'validate',
    icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
    color: {
      background: 'rgba(82, 196, 26, .1)',
      border: '#95de64',
      handle: '#52c41a',
    },
    input: 'Data to validate',
    output: 'Validation result (true/false)',
    data: {
      type: 'validate',
      form: {
        role: 'developer',
        name: 'Validate',
        description: 'Validate data format and constraints',
        inputData: '{{dataToValidate}}',
        validationType: 'email',
        required: true,
        inputRefs: [],
        output: '',
      },
    } as Partial<ValidateNodeData>,
  },
  math: {
    type: 'math',
    icon: <CalculatorOutlined style={{ color: '#fa8c16' }} />,
    color: {
      background: 'rgba(250, 140, 22, .1)',
      border: '#ffa940',
      handle: '#fa8c16',
    },
    input: 'Numbers for mathematical operations',
    output: 'Calculation result',
    data: {
      type: 'math',
      form: {
        role: 'developer',
        name: 'Math',
        description: 'Perform mathematical calculations',
        operation: 'add',
        value1: '{{number1}}',
        value2: '{{number2}}',
        precision: 2,
        inputRefs: [],
        output: '',
      },
    } as Partial<MathNodeData>,
  },
  datetime: {
    type: 'datetime',
    icon: <FieldTimeOutlined style={{ color: '#722ed1' }} />,
    color: {
      background: 'rgba(114, 46, 209, .1)',
      border: '#b37feb',
      handle: '#722ed1',
    },
    input: 'Date/time data to process',
    output: 'Processed date/time result',
    data: {
      type: 'datetime',
      form: {
        role: 'developer',
        name: 'Date Time',
        description: 'Process and manipulate dates and times',
        operation: 'now',
        format: 'YYYY-MM-DD HH:mm:ss',
        inputRefs: [],
        output: '',
      },
    } as Partial<DateTimeNodeData>,
  },
  condition: {
    type: 'condition',
    icon: <ConditionOutlined style={{ color: '#1890ff' }} />,
    color: {
      background: 'rgba(24, 144, 255, .1)',
      border: '#69c0ff',
      handle: '#1890ff',
    },
    input: 'Values to compare',
    output: 'Conditional result based on comparison',
    data: {
      type: 'condition',
      form: {
        role: 'developer',
        name: 'Condition',
        description: 'Compare values and return result based on condition',
        leftValue: '{{value1}}',
        operator: 'equals',
        rightValue: '{{value2}}',
        trueValue: 'Success',
        falseValue: 'Failed',
        dataType: 'string',
        inputRefs: [],
        output: '',
      },
    } as Partial<ConditionNodeData>,
  },
  mattermost: {
    type: 'mattermost',
    icon: <MessageOutlined style={{ color: '#0072C6' }} />,
    color: {
      background: 'rgba(0, 114, 198, .1)',
      border: '#0072C6',
      handle: '#0072C6',
    },
    input: 'Message content and channel information',
    output: 'Mattermost operation result',
    data: {
      type: 'mattermost',
      form: {
        role: 'developer',
        name: 'Mattermost',
        description: 'Interact with Mattermost for team communication',
        action: 'send_message',
        serverUrl: 'https://your-mattermost.com',
        accessToken: '',
        message: '{{messageContent}}',
        inputRefs: [],
        output: '',
      },
    } as Partial<MattermostNodeData>,
  },
  slack: {
    type: 'slack',
    icon: <SlackOutlined style={{ color: '#4A154B' }} />,
    color: {
      background: 'rgba(74, 21, 75, .1)',
      border: '#4A154B',
      handle: '#4A154B',
    },
    input: 'Message content and channel information',
    output: 'Slack operation result',
    data: {
      type: 'slack',
      form: {
        role: 'developer',
        name: 'Slack',
        description: 'Interact with Slack for team communication',
        action: 'send_message',
        botToken: '',
        message: '{{messageContent}}',
        inputRefs: [],
        output: '',
      },
    } as Partial<SlackNodeData>,
  },
  jira: {
    type: 'jira',
    icon: <BugOutlined style={{ color: '#0052CC' }} />,
    color: {
      background: 'rgba(0, 82, 204, .1)',
      border: '#0052CC',
      handle: '#0052CC',
    },
    input: 'Issue details and project information',
    output: 'Jira operation result',
    data: {
      type: 'jira',
      form: {
        role: 'developer',
        name: 'Jira',
        description: 'Interact with Jira for issue management',
        action: 'create_issue',
        serverUrl: 'https://your-domain.atlassian.net',
        username: '',
        apiToken: '',
        summary: '{{issueTitle}}',
        inputRefs: [],
        output: '',
      },
    } as Partial<JiraNodeData>,
  },
  gitlab: {
    type: 'gitlab',
    icon: <GitlabOutlined style={{ color: '#FC6D26' }} />,
    color: {
      background: 'rgba(252, 109, 38, .1)',
      border: '#FC6D26',
      handle: '#FC6D26',
    },
    input: 'Project details and operation data',
    output: 'GitLab operation result',
    data: {
      type: 'gitlab',
      form: {
        role: 'developer',
        name: 'GitLab',
        description: 'Interact with GitLab for project management',
        action: 'create_issue',
        serverUrl: 'https://gitlab.com',
        accessToken: '',
        title: '{{issueTitle}}',
        inputRefs: [],
        output: '',
      },
    } as Partial<GitLabNodeData>,
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
export function getNodeInputInfo(nodeType: NodeTypeString) {
  return NODE_REGISTRY[nodeType]?.input ?? undefined;
}
