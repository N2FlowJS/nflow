/**
 * @type {import('next').NextConfig}
 */ const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  turbopack: {},
  devIndicators: {
    position: 'bottom-left',
  },
  output: 'standalone',
  experimental: {
    webpackBuildWorker: true,
    serverActions: {
      allowedOrigins: ['*'],
      bodySizeLimit: '50mb',
    },
  },

  // Add environment variables for Nbase integration
  env: {
    // These will be accessible on the client side as well
    NBASE_ENABLED: process.env.VECTOR_DB_TYPE === 'nbase' ? 'true' : 'false',
    NBASE_URL: process.env.NBASE_URL || 'http://localhost:1307',
    VECTOR_DB_TYPE: process.env.VECTOR_DB_TYPE,
    OPENAI_BASE_URL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    EMBEDDING_MODEL: process.env.EMBEDDING_MODEL || 'text-embedding-ada-002',
    PORT: process.env.PORT || 1407,
  },
};

module.exports = nextConfig;
