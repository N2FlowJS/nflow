import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Send, Terminal, User, Bot, Sparkles, AlertCircle, X, Trash2 } from 'lucide-react';
import Markdown from 'react-markdown';

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
}) {
  const [input, setInput] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const [expandedMessages, setExpandedMessages] = useState<Record<number, boolean>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  const normalizedError = useMemo(() => {
    if (!error) return null;
    const raw = String(error);
    const compact = raw.replace(/\s+/g, ' ').trim();

    const cleanedPrefix = compact
      .replace(/^Node\s*\[[^\]]+\]\s*failed:\s*/i, '')
      .replace(/^Error:\s*/i, '');

    let summary = cleanedPrefix;
    let details: string | null = null;

    const jsonStart = cleanedPrefix.indexOf('{"error"');
    if (jsonStart >= 0) {
      try {
        const payload = JSON.parse(cleanedPrefix.slice(jsonStart));
        const message = payload?.error?.message;
        if (typeof message === 'string' && message.trim()) {
          summary = message.trim();
        }
        details = JSON.stringify(payload?.error?.details ?? payload?.error ?? payload, null, 2);
      } catch {
        details = cleanedPrefix;
      }
    }

    const isLong = summary.length > 260;
    const shortSummary = isLong ? `${summary.slice(0, 260)}...` : summary;

    return {
      shortSummary,
      fullSummary: summary,
      details,
      isLong,
    };
  }, [error]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping, error]);

  useEffect(() => {
    setShowErrorDetails(false);
  }, [error]);

  const showNotice = (text: string) => {
    setNotice(text);
    window.setTimeout(() => setNotice(null), 1800);
  };

  const handleSend = () => {
    if (!input.trim() || isTyping) return;
    onSendMessage(input);
    setInput('');
  };

  const renderMessageContent = (message: PlaygroundMessage, messageIndex: number) => {
    if (message.role === 'user') {
      return <Markdown>{message.text}</Markdown>;
    }

    const isExpandable = message.role === 'assistant' && message.text.length > 420;
    const isExpanded = !!expandedMessages[messageIndex];
    const displayText = isExpandable && !isExpanded
      ? `${message.text.slice(0, 420)}...`
      : message.text;

    if (isExpandable) {
      return (
        <div className="space-y-2">
          <div className="break-words whitespace-pre-wrap">
            <Markdown>{displayText}</Markdown>
          </div>
          <button
            type="button"
            onClick={() => setExpandedMessages((prev) => ({ ...prev, [messageIndex]: !isExpanded }))}
            className="text-[10px] uppercase tracking-wider text-cyber-primary hover:text-cyan-300"
          >
            {isExpanded ? 'Show less' : 'Show more'}
          </button>
        </div>
      );
    }

    return (
      <div className="break-words whitespace-pre-wrap">
        <Markdown>{message.text}</Markdown>
      </div>
    );
  };

  if (!isOpen) return null;

  const effectiveStatus: RuntimeStatus = runtimeStatus || 'idle';
  const statusStyles: Record<RuntimeStatus, string> = {
    idle: 'border-gray-500/40 text-gray-300 bg-white/5',
    running: 'border-cyan-500/40 text-cyan-300 bg-cyan-500/10',
    success: 'border-green-500/40 text-green-300 bg-green-500/10',
    error: 'border-red-500/40 text-red-300 bg-red-500/10',
    cancelled: 'border-yellow-500/40 text-yellow-300 bg-yellow-500/10',
  };

  const statusLabel: Record<RuntimeStatus, string> = {
    idle: 'IDLE',
    running: 'RUNNING',
    success: 'SUCCESS',
    error: 'ERROR',
    cancelled: 'CANCELLED',
  };

  return (
    <div className="fixed top-0 right-0 w-96 h-screen bg-cyber-panel/95 backdrop-blur-2xl border-l border-cyber-border z-50 flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
      <div className="p-6 border-b border-cyber-border flex justify-between items-center bg-black/40">
        <div className="flex items-center gap-3">
          <Terminal className="text-cyber-primary" size={18} />
          <h2 className="font-bold text-sm tracking-widest uppercase">Agent Playground</h2>
          <span className={`px-2 py-0.5 rounded-md border text-[10px] font-mono uppercase tracking-wider ${statusStyles[effectiveStatus]}`}>
            {statusLabel[effectiveStatus]}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              onClearMessages?.();
              showNotice('Chat cleared');
            }}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Clear chat"
          >
            <Trash2 size={14} className="text-gray-500 hover:text-red-400" />
          </button>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Close Playground">
            <X size={16} className="text-gray-500 hover:text-white" />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide relative">
        {normalizedError && (
          <div className="sticky top-0 z-10 mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 backdrop-blur-md">
            <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs text-red-200 leading-relaxed min-w-0">
              <div className="break-words">{showErrorDetails ? normalizedError.fullSummary : normalizedError.shortSummary}</div>
              {(normalizedError.isLong || normalizedError.details) && (
                <button
                  type="button"
                  onClick={() => setShowErrorDetails((prev) => !prev)}
                  className="mt-1 text-[10px] uppercase tracking-wider text-red-300 hover:text-red-100"
                >
                  {showErrorDetails ? 'Hide details' : 'Show details'}
                </button>
              )}
              {showErrorDetails && normalizedError.details && (
                <pre className="mt-2 max-h-32 overflow-auto bg-black/30 border border-red-500/20 rounded p-2 text-[10px] text-red-100 whitespace-pre-wrap break-all">
                  {normalizedError.details}
                </pre>
              )}
            </div>
            {onErrorDismiss && (
              <button onClick={onErrorDismiss} className="p-1 hover:bg-red-500/20 rounded-lg transition-colors shrink-0 text-red-400 hover:text-red-300">
                <X size={14} />
              </button>
            )}
          </div>
        )}

        {messages.map((m, i) => {
          const isLastAndEmpty = i === messages.length - 1 && m.role === 'assistant' && !m.text;
          if (m.role === 'system') {
            return (
              <div key={i} className="flex gap-2 items-start opacity-70">
                <Terminal size={12} className="text-cyber-muted mt-1 shrink-0" />
                <div className="text-[10px] font-mono text-cyber-muted leading-relaxed break-all">
                  {m.text}
                </div>
              </div>
            );
          }
          if (isLastAndEmpty && isTyping) {
            return (
              <div key={i} className="flex gap-3 items-center text-cyber-muted italic text-[10px] animate-pulse">
                <Sparkles size={12} />
                Agent is thinking...
              </div>
            );
          }
          return (
            <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                m.role === 'user' ? 'bg-cyber-primary/10 border-cyber-primary/30 text-cyber-primary' : 'bg-cyber-secondary/10 border-cyber-secondary/30 text-cyber-secondary'
              }`}>
                {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`max-w-[80%] min-w-0 overflow-hidden p-3 rounded-xl text-xs leading-relaxed ${
                m.role === 'user' ? 'bg-cyber-primary text-black font-medium' : 'bg-white/5 border border-white/10 text-gray-300'
              }`}>
                <div className={`prose prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 prose-pre:p-2 prose-pre:rounded-lg prose-pre:whitespace-pre-wrap prose-pre:break-all prose-code:text-cyan-400 prose-code:bg-black/30 prose-code:px-1 prose-code:rounded prose-code:break-all max-w-none text-xs break-words [&_*]:break-words ${m.role === 'user' ? 'text-black prose-p:text-black prose-headings:text-black prose-strong:text-black' : 'prose-invert'}`}>
                  {renderMessageContent(m, i)}
                </div>
              </div>
            </div>
          );
        })}
        {notice && (
          <div className="sticky bottom-2 z-10 px-3 py-2 rounded-lg border border-cyber-primary/30 bg-cyber-primary/10 text-[10px] font-mono text-cyber-primary text-center">
            {notice}
          </div>
        )}
      </div>

      <div className="p-6 border-t border-cyber-border bg-black/20">
        <div className="relative">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Send a test message..."
            className="w-full bg-cyber-dark border border-white/10 rounded-xl px-4 py-3 text-xs focus:border-cyber-primary outline-none transition-all pr-12"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-cyber-primary text-black rounded-lg hover:scale-110 active:scale-95 transition-all shadow-lg disabled:opacity-50 disabled:hover:scale-100"
          >
            <Send size={14} />
          </button>
        </div>
        <p className="mt-4 text-[10px] text-gray-600 text-center uppercase tracking-widest font-mono">
          Isolated Sandbox Environment
        </p>
      </div>
    </div>
  );
}