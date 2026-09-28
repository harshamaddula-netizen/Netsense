import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { TelemetryBadge } from '../components/common/TelemetryBadge';
import { CampusHeatmap } from '../features/network/CampusHeatmap';
import {
  Wifi,
  Activity,
  AlertOctagon,
  Sparkles,
  Shield,
  ArrowRight,
  TrendingUp,
  FileText,
  PlayCircle,
  Radio,
  Layers,
  CheckCircle,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const { data: statusData } = useQuery({
    queryKey: ['campusStatus'],
    queryFn: () => api.getNetworkStatus(),
    refetchInterval: 15000,
  });

  const { data: locations } = useQuery({
    queryKey: ['locations'],
    queryFn: () => api.getLocations(),
  });

  const overallStatus = statusData?.overall_status || 'NORMAL';

  return (
    <div className="space-y-12 py-4">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl glass-panel-glow border border-teal-500/30 p-8 sm:p-12 text-center space-y-6">
        {/* Glow orb background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/30 text-xs font-mono font-medium">
          <Radio className="w-3.5 h-3.5 animate-pulse text-teal-400" />
          <span>Next-Generation Campus Wireless Intelligence</span>
        </div>

        <div className="space-y-3 max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Know the congestion <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-teal-400 via-emerald-300 to-cyan-400 bg-clip-text text-transparent">
              before the complaints.
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            NetSense Campus solves collegiate network bottlenecks by pairing safe in-browser client diagnostics with automated incident correlation, real-time AP heatmaps, and AI troubleshooting.
          </p>
        </div>

        {/* Call to Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to="/diagnostics"
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-lg shadow-teal-500/25 transition-all hover:scale-105"
          >
            <Activity className="w-4 h-4" />
            <span>Test My Connection Speed</span>
          </Link>

          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-xs bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-teal-500/40 transition-all"
          >
            <span>Enter Campus Portal</span>
            <ArrowRight className="w-4 h-4 text-teal-400" />
          </Link>

          <Link
            to="/admin"
            className="flex items-center gap-2 px-4 py-3 rounded-xl font-mono text-xs bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 transition-all"
          >
            <Shield className="w-4 h-4 text-purple-400" />
            <span>NOC Command Center</span>
          </Link>
        </div>

        {/* Live Status Ticker */}
        <div className="pt-6 border-t border-slate-800/80 max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3 text-left font-mono text-xs">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-500 text-[10px]">CAMPUS STATUS</span>
            <div className="flex items-center gap-1.5 font-bold text-slate-100 mt-1">
              <span className={`w-2 h-2 rounded-full ${overallStatus === 'NORMAL' ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              <span>{overallStatus}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-500 text-[10px]">CONCURRENT DEVICES</span>
            <div className="font-bold text-slate-100 mt-1">
              {statusData?.total_connected_devices ?? '--'} <span className="text-[10px] text-slate-400 font-normal">clients</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-500 text-[10px]">AVERAGE LATENCY</span>
            <div className="font-bold text-slate-100 mt-1">
              {statusData?.average_latency_ms ?? '--'} <span className="text-[10px] text-slate-400 font-normal">ms RTT</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-500 text-[10px]">ACTIVE INCIDENTS</span>
            <div className="font-bold text-slate-100 mt-1">
              {statusData?.active_incidents_count ?? 0} <span className="text-[10px] text-slate-400 font-normal">unresolved</span>
            </div>
          </div>
        </div>
      </section>

      {/* Structured Technical Workflow */}
      <section className="space-y-4">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold text-slate-100 font-mono">Structured Technical Workflow</h2>
          <p className="text-xs text-slate-400">Transforming subjective user complaints into actionable network telemetry</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-4 rounded-xl glass-panel border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center font-mono font-bold">
              01
            </div>
            <h3 className="font-bold text-slate-200">Detect & Diagnose</h3>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Safe in-browser RTT, jitter, and packet loss measurements verify whether latency is device-side or upstream.
            </p>
          </div>

          <div className="p-4 rounded-xl glass-panel border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-mono font-bold">
              02
            </div>
            <h3 className="font-bold text-slate-200">Understand & Assist</h3>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              NetSense AI suggests actionable step-by-step guidance before escalating unnecessary support tickets.
            </p>
          </div>

          <div className="p-4 rounded-xl glass-panel border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-mono font-bold">
              03
            </div>
            <h3 className="font-bold text-slate-200">Correlate & Group</h3>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Multiple student reports in the same building/floor automatically cluster into a unified actionable incident.
            </p>
          </div>

          <div className="p-4 rounded-xl glass-panel border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-mono font-bold">
              04
            </div>
            <h3 className="font-bold text-slate-200">Predict & Optimize</h3>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Historical trend analysis pinpoints recurring congestion periods so IT optimizes AP channels beforehand.
            </p>
          </div>
        </div>
      </section>

      {/* Live Campus Heatmap Preview */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-teal-400" />
              <span>Campus Radio Heatmap</span>
            </h2>
            <p className="text-xs text-slate-400">Real-time status across academic blocks, research halls, and dormitories</p>
          </div>
          <Link
            to="/network"
            className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1"
          >
            <span>Full Heatmap Topology</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {locations && <CampusHeatmap locations={locations} />}
      </section>
    </div>
  );
};
