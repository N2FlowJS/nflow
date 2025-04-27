/**
 * @type {import('next').NextConfig}
 */ const nextConfig = {

  reactStrictMode: true,
  turbopack: {
    resolveAlias: {
      underscore: 'lodash',
    },
    resolveExtensions: ['.mdx', '.tsx', '.ts', '.jsx', '.js', '.json'],
  },
  devIndicators: false,
  output: 'standalone',
  experimental: {
    turbopackMinify: false,
    webpackBuildWorker: true,
    serverActions: {
      allowedOrigins: ['*'],
      bodySizeLimit: '50mb',
    },
  },
  serverRuntimeConfig: {
    // Will only be available on the server side
    nodeModules: true,
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
    NBASE_DB_PATH: process.env.NBASE_DB_PATH,
  },

  // Configure external modules that need to be transpiled
  transpilePackages: [],
  // Use the new app directory
  serverExternalPackages: ['child_process', 'fs', 'path', 'os', 'events', 'util'],

  webpack: (config, { isServer, dev, buildId, webpack, totalPages, nextRuntime }) => {
    // Ignore test files
    config.module = {
      ...config.module,
      rules: [
        ...config.module.rules,
        {
          test: /\.(test|spec)\.(js|ts|tsx)$/,
          loader: 'ignore-loader',
        },
      ],
    };

    // Server-specific configuration
    if (isServer) {
      // No need to modify server config, Node.js modules are available server-side
    } else {
      // Client-specific configuration (fallbacks for browser)
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        child_process: false,
        net: false,
        tls: false,
        stream: false,
      };
    }

    return config;
  },
};

module.exports = nextConfig;
