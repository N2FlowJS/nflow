import React from "react";
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
