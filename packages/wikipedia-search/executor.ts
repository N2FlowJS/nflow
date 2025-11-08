import { BaseApiExecutor } from '@n2flowjs/node-plugin/base-api-executor';
import { ExecutionContext } from '@n2flowjs/node-plugin/base-executor';
import { WikipediaSearchForm } from './types';

export class WikipediaSearchExecutor extends BaseApiExecutor<WikipediaSearchForm> {
  constructor() {
    super({
      nodeType: 'wikipediasearch',
      checkInputReadiness: true,
      templateFields: ['query'],
    });
  }

  protected async executeLogic(form: WikipediaSearchForm, context: ExecutionContext): Promise<string> {
    const { query, maxResults = 5, language = 'en', summaryOnly = false } = form;

    if (!query || query.trim() === '') {
      throw new Error('No search query specified');
    }

    const processedQuery = this.processTemplate(query, context);
    const finalMaxResults = Math.min(maxResults, 20);

    console.log(`Executing Wikipedia search: ${processedQuery}`);

    let results: any[] = [];

    // First try direct page lookup
    try {
      const searchUrl = `https://${language}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(processedQuery)}`;
      const directResponse = await this.makeHttpRequest(searchUrl);

      if (directResponse.type === 'standard') {
        results.push({
          title: directResponse.title,
          description: directResponse.extract,
          url: directResponse.content_urls?.desktop?.page || `https://${language}.wikipedia.org/wiki/${encodeURIComponent(directResponse.title)}`,
          score: 1.0
        });
      }
    } catch (error) {
      console.log('Direct page lookup failed, trying search API');
    }

    // If no direct match, use search API
    if (results.length === 0) {
      const apiUrl = `https://${language}.wikipedia.org/w/api.php`;
      const searchParams = new URLSearchParams({
        action: 'query',
        format: 'json',
        list: 'search',
        srsearch: processedQuery,
        srlimit: finalMaxResults.toString(),
        origin: '*'
      });

      const searchResponse = await this.makeHttpRequest(`${apiUrl}?${searchParams}`);
      const searchResults = searchResponse.query?.search || [];

      // Get page summaries for search results
      for (const result of searchResults.slice(0, finalMaxResults)) {
        try {
          const summaryUrl = `https://${language}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(result.title)}`;
          const summaryResponse = await this.makeHttpRequest(summaryUrl);

          results.push({
            title: summaryResponse.title,
            description: summaryOnly ? summaryResponse.extract : summaryResponse.extract_html || summaryResponse.extract,
            url: summaryResponse.content_urls?.desktop?.page || `https://${language}.wikipedia.org/wiki/${encodeURIComponent(result.title)}`,
            score: 1.0
          });
        } catch (error) {
          console.log(`Failed to get summary for ${result.title}`);
        }
      }
    }

    // Format results
    const resultText = results.length > 0
      ? results.map((result: any, index: number) =>
          `[${index + 1}] ${result.title}\n${result.description}\nURL: ${result.url}\n`
        ).join('\n')
      : 'No Wikipedia articles found.';

    console.log(`Wikipedia search completed: ${results.length} articles found`);

    return resultText;
  }
}