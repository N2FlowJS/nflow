// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.
// Run: npm run generate:flow-node-union
import { Node } from '@xyflow/react';
import type { AgentNodeData } from '../packages/agent/types';
import type { AgentToolsNodeData } from '../packages/agent-tools/types';
import type { BeginNodeData } from '../packages/begin/types';
import type { BingSearchNodeData } from '../packages/bing-search/types';
import type { CacheNodeData } from '../packages/cache/types';
import type { CategorizeNodeData } from '../packages/categorize/types';
import type { CodeNodeData } from '../packages/code/types';
import type { ConditionNodeData } from '../packages/condition/types';
import type { ConfluenceNodeData } from '../packages/confluence/types';
import type { CounterNodeData } from '../packages/counter/types';
import type { CsvAnalysisNodeData } from '../packages/csv-analysis/types';
import type { DateTimeNodeData } from '../packages/datetime/types';
import type { DecisionNodeData } from '../packages/decision/types';
import type { DelayNodeData } from '../packages/delay/types';
import type { DiscordNodeData } from '../packages/discord/types';
import type { DisplayNodeData } from '../packages/display/types';
import type { DuckGoSearchNodeData } from '../packages/duckgo-search/types';
import type { ExcelAnalysisNodeData } from '../packages/excel-analysis/types';
import type { ExecMssqlNodeData } from '../packages/exec-mssql/types';
import type { ExecMysqlNodeData } from '../packages/exec-mysql/types';
import type { ExecPostgresNodeData } from '../packages/exec-postgres/types';
import type { FacebookNodeData } from '../packages/facebook/types';
import type { FileAnalysisNodeData } from '../packages/file-analysis/types';
import type { FileReadNodeData } from '../packages/file-read/types';
import type { FileWriteNodeData } from '../packages/file-write/types';
import type { GenerateNodeData } from '../packages/generate/types';
import type { GitHubNodeData } from '../packages/github/types';
import type { GitLabNodeData } from '../packages/gitlab/types';
import type { GoogleMapNodeData } from '../packages/googlemap/types';
import type { GoogleSearchNodeData } from '../packages/google-search/types';
import type { HttpRequestNodeData } from '../packages/httprequest/types';
import type { ImageAnalysisNodeData } from '../packages/image-analysis/types';
import type { InstagramNodeData } from '../packages/instagram/types';
import type { InterfaceNodeData } from '../packages/interface/types';
import type { JiraNodeData } from '../packages/jira/types';
import type { JsonParseNodeData } from '../packages/jsonparse/types';
import type { KeywordsNodeData } from '../packages/keywords/types';
import type { LinkedInNodeData } from '../packages/linkedin/types';
import type { LogAnalysisNodeData } from '../packages/log-analysis/types';
import type { LogNodeData } from '../packages/log/types';
import type { LoopNodeData } from '../packages/loop/types';
import type { MathNodeData } from '../packages/math/types';
import type { MattermostNodeData } from '../packages/mattermost/types';
import type { NativeKeywordsNodeData } from '../packages/native-keywords/types';
import type { PdfAnalysisNodeData } from '../packages/pdf-analysis/types';
import type { RetrievalNodeData } from '../packages/retrieval/types';
import type { RewriteNodeData } from '../packages/rewrite/types';
import type { SendMailNodeData } from '../packages/sendmail/types';
import type { SlackNodeData } from '../packages/slack/types';
import type { SubAgentNodeData } from '../packages/subagent/types';
import type { TelegramNodeData } from '../packages/telegram/types';
import type { TemplateNodeData } from '../packages/template/types';
import type { TextProcessNodeData } from '../packages/text-process/types';
import type { TikTokNodeData } from '../packages/tiktok/types';
import type { TransformNodeData } from '../packages/transform/types';
import type { TwitterNodeData } from '../packages/twitter/types';
import type { ValidateNodeData } from '../packages/validate/types';
import type { VariableNodeData } from '../packages/variable/types';
import type { WeatherNodeData } from '../packages/weather/types';
import type { WebhookNodeData } from '../packages/webhook/types';
import type { WeChatNodeData } from '../packages/wechat/types';
import type { WhatsAppNodeData } from '../packages/whatsapp/types';
import type { WikipediaSearchNodeData } from '../packages/wikipedia-search/types';
import type { YouTubeNodeData } from '../packages/youtube/types';

export type AllNodeData =
  | AgentNodeData
  | AgentToolsNodeData
  | BeginNodeData
  | BingSearchNodeData
  | CacheNodeData
  | CategorizeNodeData
  | CodeNodeData
  | ConditionNodeData
  | ConfluenceNodeData
  | CounterNodeData
  | CsvAnalysisNodeData
  | DateTimeNodeData
  | DecisionNodeData
  | DelayNodeData
  | DiscordNodeData
  | DisplayNodeData
  | DuckGoSearchNodeData
  | ExcelAnalysisNodeData
  | ExecMssqlNodeData
  | ExecMysqlNodeData
  | ExecPostgresNodeData
  | FacebookNodeData
  | FileAnalysisNodeData
  | FileReadNodeData
  | FileWriteNodeData
  | GenerateNodeData
  | GitHubNodeData
  | GitLabNodeData
  | GoogleMapNodeData
  | GoogleSearchNodeData
  | HttpRequestNodeData
  | ImageAnalysisNodeData
  | InstagramNodeData
  | InterfaceNodeData
  | JiraNodeData
  | JsonParseNodeData
  | KeywordsNodeData
  | LinkedInNodeData
  | LogAnalysisNodeData
  | LogNodeData
  | LoopNodeData
  | MathNodeData
  | MattermostNodeData
  | NativeKeywordsNodeData
  | PdfAnalysisNodeData
  | RetrievalNodeData
  | RewriteNodeData
  | SendMailNodeData
  | SlackNodeData
  | SubAgentNodeData
  | TelegramNodeData
  | TemplateNodeData
  | TextProcessNodeData
  | TikTokNodeData
  | TransformNodeData
  | TwitterNodeData
  | ValidateNodeData
  | VariableNodeData
  | WeatherNodeData
  | WebhookNodeData
  | WeChatNodeData
  | WhatsAppNodeData
  | WikipediaSearchNodeData
  | YouTubeNodeData;

export type FlowNode = Node<AllNodeData>;
