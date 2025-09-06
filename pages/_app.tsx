import React, { useEffect } from "react";
import "@ant-design/v5-patch-for-react-19";
import { ConfigProvider } from "antd";
import { AppProps } from "next/app";
import { AuthProvider } from "../context/AuthContext";
import { LocaleProvider, useLocale } from "../locale";
import { ThemeProvider } from "../theme";
import '../style/globals.css'

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
    const cfg = (window as any).__NFLOW_NODE_PLUGIN_CONFIG__ || {};
    const compMap = ((window as any).__NFLOW_NODE_COMPONENTS__ ||= {});
    const formMap = ((window as any).__NFLOW_NODE_FORMS__ ||= {});
    const normalizeKey = (pkg: string) => (pkg || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

    const preload = async () => {
      const pkgs = Object.keys(cfg).filter(k => cfg[k]?.enabled !== false);
      await Promise.all(pkgs.map(async (pkg) => {
        // Preload node component
        try {
          const mod: any = await import(/* webpackMode: "lazy" */ `../packages/${pkg}/node`);
          const comp = mod.default || Object.values(mod)[0];
          if (comp) compMap[normalizeKey(pkg)] = comp;
        } catch { /* ignore */ }
        // Preload form component (if exists)
        try {
          const modForm: any = await import(/* webpackMode: "lazy" */ `../packages/${pkg}/form`);
          const formComp = modForm.default || Object.values(modForm)[0];
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
