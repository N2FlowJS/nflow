import React, { useRef, useEffect, useState } from 'react';
import { Send, Terminal, User, Bot, Sparkles, AlertCircle, X, Trash2 } from 'lucide-react';
import Markdown from 'react-markdown';
import { extractErrorMessage } from '../lib/utils';
import { Button, Input } from './ui';

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
  const statusDot: Record<RuntimeStatus, string> = {
    idle: 'bg-gray-500',
    running: 'bg-cyan-400 animate-pulse',
    success: 'bg-green-400',
    error: 'bg-red-400',
    cancelled: 'bg-yellow-400',
  };
  const statusLabel: Record<RuntimeStatus, string> = {
    idle: 'Idle',
    running: 'Running',
    success: 'Done',
    error: 'Error',
    cancelled: 'Cancelled',
  };

  const systemCount = messages.filter((m) => m.role === 'system').length;
  const visibleMessages = showSystemMessages
    ? messages
    : messages.filter((m) => m.role !== 'system');

  return (
    <div className="fixed top-0 right-0 w-96 h-screen bg-cyber-panel/95 backdrop-blur-2xl border-l border-cyber-border z-50 flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-cyber-border flex justify-between items-center bg-black/40">
        <div className="flex items-center gap-2">
          <Terminal className="text-cyber-primary" size={15} />
          <span className="font-semibold text-xs tracking-widest uppercase">Playground</span>
          <span className="flex items-center gap-1 text-[10px] text-gray-400">
            <span className={`w-1.5 h-1.5 rounded-full ${statusDot[effectiveStatus]}`} />
            {statusLabel[effectiveStatus]}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {systemCount > 0 && (
            <button
              onClick={() => setShowSystemMessages((v) => !v)}
              className={`px-2 py-1 rounded text-[10px] font-mono transition-colors ${showSystemMessages ? 'bg-cyber-primary/20 text-cyber-primary' : 'text-gray-500 hover:text-gray-300'}`}
              title="Toggle system messages"
            >
              SYS·{systemCount}
            </button>
          )}
          <button
            onClick={() => onClearMessages?.()}
            className="p-1.5 hover:bg-white/10 rounded transition-colors"
            title="Clear chat"
          >
            <Trash2 size={13} className="text-gray-500 hover:text-red-400" />
          </button>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded transition-colors" title="Close">
            <X size={14} className="text-gray-500 hover:text-white" />
          </button>
        </div>
      </div>

      {/* Error banner */}
      {errorSummary && (
        <div className="flex items-start gap-2 px-4 py-2 bg-red-500/10 border-b border-red-500/25 text-xs text-red-300">
          <AlertCircle size={13} className="shrink-0 mt-0.5 text-red-400" />
          <span className="flex-1 leading-relaxed break-words">{errorSummary}</span>
          {onErrorDismiss && (
            <button onClick={onErrorDismiss} className="shrink-0 text-red-400 hover:text-red-200 mt-0.5">
              <X size={12} />
            </button>
          )}
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-hide">
        {visibleMessages.map((m, i) => {
          const isLastAndEmpty = i === visibleMessages.length - 1 && m.role === 'assistant' && !m.text;

          if (m.role === 'system') {
            return (
              <div key={i} className="flex gap-2 items-start opacity-50">
                <Terminal size={10} className="text-cyber-muted mt-0.5 shrink-0" />
                <span className="text-[10px] font-mono text-cyber-muted leading-relaxed break-all">{m.text}</span>
              </div>
            );
          }

          if (isLastAndEmpty && isTyping) {
            return (
              <div key={i} className="flex items-center gap-2 text-cyber-muted italic text-[10px] animate-pulse">
                <Sparkles size={11} />
                Agent is thinking…
              </div>
            );
          }

          const isUser = m.role === 'user';
          return (
            <div key={i} className={`flex gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
              <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 border ${
                isUser ? 'bg-cyber-primary/10 border-cyber-primary/30 text-cyber-primary' : 'bg-white/5 border-white/10 text-gray-400'
              }`}>
                {isUser ? <User size={12} /> : <Bot size={12} />}
              </div>
              <div className={`max-w-[82%] min-w-0 overflow-hidden px-3 py-2 rounded-xl text-xs leading-relaxed ${
                isUser ? 'bg-cyber-primary text-black font-medium' : 'bg-white/5 border border-white/10 text-gray-300'
              }`}>
                <div className={`prose prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 prose-pre:p-2 prose-pre:rounded-lg prose-pre:whitespace-pre-wrap prose-pre:break-all prose-code:text-cyan-400 prose-code:bg-black/30 prose-code:px-1 prose-code:rounded prose-code:break-all max-w-none text-xs break-words [&_*]:break-words ${
                  isUser ? 'text-black prose-p:text-black prose-headings:text-black prose-strong:text-black' : 'prose-invert'
                }`}>
                  <Markdown>{m.text}</Markdown>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-cyber-border bg-black/20">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { 
                e.preventDefault(); 
                handleSend(); 
              }
            }}
            placeholder="Send a test message…"
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="px-3"
            title="Send message"
          >
            <Send size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}