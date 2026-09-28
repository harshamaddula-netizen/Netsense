import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { TelemetryBadge } from '../../components/common/TelemetryBadge';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Sparkles,
  Layers,
  AlertTriangle,
  Lightbulb,
  CheckCircle,
} from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<string>('');

  const { data: overview } = useQuery({
    queryKey: ['analyticsOverview'],
    queryFn: () => api.getAnalyticsOverview(),
    refetchInterval: 15000,
  });

  const { data: networkSeries } = useQuery({
    queryKey: ['analyticsNetwork', selectedLocation],
    queryFn: () => api.getAnalyticsNetwork(selectedLocation || undefined),
    refetchInterval: 15000,
  });

  const { data: reportStats } = useQuery({
    queryKey: ['analyticsReports'],
    queryFn: () => api.getAnalyticsReports(),
    refetchInterval: 15000,
  });

  const { data: predictiveData } = useQuery({
    queryKey: ['predictiveInsights'],
    queryFn: () => api.getPredictiveInsights(),
  });

  return (
    <div className="space-y-6">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl glass-panel border border-slate-800">
          <span className="text-[11px] font-mono text-slate-400">Total Connected Devices</span>
          <div className="text-2xl font-black text-slate-100 mt-1 font-mono">
            {overview?.total_devices ?? '--'}
          </div>
          <span className="text-[10px] text-teal-400 font-mono mt-1 block">Live Concurrency</span>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-slate-800">
          <span className="text-[11px] font-mono text-slate-400">Campus Avg RTT Latency</span>
          <div className="text-2xl font-black text-slate-100 mt-1 font-mono">
            {overview?.avg_latency_ms ?? '--'} <span className="text-xs font-normal text-slate-400">ms</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono mt-1 block">Backbone Normal</span>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-slate-800">
          <span className="text-[11px] font-mono text-slate-400">Congested Zones</span>
          <div className="text-2xl font-black text-amber-400 mt-1 font-mono">
            {overview?.congested_zones_count ?? 0} <span className="text-xs font-normal text-slate-400">/ 8 APs</span>
          </div>
          <span className="text-[10px] text-amber-400 font-mono mt-1 block">Threshold Exceeded</span>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-slate-800">
          <span className="text-[11px] font-mono text-slate-400">Active Campus Incidents</span>
          <div className="text-2xl font-black text-rose-400 mt-1 font-mono">
            {overview?.active_incidents ?? 0}
          </div>
          <span className="text-[10px] text-slate-400 font-mono mt-1 block">
            {overview?.unresolved_reports ?? 0} correlated reports
          </span>
        </div>
      </div>

      {/* Chart 1: Device Concurrency Over Time */}
      <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-400" />
              <span>Campus Device Concurrency & Load Curve</span>
            </h3>
            <p className="text-xs text-slate-400">Simultaneous connected user devices across campus access points</p>
          </div>
          <TelemetryBadge type="REAL" size="xs" />
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={networkSeries || []}>
              <defs>
                <linearGradient id="deviceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="device_count" name="Connected Devices" stroke="#14b8a6" strokeWidth={2} fillOpacity={1} fill="url(#deviceGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Latency & Packet Loss Curves */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100">Round-Trip Latency (ms)</h3>
            <span className="text-[10px] font-mono text-teal-400">SLA Warning: 70ms</span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={networkSeries || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Line type="monotone" dataKey="latency_ms" name="Latency (ms)" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Peak Congestion Hours Distribution */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100">Peak Congestion Windows (Hourly)</h3>
            <span className="text-[10px] font-mono text-slate-400">Campus Daily Index</span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportStats?.peak_hours || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hour" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="congestion_index" name="Congestion Index" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Section 4.10: Predictive Network Intelligence */}
      <div className="rounded-2xl glass-panel-glow border border-indigo-500/40 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-500/20 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-slate-100">Predictive Network Intelligence</h3>
              <TelemetryBadge type="TREND" size="xs" />
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Statistical detection of repeated congestion periods and location vulnerabilities based on historical measurements.
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            Verified Trend Engine
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {predictiveData?.insights?.map((item: any) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-slate-900/80 border border-indigo-500/20 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between text-indigo-300 font-mono text-[11px]">
                <span className="font-semibold">{item.recurring_window}</span>
                <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-[10px]">
                  Risk: {item.risk_score}%
                </span>
              </div>
              <h4 className="font-semibold text-slate-200">{item.target}</h4>
              <p className="text-slate-400 text-[11px] leading-relaxed">{item.observation}</p>
              <div className="pt-2 border-t border-slate-800 text-[11px] text-teal-300 flex items-start gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                <span>{item.recommendation}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
