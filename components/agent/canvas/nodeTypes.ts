import { NodeTypes as ReactFlowNodeTypes } from '@xyflow/react';
import { getDiscoveredNodeComponents } from '../../../packages/@node-plugin/discovery/ui-discover';

// Internal (non-package) node components
import InterfaceNode from '../nodes/interface-node';
import GenerateNode from '../nodes/generate-node';
import RetrievalNode from '../nodes/retrieval-node';
import DecisionNode from '../nodes/decision-node';
import KeywordsNode from '../nodes/keywords-node';
import LocalKeywordsNode from '../nodes/nativekeywords-node';
import ExecMysqlNode from '../nodes/execmysql-node';
import ExecMssqlNode from '../nodes/execmssql-node';
import ExecPostgresNode from '../nodes/execpostgres-node';
import SubAgentNode from '../nodes/subagent-node';
import SendMailNode from '../nodes/sendmail-node';
import GoogleSearchNode from '../../../packages/google-search/node';
import BingSearchNode from '../nodes/bingsearch-node';
import DuckGoSearchNode from '../nodes/duckgosearch-node';
import WikipediaSearchNode from '../nodes/wikipediasearch-node';
import RewriteNode from '../nodes/rewrite-node';
import HttpRequestNode from '../nodes/httprequest-node';
import ValidateNode from '../nodes/validate-node';
import ConditionNode from '../nodes/condition-node';
import TextProcessNode from '../nodes/textprocess-node';
import TransformNode from '../nodes/transform-node';
import FileReadNode from '../nodes/fileread-node';
import DelayNode from '../nodes/delay-node';
import JsonParseNode from '../nodes/jsonparse-node';
import MattermostNode from '../nodes/mattermost-node';
import SlackNode from '../nodes/slack-node';
import JiraNode from '../nodes/jira-node';
import GitLabNode from '../nodes/gitlab-node';
import ConfluenceNode from '../nodes/confluence-node';
import GitHubNode from '../nodes/github-node';
import FacebookNode from '../nodes/facebook-node';
import GoogleMapNode from '../nodes/googlemap-node';
import InstagramNode from '../nodes/instagram-node';
import LinkedInNode from '../nodes/linkedin-node';
import DiscordNode from '../nodes/discord-node';
import TelegramNode from '../nodes/telegram-node';
import DateTimeNode from '../nodes/datetime-node';
import MathNode from '../nodes/math-node';
import DisplayNode from '../nodes/display-node';
import LoopNode from '../nodes/loop-node';
import CodeNode from '../nodes/code-node';
import TemplateNode from '../nodes/template-node';
import CounterNode from '../nodes/counter-node';
import CacheNode from '../nodes/cache-node';
import LogNode from '../nodes/log-node';
import FileAnalysisNode from '../nodes/file-analysis-node';
import CsvAnalysisNode from '../nodes/csv-analysis-node';
import ImageAnalysisNode from '../nodes/image-analysis-node';
import PdfAnalysisNode from '../nodes/pdf-analysis-node';
import LogAnalysisNode from '../nodes/log-analysis-node';
import AgentNode from '../../../packages/agent/node';
import AgentToolsNode from '../nodes/agenttools-node';

// No direct package node imports; discovered dynamically on server, injected on client.

function loadDiscovered(): Record<string, any> {
  if (typeof window !== 'undefined') return (window as any).__NFLOW_NODE_COMPONENTS__ || {};
  return getDiscoveredNodeComponents();
}

// Internal nodes (always enabled, not governed by plugin config)
const INTERNAL_COMPONENTS: Array<{ name: string; component: any }> = [
  { name: 'interface', component: InterfaceNode },
  { name: 'generate', component: GenerateNode },
  { name: 'retrieval', component: RetrievalNode },
  { name: 'decision', component: DecisionNode },
  { name: 'keywords', component: KeywordsNode },
  { name: 'nativekeywords', component: LocalKeywordsNode },
  { name: 'execmysql', component: ExecMysqlNode },
  { name: 'execmssql', component: ExecMssqlNode },
  { name: 'execpostgres', component: ExecPostgresNode },
  { name: 'subagent', component: SubAgentNode },
  { name: 'sendmail', component: SendMailNode },
  { name: 'googlesearch', component: GoogleSearchNode },
  { name: 'bingsearch', component: BingSearchNode },
  { name: 'duckgosearch', component: DuckGoSearchNode },
  { name: 'wikipediasearch', component: WikipediaSearchNode },
  { name: 'rewrite', component: RewriteNode },
  { name: 'httprequest', component: HttpRequestNode },
  { name: 'validate', component: ValidateNode },
  { name: 'condition', component: ConditionNode },
  { name: 'textprocess', component: TextProcessNode },
  { name: 'transform', component: TransformNode },
  { name: 'fileread', component: FileReadNode },
  { name: 'delay', component: DelayNode },
  { name: 'jsonparse', component: JsonParseNode },
  { name: 'mattermost', component: MattermostNode },
  { name: 'slack', component: SlackNode },
  { name: 'jira', component: JiraNode },
  { name: 'gitlab', component: GitLabNode },
  { name: 'confluence', component: ConfluenceNode },
  { name: 'github', component: GitHubNode },
  { name: 'facebook', component: FacebookNode },
  { name: 'googlemap', component: GoogleMapNode },
  { name: 'instagram', component: InstagramNode },
  { name: 'linkedin', component: LinkedInNode },
  { name: 'discord', component: DiscordNode },
  { name: 'telegram', component: TelegramNode },
  { name: 'datetime', component: DateTimeNode },
  { name: 'math', component: MathNode },
  { name: 'display', component: DisplayNode },
  { name: 'loop', component: LoopNode },
  { name: 'code', component: CodeNode },
  { name: 'template', component: TemplateNode },
  { name: 'counter', component: CounterNode },
  { name: 'cache', component: CacheNode },
  { name: 'log', component: LogNode },
  { name: 'fileanalysis', component: FileAnalysisNode },
  { name: 'csvanalysis', component: CsvAnalysisNode },
  { name: 'imageanalysis', component: ImageAnalysisNode },
  { name: 'pdfanalysis', component: PdfAnalysisNode },
  { name: 'loganalysis', component: LogAnalysisNode },
  { name: 'agent', component: AgentNode },
  { name: 'agenttools', component: AgentToolsNode },
];

const INTERNAL_MAP: ReactFlowNodeTypes = INTERNAL_COMPONENTS.reduce((m, c) => { (m as any)[c.name] = c.component; return m; }, {} as ReactFlowNodeTypes);
let CACHE: ReactFlowNodeTypes | null = null;
export function getNodeTypes(): ReactFlowNodeTypes {
  if (CACHE) return CACHE;
  const discovered = loadDiscovered();
  CACHE = { ...discovered, ...INTERNAL_MAP };
  return CACHE;
}
export function reloadNodeTypes() { CACHE = null; return getNodeTypes(); }
export const nodeTypes = getNodeTypes();
