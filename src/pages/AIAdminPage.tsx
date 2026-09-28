import React, { useState } from 'react';
import { api } from '../lib/api';
import { AINetworkAnalysis } from '../types';
import { TelemetryBadge } from '../components/common/TelemetryBadge';
import {
  Sparkles,
  Bot,
  Activity,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Loader2,
  Cpu,
  RefreshCw,
} from 'lucide-react';

export const AIAdminPage: React.FC = () => {
  const [analysis, setAnalysis] = useState<AINetworkAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runAnalysis = async () => {
    setIsLoading(true);
    try {
      const res = await api.analyzeCampusNetworkAI();
      setAnalysis(res);
    } catch (err: any) {
      alert(`AI Analysis error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Bot className="w-6 h-6 text-purple-400" />
            <h1 className="text-xl font-bold text-slate-100">Gemini Campus Network Intelligence Hub</h1>
            <TelemetryBadge type="AI" size="xs" />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Server-side Google GenAI synthesizing telemetry, active incidents, and crowd reports into operational summaries.
          </p>
        </div>

        <button
          onClick={runAnalysis}
          disabled={isLoading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/25 transition-all"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing Campus Telemetry...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate Campus Network Assessment</span>
            </>
          )}
        </button>
      </div>

      {analysis ? (
        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
          {/* Header Card */}
          <div className="p-5 rounded-2xl glass-panel-glow border border-purple-500/40 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono text-purple-300 uppercase tracking-wider font-semibold">
                Synthesized Status
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-lg font-bold text-slate-100">{analysis.network_status}</span>
                <span className="text-xs font-mono text-slate-400">• Trend: {analysis.trend}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">Confidence:</span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {analysis.confidence}
              </span>
              <TelemetryBadge type="AI" size="xs" />
            </div>
          </div>

          {/* Observations */}
          <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-3">
            <h3 className="text-xs font-mono font-semibold text-teal-400 uppercase tracking-wider">
              1. Key Operational Observations
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              {analysis.observations.map((obs, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <span>{obs}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Anomalies */}
          {analysis.anomalies.length > 0 && (
            <div className="p-5 rounded-2xl glass-panel border border-rose-500/30 space-y-3">
              <h3 className="text-xs font-mono font-semibold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>2. Detected Telemetry Anomalies</span>
              </h3>
              <ul className="space-y-2 text-xs text-rose-300">
                {analysis.anomalies.map((anom, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span>•</span>
                    <span>{anom}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-3">
            <h3 className="text-xs font-mono font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-indigo-400" />
              <span>3. Strategic Engineering Recommendations</span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              {analysis.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-indigo-400 font-bold">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl glass-panel border border-slate-800 space-y-4">
          <Cpu className="w-12 h-12 text-purple-400 mx-auto" />
          <div>
            <h3 className="text-base font-bold text-slate-200">No Assessment Generated Yet</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              Click the button above to run real-time campus telemetry through the Gemini network analysis prompt.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
