import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { TelemetryBadge } from '../components/common/TelemetryBadge';
import { Link } from 'react-router-dom';
import {
  FileText,
  MapPin,
  Clock,
  Laptop,
  CheckCircle,
  Filter,
  PlusCircle,
  Activity,
  Layers,
} from 'lucide-react';

export const ReportsPage: React.FC<{ adminView?: boolean }> = ({ adminView = false }) => {
  const { user, role } = useAuth();
  const isAdmin = role === 'admin' || adminView;

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedLocFilter, setSelectedLocFilter] = useState<string>('ALL');

  const { data: reports, refetch } = useQuery({
    queryKey: ['reportsList', isAdmin ? 'all' : user?.id],
    queryFn: () => (isAdmin ? api.getReports() : api.getReports({ userId: user?.id })),
    refetchInterval: 10000,
  });

  const { data: locations } = useQuery({
    queryKey: ['locations'],
    queryFn: () => api.getLocations(),
  });

  const filteredReports = reports?.filter((r) => {
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const matchesLoc = selectedLocFilter === 'ALL' || r.location_id === selectedLocFilter;
    return matchesStatus && matchesLoc;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-teal-400" />
            <h1 className="text-xl font-bold text-slate-100">
              {isAdmin ? 'All Campus Incident Reports' : 'My Network Reports & Tickets'}
            </h1>
            <TelemetryBadge type="REPORT" size="xs" />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isAdmin
              ? 'Complete operational stream of user complaints across campus access point clusters.'
              : 'Track the status and correlation of issues you have submitted to network operations.'}
          </p>
        </div>

        {!isAdmin && (
          <Link
            to="/reports/new"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-xs bg-teal-500 hover:bg-teal-400 text-slate-950 transition-colors shadow-md shadow-teal-500/10"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Submit New Issue</span>
          </Link>
        )}
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-mono text-slate-400">Status:</span>
          {['ALL', 'SUBMITTED', 'CORRELATED', 'INVESTIGATING', 'RESOLVED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-colors ${
                statusFilter === st
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 font-mono text-slate-400">
          <span>Location:</span>
          <select
            value={selectedLocFilter}
            onChange={(e) => setSelectedLocFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-teal-500 font-sans"
          >
            <option value="ALL">All Campus Zones</option>
            {locations?.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Reports Feed */}
      <div className="space-y-3">
        {filteredReports && filteredReports.length > 0 ? (
          filteredReports.map((rep) => {
            const isCorrelated = rep.status === 'CORRELATED';

            return (
              <div
                key={rep.id}
                className="p-4 rounded-xl glass-panel border border-slate-800 hover:border-slate-700 transition-colors space-y-2.5 text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="font-bold text-slate-200">
                      {rep.user_name || 'Anonymous User'}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-teal-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {rep.location_name}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(rep.created_at).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-slate-800 text-slate-300">
                      {rep.category.replace(/_/g, ' ')}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded font-mono text-[10px] uppercase font-semibold border ${
                        rep.status === 'CORRELATED'
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                          : rep.status === 'RESOLVED'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                      }`}
                    >
                      {rep.status}
                    </span>
                  </div>
                </div>

                <p className="text-slate-300 leading-relaxed">{rep.description}</p>

                {/* Extra Details */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60 font-mono text-[11px] text-slate-400">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Laptop className="w-3 h-3 text-slate-500" />
                      <span>{rep.device_type}</span>
                    </span>

                    {rep.diagnostic_data && (
                      <span className="flex items-center gap-1 text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                        <Activity className="w-3 h-3 text-cyan-400" />
                        <span>{rep.diagnostic_data.latency_ms}ms RTT • {rep.diagnostic_data.packet_loss_percent}% Loss</span>
                      </span>
                    )}
                  </div>

                  {isCorrelated && rep.incident_id && (
                    <span className="text-purple-300 font-semibold">
                      Attached to Incident #{rep.incident_id.substring(0, 8)}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center rounded-2xl glass-panel border border-slate-800 text-slate-400 text-xs">
            No network reports match the selected filters.
          </div>
        )}
      </div>
    </div>
  );
};
