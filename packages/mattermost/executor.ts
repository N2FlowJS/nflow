import { BaseNodeExecutor, ExecutionContext } from '../@node-plugin/base-executor';
import { MattermostForm } from './types';

async function sendMattermostMessage(apiUrl: string, accessToken: string, channelId: string, message: string) {
  const response = await fetch(`${apiUrl}/posts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      channel_id: channelId,
      message: message,
    }),
  });
  if (!response.ok) {
    throw new Error(`Mattermost API error: ${response.status} ${response.statusText}`);
  }
  return await response.json();
}

async function createMattermostChannel(apiUrl: string, accessToken: string, teamId: string, channelName: string) {
  const response = await fetch(`${apiUrl}/channels`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      team_id: teamId,
      name: channelName.toLowerCase().replace(/\s+/g, '-'),
      display_name: channelName,
      type: 'O',
    }),
  });
  if (!response.ok) {
    throw new Error(`Mattermost API error: ${response.status} ${response.statusText}`);
  }
  return await response.json();
}

async function getMattermostChannels(apiUrl: string, accessToken: string, teamId: string) {
  const response = await fetch(`${apiUrl}/teams/${teamId}/channels`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Mattermost API error: ${response.status} ${response.statusText}`);
  }
  return await response.json();
}

async function getMattermostUsers(apiUrl: string, accessToken: string) {
  const response = await fetch(`${apiUrl}/users`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Mattermost API error: ${response.status} ${response.statusText}`);
  }
  return await response.json();
}

export class MattermostExecutor extends BaseNodeExecutor<MattermostForm> {
  constructor() {
    super({
      nodeType: 'mattermost',
      defaultRole: 'developer',
      checkInputReadiness: true,
      templateFields: ['message', 'channelName', 'username'],
    });
  }

  protected async executeLogic(form: MattermostForm, context: ExecutionContext): Promise<any> {
    const apiUrl = `${form.serverUrl.replace(/\/$/, '')}/api/v4`;
    const accessToken = form.accessToken;
    let result: any;
    switch (form.action) {
      case 'send_message':
        if (!form.channelId) throw new Error('Channel ID is required for sending messages');
        if (!form.message) throw new Error('Message content is required');
        const processedMessage = this.processTemplate(form.message, context);
        result = await sendMattermostMessage(apiUrl, accessToken, form.channelId, processedMessage);
        break;
      case 'create_channel':
        if (!form.channelName || !form.teamId) throw new Error('Channel name and team ID are required for creating channels');
        const processedChannelName = this.processTemplate(form.channelName, context);
        result = await createMattermostChannel(apiUrl, accessToken, form.teamId, processedChannelName);
        break;
      case 'get_channels':
        if (!form.teamId) throw new Error('Team ID is required for getting channels');
        result = await getMattermostChannels(apiUrl, accessToken, form.teamId);
        break;
      case 'get_users':
        result = await getMattermostUsers(apiUrl, accessToken);
        break;
      default:
        throw new Error(`Unsupported Mattermost action: ${form.action}`);
    }
    return result;
  }
}

export default MattermostExecutor;
