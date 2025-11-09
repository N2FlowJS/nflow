import { NodeTypeString } from '@n2flowjs/flow';

export const BING_SEARCH_TYPE: NodeTypeString = 'bing-search';

export const definition = JSON.stringify({
  type: BING_SEARCH_TYPE,
  icon: '🔍',
  input: 'query, apiKey, searchType, maxResults, safeSearch, language, country',
  output: 'results, count',
  data: {
    type: BING_SEARCH_TYPE,
    form: {
      name: 'Bing Search',
      description: 'Search web, images, news, videos using Bing Search API',
      code: `
const { query, apiKey, searchType = 'web', maxResults = 10, safeSearch = 'moderate', language = 'en', country = 'us' } = inputs;

if (!query || query.trim() === '') {
  throw new Error('Search query is empty');
}

const processedQuery = query; // Assume query is already processed

const finalApiKey = apiKey || process.env.BING_SEARCH_API_KEY;

if (!finalApiKey) {
  throw new Error('Bing Search API key is required');
}

const finalMaxResults = Math.min(maxResults, 50);

let endpoint = 'https://api.bing.microsoft.com/v7.0/search';

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
}

const params = new URLSearchParams({
  q: processedQuery,
  count: finalMaxResults.toString(),
  safeSearch: safeSearch,
  setLang: language,
  cc: country,
});

const response = await fetch(\`\${endpoint}?\${params.toString()}\`, {
  method: 'GET',
  headers: {
    'Ocp-Apim-Subscription-Key': finalApiKey,
    'Accept': 'application/json',
  },
});

if (!response.ok) {
  const errorData = await response.text();
  throw new Error(\`Bing Search API error (\${response.status}): \${errorData}\`);
}

const data = await response.json();

let results = [];

switch (searchType) {
  case 'web':
    results = (data.webPages?.value || []).map((item) => ({
      title: item.name,
      description: item.snippet,
      url: item.url,
      displayUrl: item.displayUrl,
    }));
    break;
  case 'images':
    results = (data.value || []).map((item) => ({
      title: item.name,
      url: item.contentUrl,
      thumbnailUrl: item.thumbnailUrl,
      width: item.width,
      height: item.height,
    }));
    break;
  case 'news':
    results = (data.value || []).map((item) => ({
      title: item.name,
      description: item.description,
      url: item.url,
      datePublished: item.datePublished,
      provider: item.provider?.[0]?.name,
    }));
    break;
  case 'videos':
    results = (data.value || []).map((item) => ({
      title: item.name,
      description: item.description,
      url: item.contentUrl,
      thumbnailUrl: item.thumbnailUrl,
      duration: item.duration,
    }));
    break;
}

const searchResults = {
  query: processedQuery,
  searchType,
  totalEstimatedMatches: data.webPages?.totalEstimatedMatches || data.totalEstimatedMatches || 0,
  results,
  timestamp: new Date().toISOString(),
};

outputs.results = searchResults;
outputs.count = results.length;
      `,
      inputPorts: [
        { name: 'query', type: 'string', required: true },
        { name: 'apiKey', type: 'string', required: false },
        { name: 'searchType', type: 'string', required: true },
        { name: 'maxResults', type: 'number', required: false },
        { name: 'safeSearch', type: 'string', required: false },
        { name: 'language', type: 'string', required: false },
        { name: 'country', type: 'string', required: false },
      ],
      outputPorts: [
        { name: 'results', type: 'json' },
        { name: 'count', type: 'number' },
      ],
    },
  },
});

export default JSON.parse(definition);
