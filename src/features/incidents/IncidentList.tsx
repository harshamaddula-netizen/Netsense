import React, { useState } from 'react';
import { Incident, IncidentStatus, SeverityLevel } from '../../types';
import { TelemetryBadge } from '../../components/common/TelemetryBadge';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import {
  AlertOctagon,
  Clock,
  MapPin,
  FileText,
  ChevronRight,
  Sparkles,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { IncidentDetailModal } from './IncidentDetailModal';

interface IncidentListProps {
  incidents: Incident[];
  onIncidentUpdated?: () => void;
  showAdminControls?: boolean;
}

export const IncidentList: React.FC<IncidentListProps> = ({
  incidents,
  onIncidentUpdated,
  showAdminControls = false,
}) => {
  const { role } = useAuth();
  const isAdmin = role === 'admin' || showAdminControls;
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  const getSeverityBadge = (severity: SeverityLevel) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse';
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'MEDIUM':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'LOW':
      default:
        return 'bg-slate-700/50 text-slate-300 border-slate-600';
    }
  };

  const getStatusBadge = (status: IncidentStatus) => {
    switch (status) {
      case 'OPEN':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'INVESTIGATING':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'MITIGATED':
        return 'bg-teal-500/10 text-teal-400 border-teal-500/30';
      case 'RESOLVED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
  };

  if (incidents.length === 0) {
    return (
      <div className="rounded-2xl glass-panel border border-slate-800 p-8 text-center space-y-3">
        <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
        <h3 className="text-base font-bold text-slate-200">No Active Incidents Detected</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          All campus wireless access points and gateway switches are currently reporting nominal latency and throughput.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {incidents.map((inc) => {
          const reportCount = inc.correlated_reports?.length || inc.correlated_report_ids?.length || 0;
          const isDemo = inc.source === 'DEMO';

          return (
            <div
              key={inc.id}
              onClick={() => setSelectedIncident(inc)}
              className="rounded-xl glass-panel border border-slate-800 hover:border-teal-500/40 p-4 transition-all duration-200 cursor-pointer group space-y-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-teal-400 group-hover:border-teal-500/40 transition-colors">
                    <AlertOctagon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-100 group-hover:text-teal-300 transition-colors">
                      {inc.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-teal-400" />
                        <span>{inc.location_name || 'Campus Location'}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-mono text-[11px]">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(inc.detected_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isDemo && <TelemetryBadge type="DEMO" size="xs" />}
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-semibold ${getSeverityBadge(inc.severity)}`}>
                    {inc.severity}
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-semibold ${getStatusBadge(inc.status)}`}>
                    {inc.status}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                {inc.description}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                    <FileText className="w-3 h-3 text-teal-400" />
                    <span>{reportCount} Correlated Reports</span>
                  </span>

                  {inc.ai_summary && (
                    <span className="flex items-center gap-1 text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                      <Sparkles className="w-3 h-3 text-purple-400" />
                      <span>AI Root Cause Analyzed</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 text-slate-400 group-hover:text-teal-400 transition-colors text-xs font-medium">
                  <span>View Details</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Incident Detail Modal */}
      {selectedIncident && (
        <IncidentDetailModal
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
          onIncidentUpdated={() => {
            onIncidentUpdated?.();
            setSelectedIncident(null);
          }}
          isAdmin={isAdmin}
        />
      )}
    </>
  );
};
