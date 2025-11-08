import { BaseApiExecutor } from '@n2flowjs/node-plugin/base-api-executor';
import { ExecutionContext } from '@n2flowjs/node-plugin/base-executor';
import { DuckGoSearchForm } from './types';

export class DuckGoSearchExecutor extends BaseApiExecutor<DuckGoSearchForm> {
  constructor() {
    super({
      nodeType: 'duckgosearch',
      checkInputReadiness: true,
      templateFields: ['query'],
    });
  }

  protected async executeLogic(form: DuckGoSearchForm, context: ExecutionContext): Promise<string> {
    const { query, maxResults = 10, safeSearch = 'moderate', searchType = 'web', noHTML = false, noRedirect = false } = form;

    if (!query || query.trim() === '') {
      throw new Error('Search query is empty after template processing');
    }

    const processedQuery = this.processTemplate(query, context);

    console.log(`Executing DuckDuckGo Search with query: ${processedQuery}`);

    const finalMaxResults = Math.min(maxResults, 30); // DuckDuckGo Instant Answer API limit

    // DuckDuckGo Instant Answer API - free and doesn't require API key
    const params = new URLSearchParams({
      q: processedQuery,
      format: 'json',
      pretty: '1',
      no_html: noHTML ? '1' : '0',
      skip_disambig: '1',
      no_redirect: noRedirect ? '1' : '0',
      safe_search: this.getSafeSearchValue(safeSearch),
    });

    const response = await this.makeHttpRequest(`https://api.duckduckgo.com/?${params.toString()}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'NFlow-Search-Bot/1.0',
      },
    });

    // Format results - DuckDuckGo API returns different structure
    let results = [];

    // Abstract (main result)
    if (response.Abstract) {
      results.push({
        title: response.Heading || 'DuckDuckGo Result',
        description: response.Abstract,
        url: response.AbstractURL,
        source: response.AbstractSource,
        type: 'abstract',
      });
    }

    // Related topics
    if (response.RelatedTopics && Array.isArray(response.RelatedTopics)) {
      const relatedResults = response.RelatedTopics
        .filter((topic: any) => topic.Text && topic.FirstURL)
        .slice(0, finalMaxResults - results.length)
        .map((topic: any) => ({
          title: topic.Text.split(' - ')[0] || 'Related Topic',
          description: topic.Text,
          url: topic.FirstURL,
          source: 'DuckDuckGo',
          type: 'related',
        }));

      results = results.concat(relatedResults);
    }

    // Answer (if available)
    if (response.Answer) {
      results.unshift({
        title: 'Direct Answer',
        description: response.Answer,
        url: response.AnswerURL || '',
        source: 'DuckDuckGo Instant Answer',
        type: 'answer',
      });
    }

    // Definition (if available)
    if (response.Definition) {
      results.unshift({
        title: 'Definition',
        description: response.Definition,
        url: response.DefinitionURL || '',
        source: response.DefinitionSource || 'DuckDuckGo',
        type: 'definition',
      });
    }

    // Limit results to maxResults
    results = results.slice(0, finalMaxResults);

    const searchResults = {
      query: processedQuery,
      searchType: searchType,
      totalResults: results.length,
      results: results,
      timestamp: new Date().toISOString(),
      privacy_note: 'DuckDuckGo does not track users or store personal information',
    };

    return JSON.stringify(searchResults, null, 2);
  }

  private getSafeSearchValue(safeSearch: string): string {
    switch (safeSearch) {
      case 'strict':
        return '1';
      case 'off':
        return '-1';
      case 'moderate':
      default:
        return '0';
    }
  }
}