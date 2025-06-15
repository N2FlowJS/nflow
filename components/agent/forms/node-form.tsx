import React from 'react';
import { FlowNode } from '../../../models/flowTypes';
import BeginNodeForm from './begin-node-form';
import InterfaceNodeForm from './Interface-node-form';
import GenerateNodeForm from './generate-node-form';
import CategorizeNodeForm from './categorize-node-form';
import RetrievalNodeForm from './retrieval-node-form';
import DecisionNodeForm from './decision-node-form';
import KeywordsNodeForm from './keywords-node-form';
import ExecMysqlNodeForm from './execmysql-node-form';
import ExecMssqlNodeForm from './execmssql-node-form';
import SubAgentNodeForm from './subagent-node-form';
import SendMailNodeForm from './sendmail-node-form';
import GoogleSearchNodeForm from './googlesearch-node-form';
import WikipediaSearchNodeForm from './wikipedia-search-node-form';
import RewriteNodeForm from './rewrite-node-form';
import HttpRequestNodeForm from './httprequest-node-form';
import TransformNodeForm from './transform-node-form';
import DelayNodeForm from './delay-node-form';
import ValidateNodeForm from './validate-node-form';
import ConditionNodeForm from './condition-node-form';
import TextProcessNodeForm from './textprocess-node-form';
import FileWriteNodeForm from './filewrite-node-form';
import FileReadNodeForm from './fileread-node-form';
import WebhookNodeForm from './webhook-node-form';
import JsonParseNodeForm from './jsonparse-node-form';
import MattermostNodeForm from './mattermost-node-form';
import SlackNodeForm from './slack-node-form';
import JiraNodeForm from './jira-node-form';
import GitLabNodeForm from './gitlab-node-form';
import ConfluenceNodeForm from './confluence-node-form';
import GitHubNodeForm from './github-node-form';
import FacebookNodeForm from './facebook-node-form';
import GoogleMapNodeForm from './googlemap-node-form';
import TwitterNodeForm from './twitter-node-form';
import InstagramNodeForm from './instagram-node-form';
import LinkedInNodeForm from './linkedin-node-form';
import YouTubeNodeForm from './youtube-node-form';
import TikTokNodeForm from './tiktok-node-form';
import DiscordNodeForm from './discord-node-form';
import TelegramNodeForm from './telegram-node-form';
import WhatsAppNodeForm from './whatsapp-node-form';

interface NodeFormProps {
  form: any;
  selectedNode: FlowNode | null;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const NodeForm: React.FC<NodeFormProps> = (props) => {
  const { selectedNode } = props;

  const renderForm = () => {
    if (!selectedNode) return null;

    const commonProps = {
      form: props.form,
      selectedNode,
      setIsDrawerOpen: props.setIsDrawerOpen,
    };

    switch (selectedNode.type) {
      case 'begin':
        return <BeginNodeForm {...commonProps} />;
      case 'interface':
        return <InterfaceNodeForm {...commonProps} />;
      case 'generate':
        return <GenerateNodeForm {...commonProps} />;
      case 'categorize':
        return <CategorizeNodeForm {...commonProps} />;
      case 'retrieval':
        return <RetrievalNodeForm {...commonProps} />;
      case 'decision':
        return <DecisionNodeForm {...commonProps} />;
      case 'keywords':
        return <KeywordsNodeForm {...commonProps} />;
      case 'execmysql':
        return <ExecMysqlNodeForm {...commonProps} />;
      case 'execmssql':
        return <ExecMssqlNodeForm {...commonProps} />;
      case 'subagent':
        return <SubAgentNodeForm {...commonProps} />;
      case 'sendmail':
        return <SendMailNodeForm {...commonProps} />;
      case 'googlesearch':
        return <GoogleSearchNodeForm {...commonProps} />;
      case 'wikipediasearch':
        return <WikipediaSearchNodeForm {...commonProps} />;
      case 'rewrite':
        return <RewriteNodeForm {...commonProps} />;
      case 'httprequest':
        return <HttpRequestNodeForm {...commonProps} />;
      case 'transform':
        return <TransformNodeForm {...commonProps} />;
      case 'delay':
        return <DelayNodeForm {...commonProps} />;
      case 'validate':
        return <ValidateNodeForm {...commonProps} />;
      case 'condition':
        return <ConditionNodeForm {...commonProps} />;
      case 'textprocess':
        return <TextProcessNodeForm {...commonProps} />;
      case 'fileread':
        return <FileReadNodeForm {...commonProps} />;
      case 'filewrite':
        return <FileWriteNodeForm {...commonProps} />;
      case 'webhook':
        return <WebhookNodeForm {...commonProps} />;
      case 'jsonparse':
        return <JsonParseNodeForm {...commonProps} />;
      case 'mattermost':
        return <MattermostNodeForm {...commonProps} />;
      case 'slack':
        return <SlackNodeForm {...commonProps} />;
      case 'jira':
        return <JiraNodeForm {...commonProps} />;
      case 'gitlab':
        return <GitLabNodeForm {...commonProps} />;
      case 'confluence':
        return <ConfluenceNodeForm {...commonProps} />;
      case 'github':
        return <GitHubNodeForm {...commonProps} />;
      case 'facebook':
        return <FacebookNodeForm {...commonProps} />;
      case 'googlemap':
        return <GoogleMapNodeForm {...commonProps} />;
      case 'twitter':
        return <TwitterNodeForm {...commonProps} />;
      case 'instagram':
        return <InstagramNodeForm {...commonProps} />;
      case 'linkedin':
        return <LinkedInNodeForm {...commonProps} />;
      case 'youtube':
        return <YouTubeNodeForm {...commonProps} />;
      case 'tiktok':
        return <TikTokNodeForm {...commonProps} />;
      case 'discord':
        return <DiscordNodeForm {...commonProps} />;
      case 'telegram':
        return <TelegramNodeForm {...commonProps} />;
      case 'whatsapp':
        return <WhatsAppNodeForm {...commonProps} />;
      default:
        return <div>Unsupported node type: {selectedNode.type}</div>;
    }
  };

  return <>{renderForm()}</>;
};

export default NodeForm;
