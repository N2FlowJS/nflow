/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_RUNTIME_URL: string;
  readonly VITE_API_BASE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
