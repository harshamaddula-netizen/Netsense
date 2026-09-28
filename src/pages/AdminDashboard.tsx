import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { TelemetryBadge } from '../components/common/TelemetryBadge';
import { CampusHeatmap } from '../features/network/CampusHeatmap';
import { IncidentList } from '../features/incidents/IncidentList';
import {
  Shield,
  Activity,
  AlertOctagon,
  Users,
  Clock,
  Radio,
  Sliders,
  PlayCircle,
  Bot,
  Layers,
  ArrowRight,
  TrendingUp,
  FileText,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const { data: statusData, refetch: refetchStatus } = useQuery({
    queryKey: ['campusStatus'],
    queryFn: () => api.getNetworkStatus(),
    refetchInterval: 10000,
  });

  const { data: locations, refetch: refetchLocations } = useQuery({
    queryKey: ['locations'],
    queryFn: () => api.getLocations(),
    refetchInterval: 10000,
  });

  const { data: incidents, refetch: refetchIncidents } = useQuery({
    queryKey: ['activeIncidents'],
    queryFn: () => api.getIncidents(),
    refetchInterval: 10000,
  });

  const { data: reports } = useQuery({
    queryKey: ['recentReports'],
    queryFn: () => api.getReports(),
    refetchInterval: 10000,
  });

  const activeIncidents = incidents?.filter((i) => i.status !== 'RESOLVED') || [];
  const criticalLocations = locations?.filter((l) => l.latest_measurement?.status === 'CRITICAL') || [];
  const warningLocations = locations?.filter((l) => l.latest_measurement?.status === 'WARNING') || [];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl glass-panel-glow border border-purple-500/30 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-purple-400" />
            <h1 className="text-xl font-black text-slate-100 font-mono tracking-tight">
              Network Operations Command Center (NOC)
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase font-bold">
              ADMIN MODE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-AP telemetry, crowd report correlation, and incident lifecycle management.
          </p>
        </div>

        {/* Quick Admin Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/admin/simulator"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-colors shadow-sm"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span>Launch Simulator</span>
          </Link>

          <Link
            to="/admin/thresholds"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-teal-400" />
            <span>SLA Thresholds</span>
          </Link>

          <Link
            to="/admin/ai"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Intelligence</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl glass-panel border border-slate-800">
          <span className="text-[11px] font-mono text-slate-400">Total Connected Devices</span>
          <div className="text-2xl font-black text-slate-100 font-mono mt-1">
            {statusData?.total_connected_devices ?? '--'}
          </div>
          <span className="text-[10px] text-teal-400 font-mono mt-1 block">Live Concurrency</span>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-slate-800">
          <span className="text-[11px] font-mono text-slate-400">Campus Avg RTT Latency</span>
          <div className="text-2xl font-black text-slate-100 font-mono mt-1">
            {statusData?.average_latency_ms ?? '--'} <span className="text-xs font-normal text-slate-400">ms</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono mt-1 block">Nominal SLA</span>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-slate-800">
          <span className="text-[11px] font-mono text-slate-400">Degraded AP Zones</span>
          <div className="text-2xl font-black text-amber-400 font-mono mt-1">
            {warningLocations.length + criticalLocations.length} <span className="text-xs font-normal text-slate-400">/ 8</span>
          </div>
          <span className="text-[10px] text-amber-400 font-mono mt-1 block">
            {criticalLocations.length} Critical • {warningLocations.length} Warning
          </span>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-slate-800">
          <span className="text-[11px] font-mono text-slate-400">Active Correlated Incidents</span>
          <div className="text-2xl font-black text-rose-400 font-mono mt-1">
            {activeIncidents.length}
          </div>
          <span className="text-[10px] text-rose-400 font-mono mt-1 block">Requires Investigation</span>
        </div>
      </div>

      {/* Interactive Heatmap Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-teal-400" />
            <span>Campus Radio Heatmap & AP Topology</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">Live WebSocket/Polling</span>
        </div>

        {locations && <CampusHeatmap locations={locations} />}
      </div>

      {/* Incidents & Reports Two-Column Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        {/* Active Incidents */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-rose-400" />
              <span>Prioritized Correlated Incidents</span>
            </h2>
            <Link to="/admin/incidents" className="text-xs text-teal-400 hover:underline">
              Manage All ({incidents?.length || 0})
            </Link>
          </div>

          <IncidentList
            incidents={activeIncidents.slice(0, 4)}
            onIncidentUpdated={() => {
              refetchIncidents();
              refetchStatus();
              refetchLocations();
            }}
            showAdminControls={true}
          />
        </div>

        {/* Real-time Student Complaint Stream */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-400" />
              <span>Crowd Reports Stream</span>
            </h2>
            <Link to="/admin/reports" className="text-xs text-teal-400 hover:underline">
              View Feed ({reports?.length || 0})
            </Link>
          </div>

          <div className="space-y-2.5">
            {reports?.slice(0, 4).map((rep) => (
              <div
                key={rep.id}
                className="p-3.5 rounded-xl glass-panel border border-slate-800 space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-200">{rep.user_name || 'Anonymous'}</span>
                    <span className="text-[10px] text-teal-400">({rep.user_role})</span>
                  </div>
                  <span>{new Date(rep.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-slate-300 line-clamp-1">{rep.description}</p>
                <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-slate-400">
                  <span className="text-teal-300">{rep.location_name}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded font-semibold uppercase ${
                      rep.status === 'CORRELATED'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {rep.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
