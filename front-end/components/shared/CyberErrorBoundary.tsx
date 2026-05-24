import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertOctagon, RefreshCw } from "lucide-react";
import { Button } from "../ui";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  name?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class CyberErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[CyberErrorBoundary: ${this.props.name || "Component"}] Uncaught error:`, error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="h-full w-full flex flex-col items-center justify-center p-6 bg-black/90 border border-red-500/20 rounded-xl backdrop-blur-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-red-500/5 pointer-events-none" />
          <div className="absolute top-0 left-0 w-full h-[2px] bg-red-500/40 animate-pulse" />
          
          <div className="flex flex-col items-center max-w-md text-center space-y-4 relative z-10">
            <div className="p-3 bg-red-500/10 border border-red-500/35 rounded-xl text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] animate-pulse">
              <AlertOctagon size={28} />
            </div>

            <div className="space-y-1">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-red-500">
                System Interface Failure
              </h3>
              <p className="text-[10px] text-white/40 font-mono">
                CRITICAL EXCEPTION DETECTED IN: {this.props.name || "CORE_MODULE"}
              </p>
            </div>

            {this.state.error && (
              <div className="w-full text-left p-3 rounded bg-red-950/20 border border-red-900/30 font-mono text-[9px] text-red-400 overflow-x-auto max-h-32 custom-scrollbar">
                {this.state.error.message}
                {this.state.error.stack && (
                  <pre className="mt-1 text-[8px] text-red-500/60 whitespace-pre-wrap">
                    {this.state.error.stack.split("\n").slice(0, 3).join("\n")}
                  </pre>
                )}
              </div>
            )}

            <Button
              onClick={this.handleReset}
              variant="outline"
              className="flex items-center gap-2 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 rounded-lg active:scale-95 text-[10px] font-bold uppercase tracking-wider px-4 py-2"
            >
              <RefreshCw size={12} className="animate-spin-slow" />
              Reboot Panel
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
