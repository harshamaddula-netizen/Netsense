import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { DiagnosticResult, CampusLocation, Incident } from '../../types';
import { TelemetryBadge } from '../../components/common/TelemetryBadge';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  Activity,
  FileText,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Loader2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NetSenseAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDiagnostic?: DiagnosticResult | null;
  onTriggerDiagnostic?: () => void;
}

interface MessageItem {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  action_prompt?: {
    type: 'RUN_DIAGNOSTIC' | 'CREATE_REPORT';
    label: string;
  };
}

export const NetSenseAssistantModal: React.FC<NetSenseAssistantModalProps> = ({
  isOpen,
  onClose,
  initialDiagnostic,
  onTriggerDiagnostic,
}) => {
  const { user, selectedLocationId } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [locations, setLocations] = useState<CampusLocation[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentLoc = locations.find((l) => l.id === selectedLocationId);

  useEffect(() => {
    api.getLocations().then(setLocations).catch(console.error);
  }, []);

  // Initial greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 'welcome-msg',
          sender: 'assistant',
          text: `Hello ${user?.full_name?.split(' ')[0] || 'there'}! I'm NetSense Assistant, your campus network support AI. I can test your connection speed, check if your floor's Wi-Fi access point is congested, and help you file a ticket directly with NOC engineers. How can I assist you right now?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, [isOpen, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const message = textToSend || inputValue.trim();
    if (!message || isSending) return;

    setInputValue('');
    const userMsg: MessageItem = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsSending(true);

    try {
      const res = await api.chatAI({
        message,
        location_id: selectedLocationId,
        diagnostics: initialDiagnostic,
      });

      const assistantMsg: MessageItem = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: res.message.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action_prompt: res.action_prompt,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: 'I encountered an error querying campus network telemetry. Please try again or submit a manual report.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const quickPrompts = [
    'My internet is very slow',
    'Wi-Fi keeps disconnecting',
    'Video lecture buffering heavily',
    'Are other students in my building having issues?',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end p-2 sm:p-6 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full sm:w-[440px] h-[85vh] sm:h-[620px] rounded-2xl glass-panel-glow border border-teal-500/40 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-500 to-purple-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(20,184,166,0.3)]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm text-slate-100">NetSense Assistant</h3>
                <TelemetryBadge type="AI" size="xs" />
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                {currentLoc ? currentLoc.name.split('-')[0].trim() : 'Campus Wide'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Diagnostic Context Pill */}
        {initialDiagnostic && (
          <div className="px-4 py-2 bg-teal-500/10 border-b border-teal-500/20 text-[11px] font-mono flex items-center justify-between text-teal-300">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              <span>Diagnostic attached ({initialDiagnostic.latency_ms}ms RTT, {initialDiagnostic.packet_loss_percent}% loss)</span>
            </span>
            <span className="text-[10px] px-1 rounded bg-teal-500/20">Active</span>
          </div>
        )}

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <div
                key={m.id}
                className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-teal-500/20 border border-teal-500/40 text-teal-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div className={`max-w-[82%] space-y-2 ${isUser ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`p-3 rounded-2xl text-xs leading-relaxed ${
                      isUser
                        ? 'bg-teal-500 text-slate-950 font-medium rounded-tr-none'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                    }`}
                  >
                    <p className="whitespace-pre-line">{m.text}</p>
                  </div>

                  {/* Dynamic Action Buttons inside chat */}
                  {m.action_prompt && (
                    <div className="pt-1">
                      {m.action_prompt.type === 'RUN_DIAGNOSTIC' ? (
                        <button
                          onClick={() => {
                            onClose();
                            onTriggerDiagnostic?.();
                            navigate('/diagnostics');
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/40 hover:bg-teal-500/30 transition-colors shadow-sm"
                        >
                          <Activity className="w-3.5 h-3.5" />
                          <span>{m.action_prompt.label || 'Run Safe Diagnostics'}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            onClose();
                            navigate('/reports/new', { state: { fromAI: true } });
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 transition-colors shadow-sm"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>{m.action_prompt.label || 'Create Incident Report'}</span>
                        </button>
                      )}
                    </div>
                  )}

                  <span className="text-[10px] text-slate-500 font-mono block px-1">
                    {m.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isSending && (
            <div className="flex gap-2.5 items-center text-xs text-slate-400 font-mono">
              <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              </div>
              <span>NetSense AI analyzing campus telemetry...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-3 py-2 bg-slate-950/70 border-t border-slate-800/80 overflow-x-auto flex gap-1.5 scrollbar-none">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/60 transition-colors shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat Input */}
        <div className="p-3 bg-slate-950 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about Wi-Fi speed, outages or advice..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isSending}
              className="w-8 h-8 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-40 text-slate-950 flex items-center justify-center transition-colors shrink-0 shadow-md"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
