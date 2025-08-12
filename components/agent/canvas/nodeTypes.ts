import { NodeTypes as ReactFlowNodeTypes } from '@xyflow/react';

import BeginNode from '../nodes/begin-node';
import InterfaceNode from '../nodes/interface-node';
import GenerateNode from '../nodes/generate-node';
import CategorizeNode from '../nodes/categorize-node';
import RetrievalNode from '../nodes/retrieval-node';
import DecisionNode from '../nodes/decision-node';
import KeywordsNode from '../nodes/keywords-node';
import ExecMysqlNode from '../nodes/execmysql-node';
import ExecMssqlNode from '../nodes/execmssql-node';
import ExecPostgresNode from '../nodes/execpostgres-node';
import SubAgentNode from '../nodes/subagent-node';
import SendMailNode from '../nodes/sendmail-node';
import GoogleSearchNode from '../nodes/googlesearch-node';
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
import FileWriteNode from '../nodes/filewrite-node';
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
import TwitterNode from '../nodes/twitter-node';
import InstagramNode from '../nodes/instagram-node';
import LinkedInNode from '../nodes/linkedin-node';
import YouTubeNode from '../nodes/youtube-node';
import TikTokNode from '../nodes/tiktok-node';
import DiscordNode from '../nodes/discord-node';
import TelegramNode from '../nodes/telegram-node';
import WhatsAppNode from '../nodes/whatsapp-node';
import WeatherNode from '../nodes/weather-node';
import DateTimeNode from '../nodes/datetime-node';
import MathNode from '../nodes/math-node';
import DisplayNode from '../nodes/display-node';
import LoopNode from '../nodes/loop-node';
import VariableNode from '../nodes/variable-node';
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
import ExcelAnalysisNode from '../nodes/excel-analysis-node';
import WeChatNode from '../nodes/wechat-node';
import AgentNode from '../nodes/agent-node';
import LocalKeywordsNode from '../nodes/nativekeywords-node';

export const nodeTypes: ReactFlowNodeTypes = {
  begin: BeginNode,
  interface: InterfaceNode,
  generate: GenerateNode,
  categorize: CategorizeNode,
  retrieval: RetrievalNode,
  decision: DecisionNode,
  keywords: KeywordsNode,
  nativekeywords: LocalKeywordsNode,
  execmysql: ExecMysqlNode,
  execmssql: ExecMssqlNode,
  execpostgres: ExecPostgresNode,
  subagent: SubAgentNode,
  sendmail: SendMailNode,
  googlesearch: GoogleSearchNode,
  bingsearch: BingSearchNode,
  duckgosearch: DuckGoSearchNode,
  wikipediasearch: WikipediaSearchNode,
  rewrite: RewriteNode,
  httprequest: HttpRequestNode,
  validate: ValidateNode,
  condition: ConditionNode,
  textprocess: TextProcessNode,
  transform: TransformNode,
  fileread: FileReadNode,
  filewrite: FileWriteNode,
  delay: DelayNode,
  jsonparse: JsonParseNode,
  mattermost: MattermostNode,
  slack: SlackNode,
  jira: JiraNode,
  gitlab: GitLabNode,
  confluence: ConfluenceNode,
  github: GitHubNode,
  facebook: FacebookNode,
  googlemap: GoogleMapNode,
  twitter: TwitterNode,
  instagram: InstagramNode,
  linkedin: LinkedInNode,
  youtube: YouTubeNode,
  tiktok: TikTokNode,
  discord: DiscordNode,
  telegram: TelegramNode,
  whatsapp: WhatsAppNode,
  weather: WeatherNode,
  datetime: DateTimeNode,
  math: MathNode,
  display: DisplayNode,
  loop: LoopNode,
  variable: VariableNode,
  code: CodeNode,
  template: TemplateNode,
  counter: CounterNode,
  cache: CacheNode,
  log: LogNode,
  fileanalysis: FileAnalysisNode,
  csvanalysis: CsvAnalysisNode,
  imageanalysis: ImageAnalysisNode,
  pdfanalysis: PdfAnalysisNode,
  loganalysis: LogAnalysisNode,
  excelanalysis: ExcelAnalysisNode,
  wechat: WeChatNode,
  agent: AgentNode,
};
