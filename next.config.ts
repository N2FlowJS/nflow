import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  compiler: {
    styledComponents: true,
  },
  turbopack:{},
  reactStrictMode: true,
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx', 'css'],
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
    NBASE_URL: process.env.NBASE_URL || 'http://localhost:1307',
    VECTOR_DB_TYPE: process.env.VECTOR_DB_TYPE,
  },
};

export default nextConfig;
