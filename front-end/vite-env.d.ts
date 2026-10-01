/// <reference types="vite/client" />

import type { PendingConnection } from './types/editor';

declare global {
  interface Window {
    /** Connection handle captured on drag start, consumed when a node is added from the pane. */
    __lastConnectionStart: PendingConnection | null;
  }
}

interface ImportMetaEnv {
  readonly VITE_RUNTIME_URL: string;
  readonly VITE_API_BASE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
