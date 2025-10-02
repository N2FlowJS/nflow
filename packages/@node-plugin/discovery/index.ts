// Smart exports based on environment
// Server: use server-discover
// Browser: use ui-discover

export * from './ui-discover';

// Conditionally export server-side scanning if in Node environment
if (typeof process !== 'undefined' && process.versions?.node) {
  try {
    const serverDiscover = require('./server-discover');
    module.exports = {
      ...module.exports,
      ...serverDiscover,
    };
  } catch {
    // Server discover not available (browser build)
  }
}
