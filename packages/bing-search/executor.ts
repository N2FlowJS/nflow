import { BaseApiExecutor } from '@n2flowjs/node-plugin/base-api-executor';
import { ExecutionContext } from '@n2flowjs/node-plugin/base-executor';
import { BingSearchForm } from './types';

export class BingSearchExecutor extends BaseApiExecutor<BingSearchForm> {
  constructor() {
    super({
      nodeType: 'bingsearch',
      checkInputReadiness: true,
      templateFields: ['query'],
    });
  }

  protected async executeLogic(form: BingSearchForm, context: ExecutionContext): Promise<string> {
    const { query, maxResults = 10, safeSearch = 'moderate', language = 'en', country = 'us', apiKey, useSystemConfig, searchType = 'web' } = form;

    if (!query || query.trim() === '') {
      throw new Error('Search query is empty after template processing');
    }

    const processedQuery = this.processTemplate(query, context);

    console.log(`Executing Bing Search with query: ${processedQuery}`);

    const finalApiKey = useSystemConfig ? process.env.BING_SEARCH_API_KEY : apiKey;

    if (!finalApiKey) {
      throw new Error('Bing Search API key is required. Set BING_SEARCH_API_KEY environment variable or provide in form.');
    }

    const finalMaxResults = Math.min(maxResults, 50); // Bing API limit

    let endpoint = 'https://api.bing.microsoft.com/v7.0/search';

    // Different endpoints for different search types
    switch (searchType) {
      case 'images':
        endpoint = 'https://api.bing.microsoft.com/v7.0/images/search';
        break;
      case 'news':
        endpoint = 'https://api.bing.microsoft.com/v7.0/news/search';
        break;
      case 'videos':
        endpoint = 'https://api.bing.microsoft.com/v7.0/videos/search';
        break;
      default:
        endpoint = 'https://api.bing.microsoft.com/v7.0/search';
    }

    const params = new URLSearchParams({
      q: processedQuery,
      count: finalMaxResults.toString(),
      safeSearch: safeSearch,
      setLang: language,
      cc: country,
    });

    const response = await this.makeHttpRequest(`${endpoint}?${params.toString()}`, {
      headers: {
        'Ocp-Apim-Subscription-Key': finalApiKey,
        'Accept': 'application/json',
      },
    });

    // Format results based on search type
    let results = [];

    switch (searchType) {
      case 'web':
        results = (response.webPages?.value || []).map((item: any) => ({
          title: item.name,
          description: item.snippet,
          url: item.url,
          displayUrl: item.displayUrl,
          dateLastCrawled: item.dateLastCrawled,
        }));
        break;
      case 'images':
        results = (response.value || []).map((item: any) => ({
          title: item.name,
          description: item.name,
          url: item.contentUrl,
          thumbnailUrl: item.thumbnailUrl,
          width: item.width,
          height: item.height,
        }));
        break;
      case 'news':
        results = (response.value || []).map((item: any) => ({
          title: item.name,
          description: item.description,
          url: item.url,
          datePublished: item.datePublished,
          provider: item.provider?.[0]?.name,
        }));
        break;
      case 'videos':
        results = (response.value || []).map((item: any) => ({
          title: item.name,
          description: item.description,
          url: item.contentUrl,
          thumbnailUrl: item.thumbnailUrl,
          duration: item.duration,
          viewCount: item.viewCount,
        }));
        break;
    }

    const searchResults = {
      query: processedQuery,
      searchType: searchType,
      totalEstimatedMatches: response.webPages?.totalEstimatedMatches || response.totalEstimatedMatches || 0,
      results: results,
      timestamp: new Date().toISOString(),
    };

    return JSON.stringify(searchResults, null, 2);
  }
}