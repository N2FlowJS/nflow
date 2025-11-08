import { BaseApiExecutor } from '@n2flowjs/node-plugin/base-api-executor';
import { ExecutionContext } from '@n2flowjs/node-plugin/base-executor';
import { LinkedInForm } from './types';

export class LinkedInExecutor extends BaseApiExecutor<LinkedInForm> {
  constructor() {
    super({
      nodeType: 'linkedin',
      checkInputReadiness: true,
      templateFields: ['postText', 'articleTitle', 'articleContent'],
    });
  }

  protected async executeLogic(form: LinkedInForm, context: ExecutionContext): Promise<string> {
    const { action } = form;

    switch (action) {
      case 'create_post':
        return await this.createPost(form, context);
      case 'get_profile':
        return await this.getProfile(form, context);
      case 'get_company_info':
        return await this.getCompanyInfo(form, context);
      case 'create_article':
        return await this.createArticle(form, context);
      case 'get_connections':
        return await this.getConnections(form, context);
      default:
        throw new Error(`Unsupported LinkedIn action: ${action}`);
    }
  }

  private async createPost(form: LinkedInForm, context: ExecutionContext): Promise<string> {
    const { postText, personId, visibility = 'PUBLIC' } = form;

    if (!postText) {
      throw new Error('Post text is required for creating posts');
    }

    const processedText = this.processTemplate(postText, context);

    const payload = {
      author: `urn:li:person:${personId || '~'}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: processedText
          },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': visibility.toUpperCase()
      }
    };

    const result = await this.makeAuthenticatedJsonPostRequest(
      'https://api.linkedin.com/v2/ugcPosts',
      form.accessToken,
      payload,
      {
        headers: {
          'X-Restli-Protocol-Version': '2.0.0',
        },
      }
    );

    return JSON.stringify(result, null, 2);
  }

  private async getProfile(form: LinkedInForm, _context: ExecutionContext): Promise<string> {
    const { personId } = form;
    const profileId = personId || '~';

    const result = await this.makeAuthenticatedRequest(
      `https://api.linkedin.com/v2/people/(id:${profileId})`,
      form.accessToken
    );

    return JSON.stringify(result, null, 2);
  }

  private async getCompanyInfo(form: LinkedInForm, _context: ExecutionContext): Promise<string> {
    const { companyId } = form;

    if (!companyId) {
      throw new Error('Company ID is required for getting company info');
    }

    const result = await this.makeAuthenticatedRequest(
      `https://api.linkedin.com/v2/organizations/${companyId}`,
      form.accessToken
    );

    return JSON.stringify(result, null, 2);
  }

  private async createArticle(form: LinkedInForm, context: ExecutionContext): Promise<string> {
    const { articleTitle, articleContent, personId } = form;

    if (!articleTitle || !articleContent) {
      throw new Error('Article title and content are required for creating articles');
    }

    const processedTitle = this.processTemplate(articleTitle, context);
    const processedContent = this.processTemplate(articleContent, context);

    const payload = {
      author: `urn:li:person:${personId || '~'}`,
      title: processedTitle,
      content: {
        contentEntities: [{
          entity: 'urn:li:article',
          textDirection: 'USER_LOCALE',
          text: processedContent
        }]
      },
      publishedAt: new Date().getTime()
    };

    const result = await this.makeAuthenticatedJsonPostRequest(
      'https://api.linkedin.com/v2/articles',
      form.accessToken,
      payload,
      {
        headers: {
          'X-Restli-Protocol-Version': '2.0.0',
        },
      }
    );

    return JSON.stringify(result, null, 2);
  }

  private async getConnections(form: LinkedInForm, _context: ExecutionContext): Promise<string> {
    const result = await this.makeAuthenticatedRequest(
      'https://api.linkedin.com/v2/connections?q=viewer',
      form.accessToken
    );

    return JSON.stringify(result, null, 2);
  }
}