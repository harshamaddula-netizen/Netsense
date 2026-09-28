import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { TelemetryBadge } from '../components/common/TelemetryBadge';
import {
  Wifi,
  Activity,
  AlertTriangle,
  FileText,
  Sparkles,
  MapPin,
  Clock,
  ArrowRight,
  ShieldAlert,
  CheckCircle,
  PlusCircle,
  ChevronRight,
  Radio,
} from 'lucide-react';
import { ConnectedWifiCard } from '../features/network/ConnectedWifiCard';
import { AvailableNetworksCard } from '../features/network/AvailableNetworksCard';
import { ExactLocationTracer } from '../features/location/ExactLocationTracer';

export const StudentDashboard: React.FC = () => {
  const { user, selectedLocationId, setSelectedLocationId } = useAuth();
  const navigate = useNavigate();

  const { data: locations } = useQuery({
    queryKey: ['locations'],
    queryFn: () => api.getLocations(),
    refetchInterval: 15000,
  });

  const { data: userReports } = useQuery({
    queryKey: ['userReports', user?.id],
    queryFn: () => api.getReports({ userId: user?.id }),
    refetchInterval: 15000,
  });

  const { data: incidents } = useQuery({
    queryKey: ['activeIncidents'],
    queryFn: () => api.getIncidents('OPEN'),
    refetchInterval: 15000,
  });

  const currentLocation = locations?.find((l) => l.id === selectedLocationId) || locations?.[0];
  const m = currentLocation?.latest_measurement;
  const status = m?.status || 'NORMAL';

  // Find incidents in current location
  const localIncidents = incidents?.filter((i) => i.location_id === selectedLocationId) || [];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-100">
              Welcome, {user?.full_name?.split(' ')[0] || 'Student'}
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30 uppercase">
              {user?.role}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {user?.department || 'University Campus Network Portal'}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/monitor"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 transition-colors shadow-md shadow-teal-500/20 font-mono"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Live Monitor & Speed</span>
          </Link>

          <Link
            to="/diagnostics"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 transition-colors"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Run Diagnostic</span>
          </Link>

          <Link
            to="/reports/new"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5 text-teal-400" />
            <span>Report Issue</span>
          </Link>
        </div>
      </div>

      {/* Local Outage / Incident Warning Banner if present in selected zone */}
      {localIncidents.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/40 text-xs space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-300 font-bold font-mono">
              <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
              <span>ACTIVE OUTAGE / NETWORK INCIDENT IN YOUR CURRENT ZONE</span>
            </div>
            <Link to="/incidents" className="text-rose-300 hover:underline flex items-center gap-1">
              <span>View Incident Details</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <p className="text-slate-300 leading-relaxed">
            {localIncidents[0].title}: {localIncidents[0].description}
          </p>
        </div>
      )}

      {/* Live Device Wi-Fi Hardware Telemetry & GPS Physical Location Tracer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConnectedWifiCard />
        <ExactLocationTracer
          locations={locations || []}
          onLocationPinned={(locId) => setSelectedLocationId(locId)}
        />
      </div>

      {/* Available Networks Detected Around Device */}
      <AvailableNetworksCard />

      {/* Current Location Health Card */}
      <div className="p-6 rounded-2xl glass-panel-glow border border-slate-800 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              Connected Access Point Zone
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <MapPin className="w-4 h-4 text-teal-400" />
              <h2 className="text-base font-bold text-slate-100">{currentLocation?.name}</h2>
              <TelemetryBadge type={m?.source || 'REAL'} size="xs" />
            </div>
            <p className="text-xs text-slate-400">
              {currentLocation?.floor} • {currentLocation?.building}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Status:</span>
            <span
              className={`px-3 py-1 rounded-full font-mono text-xs font-bold uppercase border ${
                status === 'NORMAL'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : status === 'WARNING'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/30 animate-pulse'
              }`}
            >
              {status}
            </span>
          </div>
        </div>

        {/* Telemetry Numbers */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 font-mono text-center">
            <span className="text-[11px] text-slate-400">Round-Trip Latency</span>
            <div className="text-2xl font-bold text-slate-100 mt-1">
              {m ? `${m.latency_ms}` : '--'} <span className="text-xs font-normal text-slate-400">ms</span>
            </div>
            <span className="text-[10px] text-teal-400 mt-1 block">Ping Response</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 font-mono text-center">
            <span className="text-[11px] text-slate-400">Packet Loss</span>
            <div className="text-2xl font-bold text-slate-100 mt-1">
              {m ? `${m.packet_loss_percent}` : '--'} <span className="text-xs font-normal text-slate-400">%</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Frame Integrity</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 font-mono text-center">
            <span className="text-[11px] text-slate-400">Concurrent Devices</span>
            <div className="text-2xl font-bold text-slate-100 mt-1">
              {m?.device_count ?? '--'}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Airtime Sharing</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 font-mono text-center">
            <span className="text-[11px] text-slate-400">Availability</span>
            <div className="text-2xl font-bold text-slate-100 mt-1">
              {m ? `${m.availability_percent}` : '100'} <span className="text-xs font-normal text-slate-400">%</span>
            </div>
            <span className="text-[10px] text-emerald-400 mt-1 block">AP Uptime</span>
          </div>
        </div>

        {/* Diagnosis Note */}
        <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5">
          <Activity className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
          <span>
            {status === 'NORMAL'
              ? 'Your local access point is operating within nominal parameters. Streaming, gaming, and coursework should experience minimal latency.'
              : status === 'WARNING'
              ? 'High concurrent device density detected in your building. You may experience occasional buffering or delayed website loading.'
              : 'Severe radio congestion or packet loss is affecting this area. NetSense automated correlation has dispatched alert to network engineers.'}
          </span>
        </div>
      </div>

      {/* Recent User Reports & Tickets */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <FileText className="w-4 h-4 text-teal-400" />
            <span>My Submitted Reports & Tickets</span>
          </h2>
          <Link to="/reports" className="text-xs text-teal-400 hover:underline">
            View All ({userReports?.length || 0})
          </Link>
        </div>

        {userReports && userReports.length > 0 ? (
          <div className="space-y-2.5">
            {userReports.slice(0, 3).map((rep) => (
              <div
                key={rep.id}
                onClick={() => navigate('/reports')}
                className="p-3.5 rounded-xl glass-panel border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors flex items-center justify-between text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="font-semibold text-slate-200">{rep.category}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400">{rep.location_name}</span>
                  </div>
                  <p className="text-slate-300 line-clamp-1">{rep.description}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded font-mono text-[10px] uppercase font-semibold ${
                      rep.status === 'CORRELATED'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : rep.status === 'RESOLVED'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                    }`}
                  >
                    {rep.status}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-xl glass-panel border border-slate-800 text-center text-xs text-slate-400">
            You haven't filed any network issue reports yet.
          </div>
        )}
      </div>
    </div>
  );
};
