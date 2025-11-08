import { BaseApiExecutor } from '@n2flowjs/node-plugin/base-api-executor';
import { ExecutionContext } from '@n2flowjs/node-plugin/base-executor';
import { GoogleSearchForm } from './types';

export class GoogleSearchExecutor extends BaseApiExecutor<GoogleSearchForm> {
  constructor() {
    super({
      nodeType: 'googlesearch',
      checkInputReadiness: true,
      templateFields: ['query'],
    });
  }

  protected async executeLogic(form: GoogleSearchForm, context: ExecutionContext): Promise<string> {
    const { query, maxResults = 10, safeSearch, language, country, apiKey, searchEngineId, useSystemConfig } = form;

    if (!query || query.trim() === '') {
      throw new Error('No search query specified');
    }

    const processedQuery = this.processTemplate(query, context);

    // Get API configuration
    let finalApiKey: string;
    let finalSearchEngineId: string;

    if (useSystemConfig) {
      finalApiKey = process.env.GOOGLE_SEARCH_API_KEY || '';
      finalSearchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID || '';
    } else {
      finalApiKey = apiKey || '';
      finalSearchEngineId = searchEngineId || '';
    }

    if (!finalApiKey || !finalSearchEngineId) {
      throw new Error('Google Search API key and Search Engine ID are required');
    }

    // Build search URL
    const searchUrl = new URL('https://www.googleapis.com/customsearch/v1');
    searchUrl.searchParams.append('key', finalApiKey);
    searchUrl.searchParams.append('cx', finalSearchEngineId);
    searchUrl.searchParams.append('q', processedQuery);
    searchUrl.searchParams.append('num', Math.min(maxResults, 10).toString());

    if (safeSearch) {
      searchUrl.searchParams.append('safe', safeSearch);
    }
    if (language) {
      searchUrl.searchParams.append('lr', `lang_${language}`);
    }
    if (country) {
      searchUrl.searchParams.append('gl', country);
    }

    // Execute search
    const response = await this.makeHttpRequest(searchUrl.toString());

    // Format results
    const results = response.items || [];
    const formattedResults = results.map((item: any, index: number) => ({
      position: index + 1,
      title: item.title || '',
      description: item.snippet || '',
      url: item.link || '',
      displayLink: item.displayLink || ''
    }));

    const resultText = formattedResults.length > 0
      ? formattedResults.map((result: any) =>
          `[${result.position}] ${result.title}\n${result.description}\nURL: ${result.url}\n`
        ).join('\n')
      : 'No search results found.';

    return resultText;
  }
}