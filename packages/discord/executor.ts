import { BaseApiExecutor } from '../@node-plugin/base-api-executor';
import { ExecutionContext } from '../@node-plugin/base-executor';
import { DiscordForm } from './types';

/**
 * Discord Executor
 * 
 * Integrates with Discord API for sending messages, managing channels, and more.
 */
export class DiscordExecutor extends BaseApiExecutor<DiscordForm> {
  private readonly DISCORD_API_BASE = 'https://discord.com/api/v10';

  constructor() {
    super({
      nodeType: 'discord',
      defaultRole: 'developer',
      checkInputReadiness: true,
      templateFields: ['message', 'embedTitle', 'embedDescription'],
    });
  }

  /**
   * Execute Discord operation logic
   */
  protected async executeLogic(
    form: DiscordForm,
    context: ExecutionContext
  ): Promise<string> {
    // Validate bot token
    if (!form.botToken) {
      throw new Error('Discord bot token is required');
    }

    console.log(`Executing Discord node with action: ${form.action}`);

    let result: any;

    switch (form.action) {
      case 'send_message':
        result = await this.sendMessage(form, context);
        break;

      case 'create_channel':
        result = await this.createChannel(form);
        break;

      case 'get_messages':
        result = await this.getMessages(form);
        break;

      case 'send_embed':
        result = await this.sendEmbed(form, context);
        break;

      case 'manage_roles':
        result = await this.manageRoles(form);
        break;

      case 'get_guild_info':
        result = await this.getGuildInfo(form);
        break;

      default:
        throw new Error(`Unsupported Discord action: ${form.action}`);
    }

    console.log(`Discord operation completed`);

    return JSON.stringify(result, null, 2);
  }

  /**
   * Send a message to a Discord channel
   */
  private async sendMessage(form: DiscordForm, context: ExecutionContext): Promise<any> {
    if (!form.message || !form.channelId) {
      throw new Error('Message and channel ID are required for sending messages');
    }

    const processedMessage = this.processTemplate(form.message, context);
    const url = `${this.DISCORD_API_BASE}/channels/${form.channelId}/messages`;

    return this.makeAuthenticatedJsonPostRequest(
      url,
      form.botToken,
      { content: processedMessage },
      { authPrefix: 'Bot' }
    );
  }

  /**
   * Create a Discord channel
   */
  private async createChannel(form: DiscordForm): Promise<any> {
    if (!form.guildId) {
      throw new Error('Guild ID is required for creating channels');
    }

    const url = `${this.DISCORD_API_BASE}/guilds/${form.guildId}/channels`;

    return this.makeAuthenticatedJsonPostRequest(
      url,
      form.botToken,
      {
        name: 'new-channel',
        type: 0, // Text channel
      },
      { authPrefix: 'Bot' }
    );
  }

  /**
   * Get messages from a Discord channel
   */
  private async getMessages(form: DiscordForm): Promise<any> {
    if (!form.channelId) {
      throw new Error('Channel ID is required for getting messages');
    }

    const url = `${this.DISCORD_API_BASE}/channels/${form.channelId}/messages?limit=50`;

    return this.makeAuthenticatedRequest(
      url,
      form.botToken,
      { authPrefix: 'Bot' }
    );
  }

  /**
   * Send an embed message
   */
  private async sendEmbed(form: DiscordForm, context: ExecutionContext): Promise<any> {
    if (!form.channelId || !form.embedTitle) {
      throw new Error('Channel ID and embed title are required for sending embeds');
    }

    const processedTitle = this.processTemplate(form.embedTitle, context);
    const processedDescription = form.embedDescription
      ? this.processTemplate(form.embedDescription, context)
      : '';

    const url = `${this.DISCORD_API_BASE}/channels/${form.channelId}/messages`;

    return this.makeAuthenticatedJsonPostRequest(
      url,
      form.botToken,
      {
        embeds: [
          {
            title: processedTitle,
            description: processedDescription,
            color: parseInt(form.embedColor?.replace('#', '') || '0099ff', 16),
            timestamp: new Date().toISOString(),
          },
        ],
      },
      { authPrefix: 'Bot' }
    );
  }

  /**
   * Manage user roles
   */
  private async manageRoles(form: DiscordForm): Promise<any> {
    if (!form.guildId || !form.userId || !form.roleId) {
      throw new Error('Guild ID, user ID, and role ID are required for managing roles');
    }

    const url = `${this.DISCORD_API_BASE}/guilds/${form.guildId}/members/${form.userId}/roles/${form.roleId}`;

    return this.makeAuthenticatedRequest(
      url,
      form.botToken,
      {
        method: 'PUT',
        authPrefix: 'Bot',
      }
    );
  }

  /**
   * Get guild information
   */
  private async getGuildInfo(form: DiscordForm): Promise<any> {
    if (!form.guildId) {
      throw new Error('Guild ID is required for getting guild info');
    }

    const url = `${this.DISCORD_API_BASE}/guilds/${form.guildId}`;

    return this.makeAuthenticatedRequest(
      url,
      form.botToken,
      { authPrefix: 'Bot' }
    );
  }
}

// Export singleton instance
export const discordExecutor = new DiscordExecutor();
