import React, { useState } from 'react';
import { Incident, IncidentStatus, AIIncidentSummary } from '../../types';
import { TelemetryBadge } from '../../components/common/TelemetryBadge';
import { api } from '../../lib/api';
import {
  X,
  AlertOctagon,
  Clock,
  MapPin,
  Sparkles,
  FileText,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  Activity,
  Layers,
  ArrowRight,
  Loader2,
} from 'lucide-react';

interface IncidentDetailModalProps {
  incident: Incident;
  onClose: () => void;
  onIncidentUpdated?: () => void;
  isAdmin?: boolean;
}

export const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({
  incident,
  onClose,
  onIncidentUpdated,
  isAdmin = false,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'ai_summary' | 'timeline'>('overview');
  const [aiSummary, setAiSummary] = useState<AIIncidentSummary | null>(incident.ai_summary || null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const handleGenerateAiSummary = async () => {
    setIsGeneratingAi(true);
    try {
      const summary = await api.incidentSummaryAI(incident.id);
      setAiSummary(summary);
      onIncidentUpdated?.();
    } catch (err: any) {
      alert(`AI Summary error: ${err.message}`);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleUpdateStatus = async (newStatus: IncidentStatus) => {
    setIsUpdatingStatus(true);
    try {
      await api.updateIncident(incident.id, { status: newStatus });
      onIncidentUpdated?.();
    } catch (err: any) {
      alert(`Status update error: ${err.message}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-3xl max-h-[90vh] rounded-2xl glass-panel border border-slate-700 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/80 flex items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold uppercase">
                {incident.severity}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30 font-semibold uppercase">
                {incident.status}
              </span>
              <TelemetryBadge type={incident.source === 'DEMO' ? 'DEMO' : 'REAL'} size="xs" />
            </div>
            <h2 className="text-lg font-bold text-slate-100">{incident.title}</h2>
            <div className="flex items-center gap-3 text-xs text-slate-400 font-mono mt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-teal-400" />
                <span>{incident.location_name || 'Campus Location'}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Detected: {new Date(incident.detected_at).toLocaleString()}</span>
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 px-5 bg-slate-900/40 text-xs font-medium">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-teal-400 text-teal-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'reports'
                ? 'border-teal-400 text-teal-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Correlated Reports</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-teal-300 font-mono">
              {incident.correlated_reports?.length || 0}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('ai_summary')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'ai_summary'
                ? 'border-purple-400 text-purple-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>AI Root Cause Analysis</span>
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-3 px-4 border-b-2 transition-colors ${
              activeTab === 'timeline'
                ? 'border-teal-400 text-teal-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Event Timeline
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {activeTab === 'overview' && (
            <div className="space-y-4 text-xs leading-relaxed text-slate-300">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <h4 className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2 font-semibold">
                  Incident Narrative
                </h4>
                <p>{incident.description}</p>
              </div>

              {/* Status Switcher for Admins */}
              {isAdmin && (
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <h4 className="text-[11px] font-mono text-teal-400 uppercase tracking-wider font-semibold">
                    Admin Operational Controls
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(['OPEN', 'INVESTIGATING', 'MITIGATED', 'RESOLVED'] as IncidentStatus[]).map((st) => (
                      <button
                        key={st}
                        disabled={incident.status === st || isUpdatingStatus}
                        onClick={() => handleUpdateStatus(st)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-colors ${
                          incident.status === st
                            ? 'bg-teal-500/20 text-teal-300 border-teal-500/40 cursor-default'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        Set: {st}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-3">
              {incident.correlated_reports && incident.correlated_reports.length > 0 ? (
                incident.correlated_reports.map((rep) => (
                  <div
                    key={rep.id}
                    className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono">
                      <span className="font-semibold text-slate-200">
                        {rep.user_name || 'Anonymous Student'} ({rep.user_role || 'student'})
                      </span>
                      <span>{new Date(rep.created_at).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-slate-300">{rep.description}</p>
                    <div className="flex items-center gap-2 pt-1 font-mono text-[10px]">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-teal-300">
                        {rep.category}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        Device: {rep.device_type}
                      </span>
                      {rep.diagnostic_data && (
                        <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                          {rep.diagnostic_data.latency_ms}ms RTT
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No individual user reports attached yet.
                </div>
              )}
            </div>
          )}

          {activeTab === 'ai_summary' && (
            <div className="space-y-4">
              {!aiSummary ? (
                <div className="p-8 text-center rounded-xl bg-slate-900/60 border border-purple-500/20 space-y-4">
                  <Sparkles className="w-10 h-10 text-purple-400 mx-auto animate-pulse" />
                  <div>
                    <h3 className="font-bold text-sm text-slate-200">Generate Automated AI Incident Summary</h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                      Gemini synthesizes all correlated reports, AP congestion metrics, and access point logs into a structured root cause breakdown.
                    </p>
                  </div>
                  <button
                    onClick={handleGenerateAiSummary}
                    disabled={isGeneratingAi}
                    className="px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/25 transition-all inline-flex items-center gap-2"
                  >
                    {isGeneratingAi ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Synthesizing Telemetry...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Generate Root Cause Report</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300">
                    <span className="font-mono font-semibold flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" />
                      Confidence: {aiSummary.confidence}
                    </span>
                    <TelemetryBadge type="AI" size="xs" />
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <h4 className="font-mono text-[11px] text-teal-400 font-semibold uppercase tracking-wider">
                      Executive Summary
                    </h4>
                    <p className="text-slate-200 leading-relaxed">{aiSummary.summary}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <h4 className="font-mono text-[11px] text-amber-400 font-semibold uppercase tracking-wider">
                        Evidence Points
                      </h4>
                      <ul className="space-y-1.5 text-slate-400">
                        {aiSummary.evidence.map((ev, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-amber-400">•</span>
                            <span>{ev}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <h4 className="font-mono text-[11px] text-rose-400 font-semibold uppercase tracking-wider">
                        Possible Root Causes
                      </h4>
                      <ul className="space-y-1.5 text-slate-400">
                        {aiSummary.possible_causes.map((cause, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-rose-400">•</span>
                            <span>{cause}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <h4 className="font-mono text-[11px] text-indigo-400 font-semibold uppercase tracking-wider">
                      Recommended Engineering Investigations
                    </h4>
                    <ul className="space-y-1.5 text-slate-300">
                      {aiSummary.recommended_investigation.map((rec, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-3 font-mono text-xs">
              {incident.events && incident.events.length > 0 ? (
                incident.events.map((ev) => (
                  <div key={ev.id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="w-2 h-2 rounded-full bg-teal-400 mt-1.5 shrink-0"></div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-200">{ev.event_type}</span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(ev.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-slate-400 font-sans">{ev.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-slate-400 text-center py-6">No historical events recorded.</div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-500">NetSense Incident Engine</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Close View
          </button>
        </div>
      </div>
    </div>
  );
};
