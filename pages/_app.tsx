import React from "react";
import { AppProps } from "next/app";
import { LocaleProvider } from "../locale";
import "../styles/globals.css";
import { AuthProvider } from "../context/AuthContext";
import dynamic from "next/dynamic";
import "@ant-design/v5-patch-for-react-19";
import { ThemeProvider } from "../theme";

// Only import and initialize on the server (much cleaner)
if (typeof window === "undefined") {


  // Worker initialization if enabled
  import("../lib/worker-init").then((module) => {
    module.initializeWorker().catch((error: unknown) => {
      console.error("Worker initialization error:", error);
    });
  });

}

const DatabaseStatus = dynamic(() => import("../components/DatabaseStatus"), {
  ssr: false,
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <LocaleProvider>
          <DatabaseStatus />
          <Component {...pageProps} />
        </LocaleProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default MyApp;
