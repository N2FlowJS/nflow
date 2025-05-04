import React from "react";
import "@ant-design/v5-patch-for-react-19";
import { ConfigProvider } from "antd";
import { AppProps } from "next/app";
import dynamic from "next/dynamic";
import { AuthProvider } from "../context/AuthContext";
import { LocaleProvider, useLocale } from "../locale";
import { ThemeProvider } from "../theme";

if (typeof window === "undefined") {
  import("../lib/worker-init").then((module) => {
    module.initializeWorker().catch((error: unknown) => {
      console.error("Worker initialization error:", error);
    });
  });
}

const DatabaseStatus = dynamic(() => import("../components/DatabaseStatus"), {
  ssr: false,
});

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
    <body style={{
      padding: 0,
      margin: 0
    }}>
      <AuthProvider>
        <ThemeProvider>
          <LocaleProvider>
            <ConfigProviderWrapper>
              <DatabaseStatus />
              <Component {...pageProps} />
            </ConfigProviderWrapper>
          </LocaleProvider>
        </ThemeProvider>
      </AuthProvider>
    </body>

  );
}

export default IFlowApp;
