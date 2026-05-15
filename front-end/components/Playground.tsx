import React, { useRef, useEffect, useState } from 'react';
import { Send, Terminal, User, Bot, Sparkles, AlertCircle, X, Trash2, MessageSquare } from 'lucide-react';
import Markdown from 'react-markdown';
import { extractErrorMessage } from '../lib/utils';
import { CyberPanel, CyberAction, StatusIndicator } from './shared/CyberUI';

type PlaygroundMessage = {
  role: string;
  text: string;
};

type RuntimeStatus = 'idle' | 'running' | 'success' | 'error' | 'cancelled';

export default function Playground({ 
  isOpen, 
  onClose, 
  messages,
  isTyping,
  runtimeStatus,
  error,
  onErrorDismiss,
  onSendMessage,
  onClearMessages,
  mode = 'floating',
}: { 
  isOpen: boolean;
  onClose: () => void;
  messages: PlaygroundMessage[];
  isTyping: boolean;
  runtimeStatus?: RuntimeStatus;
  error?: string | null;
  onErrorDismiss?: () => void;
  onSendMessage: (msg: string) => void;
  onClearMessages?: () => void;
  mode?: 'floating' | 'dock';
}) {
  const [input, setInput] = useState('');
  const [showSystemMessages, setShowSystemMessages] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const errorSummary = error
    ? (() => { const msg = extractErrorMessage(error); return msg.length > 200 ? `${msg.slice(0, 200)}…` : msg; })()
    : null;

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping, error]);

  const handleSend = () => {
    if (!input.trim() || isTyping) return;
    onSendMessage(input);
    setInput('');
  };

  if (!isOpen) return null;

  const effectiveStatus: RuntimeStatus = runtimeStatus || 'idle';
  const statusMap: Record<RuntimeStatus, "idle" | "running" | "success" | "error"> = {
    idle: 'idle',
    running: 'running',
    success: 'success',
    error: 'error',
    cancelled: 'idle',
  };

  const systemCount = messages.filter((m) => m.role === 'system').length;
  const visibleMessages = showSystemMessages
    ? messages
    : messages.filter((m) => m.role !== 'system');
  const isDock = mode === 'dock';

  return (
    <div className={isDock ? "h-full w-full" : "fixed top-0 right-0 w-80 md:w-96 h-screen z-[60] animate-in slide-in-from-right duration-300"}>
      <CyberPanel
        title="Playground"
        icon={MessageSquare}
        onClose={onClose}
        className="h-full rounded-none border-y-0 border-r-0"
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-black/40 rounded border border-white/5">
              <StatusIndicator status={statusMap[effectiveStatus]} size={6} />
              <span className="text-[9px] font-black uppercase text-white/40 tracking-tighter">
                {effectiveStatus}
              </span>
            </div>
            {systemCount > 0 && (
              <CyberAction
                label={`SYS:${systemCount}`}
                active={showSystemMessages}
                onClick={() => setShowSystemMessages(!showSystemMessages)}
                className="h-7 px-2 border-none bg-black/40"
              />
            )}
            <CyberAction
              icon={Trash2}
              label="Clear"
              showLabel={false}
              onClick={() => onClearMessages?.()}
              className="h-7 w-7 p-0 hover:text-red-400 border-none bg-black/40"
            />
          </div>
        }
      >
        <div className="flex flex-col h-full bg-black/20">
          {/* Error banner */}
          {errorSummary && (
            <div className="flex items-start gap-2 px-4 py-3 bg-red-500/10 backdrop-blur-md border-b border-red-500/20 text-[11px] text-red-300">
              <AlertCircle size={14} className="shrink-0 text-red-400" />
              <span className="flex-1 leading-tight">{errorSummary}</span>
              <button onClick={onErrorDismiss} className="text-red-400 hover:text-white">
                <X size={14} />
              </button>
            </div>
          )}

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scrollbar-hide">
            {visibleMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-20 gap-3">
                <Bot size={48} />
                <span className="text-[10px] uppercase font-black tracking-[0.3em]">Ready for Input</span>
              </div>
            ) : (
              visibleMessages.map((m, i) => {
                const isUser = m.role === 'user';
                const isSystem = m.role === 'system';
                
                if (isSystem) {
                  return (
                    <div key={i} className="flex gap-2 items-start opacity-40 bg-black/20 p-2 rounded border border-white/5">
                      <Terminal size={10} className="mt-1 shrink-0" />
                      <span className="text-[10px] font-mono break-all leading-relaxed">{m.text}</span>
                    </div>
                  );
                }

                return (
                  <div key={i} className={`flex flex-col gap-2 ${isUser ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-2 px-1">
                      {isUser ? <User size={10} className="text-cyber-primary" /> : <Bot size={10} className="text-purple-400" />}
                      <span className="text-[9px] font-black uppercase tracking-widest text-white/30">
                        {isUser ? 'Operator' : 'AI-Agent'}
                      </span>
                    </div>
                    <div className={`max-w-[90%] px-3 py-2 rounded-xl text-[12px] leading-relaxed shadow-sm ${
                      isUser 
                        ? 'bg-cyber-primary/10 border border-cyber-primary/20 text-cyber-primary rounded-tr-none' 
                        : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-none'
                    }`}>
                      <Markdown >
                        {m.text}
                      </Markdown>
                    </div>
                  </div>
                );
              })
            )}
            {isTyping && (
              <div className="flex items-center gap-2 text-cyber-primary animate-pulse px-1">
                <Sparkles size={12} />
                <span className="text-[10px] font-black uppercase tracking-widest">Processing...</span>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-black/40 border-t border-white/5 backdrop-blur-md">
            <div className="relative group">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Transmit instructions..."
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-[12px] text-white focus:outline-none focus:border-cyber-primary/40 transition-all font-sans min-h-[50px] max-h-[150px] resize-none pr-12 scrollbar-hide"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="absolute right-2 bottom-2 p-2 rounded-lg bg-cyber-primary text-black hover:bg-cyber-primary/80 disabled:opacity-30 transition-all active:scale-95"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </CyberPanel>
    </div>
  );
}