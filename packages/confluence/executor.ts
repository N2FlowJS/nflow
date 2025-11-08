import { BaseApiExecutor } from '@n2flowjs/node-plugin/base-api-executor';
import { ExecutionContext } from '@n2flowjs/node-plugin/base-executor';
import { ConfluenceForm } from './types';

export class ConfluenceExecutor extends BaseApiExecutor<ConfluenceForm> {
  constructor() {
    super({
      nodeType: 'confluence',
      checkInputReadiness: true,
      templateFields: ['title', 'content', 'comment', 'searchQuery'],
    });
  }

  protected async executeLogic(form: ConfluenceForm, context: ExecutionContext): Promise<string> {
    const { action, serverUrl, username, apiToken, spaceKey, pageId, parentPageId, title, content, searchQuery, comment } = form;

    if (!serverUrl || !username || !apiToken) {
      throw new Error('Confluence server URL, username, and API token are required');
    }

    const auth = Buffer.from(`${username}:${apiToken}`).toString('base64');

    switch (action) {
      case 'create_page': {
        if (!spaceKey || !title || !content) {
          throw new Error('Space key, title, and content are required for creating pages');
        }
        const processedTitle = this.processTemplate(title, context);
        const processedContent = this.processTemplate(content, context);
        const result = await this.createConfluencePage(serverUrl, auth, { spaceKey, title: processedTitle, content: processedContent, parentPageId });
        return JSON.stringify(result, null, 2);
      }
      case 'update_page': {
        if (!pageId || !title || !content) {
          throw new Error('Page ID, title, and content are required for updating pages');
        }
        const processedTitle = this.processTemplate(title, context);
        const processedContent = this.processTemplate(content, context);
        const result = await this.updateConfluencePage(serverUrl, auth, pageId, { title: processedTitle, content: processedContent });
        return JSON.stringify(result, null, 2);
      }
      case 'get_page': {
        if (!pageId) {
          throw new Error('Page ID is required for getting pages');
        }
        const result = await this.getConfluencePage(serverUrl, auth, pageId);
        return JSON.stringify(result, null, 2);
      }
      case 'search_pages': {
        if (!searchQuery) {
          throw new Error('Search query is required for searching pages');
        }
        const processedQuery = this.processTemplate(searchQuery, context);
        const result = await this.searchConfluencePages(serverUrl, auth, processedQuery, spaceKey);
        return JSON.stringify(result, null, 2);
      }
      case 'add_comment': {
        if (!pageId || !comment) {
          throw new Error('Page ID and comment are required for adding comments');
        }
        const processedComment = this.processTemplate(comment, context);
        const result = await this.addConfluenceComment(serverUrl, auth, pageId, processedComment);
        return JSON.stringify(result, null, 2);
      }
      case 'get_spaces': {
        const result = await this.getConfluenceSpaces(serverUrl, auth);
        return JSON.stringify(result, null, 2);
      }
      default:
        throw new Error(`Unsupported Confluence action: ${action}`);
    }
  }

  private async createConfluencePage(serverUrl: string, auth: string, pageData: any) {
    const response = await this.makeHttpRequest(`${serverUrl}/wiki/rest/api/content`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'page',
        title: pageData.title,
        space: { key: pageData.spaceKey },
        body: { storage: { value: pageData.content, representation: 'storage' } },
        ...(pageData.parentPageId && { ancestors: [{ id: pageData.parentPageId }] }),
      }),
    });
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Confluence API error: ${response.status} ${errorData}`);
    }
    return await response.json();
  }

  private async updateConfluencePage(serverUrl: string, auth: string, pageId: string, updateData: any) {
    const currentPage = await this.getConfluencePage(serverUrl, auth, pageId);
    const response = await this.makeHttpRequest(`${serverUrl}/wiki/rest/api/content/${pageId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: { number: currentPage.version.number + 1 },
        title: updateData.title,
        type: 'page',
        body: { storage: { value: updateData.content, representation: 'storage' } },
      }),
    });
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Confluence API error: ${response.status} ${errorData}`);
    }
    return await response.json();
  }

  private async getConfluencePage(serverUrl: string, auth: string, pageId: string) {
    const response = await this.makeHttpRequest(`${serverUrl}/wiki/rest/api/content/${pageId}?expand=body.storage,version`, {
      headers: { 'Authorization': `Basic ${auth}` },
    });
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Confluence API error: ${response.status} ${errorData}`);
    }
    return await response.json();
  }

  private async searchConfluencePages(serverUrl: string, auth: string, query: string, _spaceKey?: string) {
    const searchParams = new URLSearchParams({ cql: query, limit: '50' });
    const response = await this.makeHttpRequest(`${serverUrl}/wiki/rest/api/content/search?${searchParams}`, {
      headers: { 'Authorization': `Basic ${auth}` },
    });
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Confluence API error: ${response.status} ${errorData}`);
    }
    return await response.json();
  }

  private async addConfluenceComment(serverUrl: string, auth: string, pageId: string, comment: string) {
    const response = await this.makeHttpRequest(`${serverUrl}/wiki/rest/api/content`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'comment',
        container: { id: pageId },
        body: { storage: { value: comment, representation: 'storage' } },
      }),
    });
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Confluence API error: ${response.status} ${errorData}`);
    }
    return await response.json();
  }

  private async getConfluenceSpaces(serverUrl: string, auth: string) {
    const response = await this.makeHttpRequest(`${serverUrl}/wiki/rest/api/space`, {
      headers: { 'Authorization': `Basic ${auth}` },
    });
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Confluence API error: ${response.status} ${errorData}`);
    }
    return await response.json();
  }
}
