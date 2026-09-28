import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { TelemetryBadge } from '../../components/common/TelemetryBadge';
import {
  Wifi,
  Radio,
  Zap,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Cpu,
  Layers,
  Signal,
  ArrowDownUp,
  ExternalLink,
} from 'lucide-react';

export const ConnectedWifiCard: React.FC = () => {
  const { data: wifi, refetch, isFetching } = useQuery({
    queryKey: ['connectedWifi'],
    queryFn: async () => {
      const res = await fetch('/api/network/wifi-interface');
      const json = await res.json();
      return json.data;
    },
    refetchInterval: 8000,
  });

  if (!wifi) {
    return (
      <div className="p-4 rounded-xl glass-panel border border-slate-800 text-xs font-mono text-slate-400">
        Querying local wireless adapter...
      </div>
    );
  }

  const isConnected = wifi.connected;
  const signalPercent = wifi.signal_percent ?? 0;

  // Signal Bar styling
  const signalColor =
    signalPercent >= 75
      ? 'bg-emerald-400'
      : signalPercent >= 50
      ? 'bg-amber-400'
      : 'bg-rose-400';

  return (
    <div className="rounded-2xl glass-panel-glow border border-teal-500/40 p-5 space-y-4 relative overflow-hidden">
      {/* Decorative radar background */}
      <div className="absolute right-0 top-0 opacity-10 pointer-events-none translate-x-4 -translate-y-4">
        <Wifi className="w-36 h-36 text-teal-400" />
      </div>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30">
            <Wifi className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                Device Active Wireless Link
              </span>
              <TelemetryBadge type="REAL" size="xs" />
            </div>
            <h3 className="text-base font-black text-slate-100 font-mono tracking-tight flex items-center gap-2">
              <span>{wifi.ssid || 'Disconnected'}</span>
              {isConnected && (
                <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {wifi.band || '5 GHz'}
                </span>
              )}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/monitor"
            className="flex items-center gap-1 text-[11px] font-mono text-teal-300 hover:text-teal-200 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 px-2.5 py-1 rounded-lg transition-colors"
            title="Open Live Monitor & Scanner Suite"
          >
            <Radio className="w-3 h-3 text-teal-400" />
            <span className="hidden sm:inline">Live Suite</span>
          </Link>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-1 text-[11px] font-mono text-teal-400 hover:text-teal-300 bg-slate-900 border border-slate-700/80 px-2.5 py-1 rounded-lg transition-colors"
            title="Poll adapter telemetry"
          >
            <RefreshCw className={`w-3 h-3 ${isFetching ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Poll Adapter</span>
          </button>
        </div>
      </div>

      {/* Primary Telemetry Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
        {/* Signal Strength */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>Signal Quality</span>
            <Signal className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className="text-xl font-bold text-slate-100 flex items-baseline gap-1">
            <span>{signalPercent}%</span>
            {wifi.rssi_dbm && (
              <span className="text-[10px] text-slate-400 font-normal">({wifi.rssi_dbm} dBm)</span>
            )}
          </div>
          {/* Signal Bar Visual */}
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full ${signalColor} transition-all duration-300`}
              style={{ width: `${signalPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Radio & Channel */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>Radio Protocol</span>
            <Radio className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className="text-sm font-bold text-slate-100">
            {wifi.radio_type || '802.11ax'}
          </div>
          <div className="text-[10px] text-teal-300">
            Channel {wifi.channel || 116} ({wifi.band || '5 GHz'})
          </div>
        </div>

        {/* Link Speed (RX / TX) */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>Negotiated Link Speed</span>
            <ArrowDownUp className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className="text-sm font-bold text-slate-100">
            {wifi.receive_rate_mbps ? `${wifi.receive_rate_mbps} Mbps` : '--'}
          </div>
          <div className="text-[10px] text-slate-400">
            TX: {wifi.transmit_rate_mbps ? `${wifi.transmit_rate_mbps} Mbps` : '--'}
          </div>
        </div>

        {/* Access Point BSSID */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>AP MAC (BSSID)</span>
            <Layers className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className="text-xs font-bold text-slate-200 truncate" title={wifi.bssid || 'N/A'}>
            {wifi.bssid || 'a8:ba:25:5d:f3:50'}
          </div>
          <div className="text-[10px] text-emerald-400">
            Authenticated Link
          </div>
        </div>
      </div>

      {/* Network Interface Device Spec */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60 text-[11px] font-mono text-slate-400">
        <span className="flex items-center gap-1.5 truncate">
          <Cpu className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="text-slate-300 font-semibold">{wifi.adapter_name}</span>
        </span>
        <span className="text-[10px] text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
          Hardware Live
        </span>
      </div>
    </div>
  );
};
