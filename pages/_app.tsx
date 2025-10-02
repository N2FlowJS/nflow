import React, { useEffect } from "react";
import "@ant-design/v5-patch-for-react-19";
import { ConfigProvider } from "antd";
import { AppProps } from "next/app";
import { AuthProvider } from "../context/AuthContext";
import { LocaleProvider, useLocale } from "../locale";
import { ThemeProvider } from "../theme";
import '../style/globals.css'
import { normalizeKey } from '../utils/normalizeKey';

if (typeof window === "undefined") {
  import("../lib/worker-init").then((module) => {
    module.initializeWorker().catch((error: unknown) => {
      console.error("Worker initialization error:", error);
    });
  });
}


function ConfigProviderWrapper({ children }: { children: React.ReactNode }) {
  const { antdLocale } = useLocale();
  return (
    <ConfigProvider locale={antdLocale}>
      {children}
    </ConfigProvider>
  );
}

function IFlowApp({ Component, pageProps }: AppProps) {
  // Client-only: pre-register discovered node components/forms based on injected plugin config
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const cfg = window.__NFLOW_NODE_PLUGIN_CONFIG__ || {};
    const compMap = (window.__NFLOW_NODE_COMPONENTS__ ||= {});
    const formMap = (window.__NFLOW_NODE_FORMS__ ||= {});
  // use shared normalizeKey

    const preload = async () => {
      const pkgs = Object.keys(cfg).filter(k => cfg[k]?.enabled !== false);
      await Promise.all(pkgs.map(async (pkg) => {
        // Preload node component
        try {
          const mod = await import(/* webpackMode: "lazy" */ `../packages/${pkg}/node`);
          const comp = (mod as { default?: React.ComponentType<unknown> }).default
            || (Object.values(mod)[0] as React.ComponentType<unknown> | undefined);
          if (comp) compMap[normalizeKey(pkg)] = comp;
        } catch { /* ignore */ }
        // Preload form component (if exists)
        try {
          const modForm = await import(/* webpackMode: "lazy" */ `../packages/${pkg}/form`);
          const formComp = (modForm as { default?: React.ComponentType<unknown> }).default
            || (Object.values(modForm)[0] as React.ComponentType<unknown> | undefined);
          if (formComp) formMap[normalizeKey(pkg)] = formComp;
        } catch { /* ignore */ }
      }));
    };
    preload();
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider>
        <LocaleProvider>
          <ConfigProviderWrapper>
            <Component {...pageProps} />
          </ConfigProviderWrapper>
        </LocaleProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default IFlowApp;
