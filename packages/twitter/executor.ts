import { BaseApiExecutor } from '../@node-plugin/base-api-executor';
import { ExecutionContext } from '../@node-plugin/base-executor';
import { TwitterForm } from './types';

/**
 * Twitter Executor
 *
 * Integrates with Twitter API v2 for tweets, user management, and social interactions.
 */
export class TwitterExecutor extends BaseApiExecutor<TwitterForm> {
  private readonly API_BASE = 'https://api.twitter.com/2';

  constructor() {
    super({
      nodeType: 'twitter',
      defaultRole: 'developer',
      checkInputReadiness: true,
      templateFields: ['tweetText', 'query'],
    });
  }

  /**
   * Execute Twitter operation logic
   */
  protected async executeLogic(
    form: TwitterForm,
    context: ExecutionContext
  ): Promise<string> {
    // Validate API credentials
    if (!form.apiKey || !form.apiSecret || !form.accessToken || !form.accessTokenSecret) {
      throw new Error('Twitter API credentials are required');
    }

    console.log(`Executing Twitter node with action: ${form.action}`);

    let result: any;

    switch (form.action) {
      case 'create_tweet':
        result = await this.createTweet(form, context);
        break;

      case 'get_tweets':
        result = await this.getTweets(form);
        break;

      case 'get_user_info':
        result = await this.getUserInfo(form);
        break;

      case 'follow_user':
        result = await this.followUser(form);
        break;

      case 'like_tweet':
        result = await this.likeTweet(form);
        break;

      case 'retweet':
        result = await this.retweet(form);
        break;

      case 'get_mentions':
        result = await this.getMentions(form);
        break;

      default:
        throw new Error(`Unsupported Twitter action: ${form.action}`);
    }

    console.log(`Twitter operation completed`);

    return JSON.stringify(result, null, 2);
  }

  /**
   * Create a tweet
   */
  private async createTweet(form: TwitterForm, context: ExecutionContext): Promise<any> {
    if (!form.tweetText) {
      throw new Error('Tweet text is required for creating tweets');
    }

    const processedTweet = this.processTemplate(form.tweetText, context);
    const url = `${this.API_BASE}/tweets`;

    return this.makeAuthenticatedJsonPostRequest(
      url,
      form.accessToken,
      { text: processedTweet }
    );
  }

  /**
   * Get tweets from a user
   */
  private async getTweets(form: TwitterForm): Promise<any> {
    if (!form.username) {
      throw new Error('Username is required for getting tweets');
    }

    // First get user ID
    const userUrl = `${this.API_BASE}/users/by/username/${form.username}`;
    const userData = await this.makeAuthenticatedRequest(userUrl, form.accessToken);
    const userId = userData.data.id;

    // Then get tweets
    const tweetsUrl = `${this.API_BASE}/users/${userId}/tweets?max_results=${form.maxResults || 10}&tweet.fields=created_at,public_metrics`;

    return this.makeAuthenticatedRequest(tweetsUrl, form.accessToken);
  }

  /**
   * Get user information
   */
  private async getUserInfo(form: TwitterForm): Promise<any> {
    if (!form.username) {
      throw new Error('Username is required for getting user info');
    }

    const url = `${this.API_BASE}/users/by/username/${form.username}?user.fields=public_metrics,description,verified`;

    return this.makeAuthenticatedRequest(url, form.accessToken);
  }

  /**
   * Follow a user
   */
  private async followUser(form: TwitterForm): Promise<any> {
    if (!form.userId) {
      throw new Error('User ID is required for following users');
    }

    // Note: This requires the authenticated user's ID, which should be stored in form
    const authenticatedUserId = form.userId;
    const url = `${this.API_BASE}/users/${authenticatedUserId}/following`;

    return this.makeAuthenticatedJsonPostRequest(
      url,
      form.accessToken,
      { target_user_id: form.userId }
    );
  }

  /**
   * Like a tweet
   */
  private async likeTweet(form: TwitterForm): Promise<any> {
    if (!form.tweetId) {
      throw new Error('Tweet ID is required for liking tweets');
    }

    const authenticatedUserId = form.userId;
    const url = `${this.API_BASE}/users/${authenticatedUserId}/likes`;

    return this.makeAuthenticatedJsonPostRequest(
      url,
      form.accessToken,
      { tweet_id: form.tweetId }
    );
  }

  /**
   * Retweet a tweet
   */
  private async retweet(form: TwitterForm): Promise<any> {
    if (!form.tweetId) {
      throw new Error('Tweet ID is required for retweeting');
    }

    const authenticatedUserId = form.userId;
    const url = `${this.API_BASE}/users/${authenticatedUserId}/retweets`;

    return this.makeAuthenticatedJsonPostRequest(
      url,
      form.accessToken,
      { tweet_id: form.tweetId }
    );
  }

  /**
   * Get mentions for authenticated user
   */
  private async getMentions(form: TwitterForm): Promise<any> {
    const authenticatedUserId = form.userId;
    const url = `${this.API_BASE}/users/${authenticatedUserId}/mentions?max_results=${form.maxResults || 10}&tweet.fields=created_at,author_id,public_metrics`;

    return this.makeAuthenticatedRequest(url, form.accessToken);
  }
}

// Export singleton instance
export const twitterExecutor = new TwitterExecutor();
