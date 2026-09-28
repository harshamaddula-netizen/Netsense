import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { TelemetryBadge } from '../components/common/TelemetryBadge';
import { IncidentList } from '../features/incidents/IncidentList';
import { AlertOctagon, Filter, Shield, Plus } from 'lucide-react';

export const IncidentsPage: React.FC<{ adminView?: boolean }> = ({ adminView = false }) => {
  const { role } = useAuth();
  const isAdmin = role === 'admin' || adminView;
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const { data: incidents, refetch } = useQuery({
    queryKey: ['incidentsList', statusFilter],
    queryFn: () => (statusFilter === 'ALL' ? api.getIncidents() : api.getIncidents(statusFilter)),
    refetchInterval: 10000,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-6 h-6 text-rose-400" />
            <h1 className="text-xl font-bold text-slate-100">Campus Network Incidents</h1>
            <TelemetryBadge type="REAL" size="xs" />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Correlated outages, saturated access point zones, and official NOC remediation status.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono">
        <Filter className="w-3.5 h-3.5 text-slate-400 ml-1" />
        <span className="text-slate-400">Filter Lifecycle:</span>
        {['ALL', 'OPEN', 'INVESTIGATING', 'MITIGATED', 'RESOLVED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1 rounded-lg transition-colors font-medium ${
              statusFilter === st
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Incident List */}
      <IncidentList
        incidents={incidents || []}
        onIncidentUpdated={() => refetch()}
        showAdminControls={isAdmin}
      />
    </div>
  );
};
