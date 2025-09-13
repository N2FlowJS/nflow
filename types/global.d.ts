import type React from 'react';

export {};

declare global {
  interface Window {
    __NFLOW_NODE_PLUGIN_CONFIG__?: Record<string, { enabled?: boolean }>;
    __NFLOW_NODE_COMPONENTS__?: Record<string, React.ComponentType<unknown>>;
    __NFLOW_NODE_FORMS__?: Record<string, React.ComponentType<unknown>>;
  }
}
