import React, { useState } from 'react';
import { runClientDiagnostics } from './diagnosticSuite';
import { DiagnosticResult, NetworkStatus } from '../../types';
import { TelemetryBadge } from '../../components/common/TelemetryBadge';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import {
  Activity,
  Play,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Wifi,
  Sparkles,
  FileText,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DiagnosticRunnerProps {
  onDiagnosticComplete?: (result: DiagnosticResult) => void;
  onOpenAssistantWithDiagnostic?: (result: DiagnosticResult) => void;
}

export const DiagnosticRunner: React.FC<DiagnosticRunnerProps> = ({
  onDiagnosticComplete,
  onOpenAssistantWithDiagnostic,
}) => {
  const { selectedLocationId } = useAuth();
  const navigate = useNavigate();
  const [isRunning, setIsRunning] = useState(false);
  const [stageText, setStageText] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [result, setResult] = useState<DiagnosticResult | null>(null);

  const startTest = async () => {
    setIsRunning(true);
    setResult(null);
    setProgressPercent(5);
    setStageText('Starting diagnostic probes...');

    try {
      const diagResult = await runClientDiagnostics((stage, pct) => {
        setStageText(stage);
        setProgressPercent(pct);
      });

      setResult(diagResult);
      onDiagnosticComplete?.(diagResult);

      // Post result to backend to record client telemetry
      try {
        await api.postDiagnostics(diagResult, selectedLocationId);
      } catch (err) {
        console.warn('Could not post diagnostic to backend:', err);
      }
    } catch (error) {
      console.error('Diagnostic error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusBadge = (status: NetworkStatus) => {
    switch (status) {
      case 'NORMAL':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-semibold">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>EXCELLENT HEALTH</span>
          </div>
        );
      case 'WARNING':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-semibold">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>MODERATE CONGESTION</span>
          </div>
        );
      case 'CRITICAL':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-mono font-semibold animate-pulse">
            <XCircle className="w-4 h-4 text-rose-400" />
            <span>DEGRADED CONNECTION</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="rounded-2xl glass-panel border border-slate-800 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal-400" />
            <h2 className="text-lg font-bold text-slate-100">Safe In-Browser Network Diagnostics</h2>
            <TelemetryBadge type="CLIENT" size="xs" />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Safely measures RTT latency, request jitter, and packet loss directly from your browser.
          </p>
        </div>

        <div>
          <button
            onClick={startTest}
            disabled={isRunning}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs tracking-wide transition-all shadow-lg ${
              isRunning
                ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                : 'bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-teal-500/20 hover:shadow-teal-500/30'
            }`}
          >
            {isRunning ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin text-teal-400" />
                <span>Probing Network...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>{result ? 'Run Diagnostics Again' : 'Start Diagnostic Probe'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress Bar during run */}
      {isRunning && (
        <div className="p-4 rounded-xl bg-slate-900/90 border border-teal-500/30 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-teal-300 flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
              {stageText}
            </span>
            <span className="text-slate-400">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Diagnostic Result View */}
      {result && (
        <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div>
              <span className="text-[11px] font-mono text-slate-400">Diagnostic Status</span>
              <p className="text-sm font-semibold text-slate-200 mt-0.5">
                {result.client_assessment.summary}
              </p>
            </div>
            {getStatusBadge(result.client_assessment.status)}
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 font-mono text-center">
              <span className="text-[11px] text-slate-400">Latency (RTT)</span>
              <div className="text-2xl font-black text-slate-100 mt-1">
                {result.latency_ms} <span className="text-xs font-normal text-slate-400">ms</span>
              </div>
              <span className="text-[10px] text-teal-400 mt-1 block">
                {result.latency_ms < 60 ? 'Optimal' : result.latency_ms < 120 ? 'Elevated' : 'High'}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 font-mono text-center">
              <span className="text-[11px] text-slate-400">Jitter (Variation)</span>
              <div className="text-2xl font-black text-slate-100 mt-1">
                {result.jitter_ms} <span className="text-xs font-normal text-slate-400">ms</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                {result.jitter_ms < 5 ? 'Stable' : 'Intermittent Jitter'}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 font-mono text-center">
              <span className="text-[11px] text-slate-400">Packet Loss</span>
              <div className="text-2xl font-black text-slate-100 mt-1">
                {result.packet_loss_percent} <span className="text-xs font-normal text-slate-400">%</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                {result.packet_loss_percent === 0 ? '0% drop' : 'Requests Dropped'}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 font-mono text-center">
              <span className="text-[11px] text-slate-400">Est. Throughput</span>
              <div className="text-2xl font-black text-slate-100 mt-1">
                {result.download_speed_mbps} <span className="text-xs font-normal text-slate-400">Mbps</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                {result.connection_type || 'Wi-Fi Interface'}
              </span>
            </div>
          </div>

          {/* Assessment Details & Guidance */}
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-2">
            <h4 className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider">
              Diagnostic Assessment Insights
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              {result.client_assessment.details.map((detail, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-teal-400 mt-0.5">•</span>
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Recommendations */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
            <div className="text-xs text-slate-400 font-mono">
              Measured at: {new Date(result.timestamp).toLocaleTimeString()} • Client-side probe
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAssistantWithDiagnostic?.(result)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/30 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                <span>Troubleshoot with NetSense AI</span>
              </button>

              <button
                onClick={() => navigate('/reports/new', { state: { diagnosticResult: result } })}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-teal-500/20 hover:bg-teal-500/30 text-teal-200 border border-teal-500/30 transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-teal-400" />
                <span>Create Network Report</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
