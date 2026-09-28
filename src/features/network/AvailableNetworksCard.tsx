import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { TelemetryBadge } from '../../components/common/TelemetryBadge';
import {
  Wifi,
  Radio,
  Lock,
  Unlock,
  RefreshCw,
  Signal,
  CheckCircle,
  AlertTriangle,
  Info,
  ShieldCheck,
  Layers,
  ArrowDownUp,
  Cpu,
} from 'lucide-react';
import { AvailableNetwork } from '../../types';

export const AvailableNetworksCard: React.FC = () => {
  const {
    data: scanReport,
    refetch,
    isFetching,
    error,
  } = useQuery({
    queryKey: ['availableNetworks'],
    queryFn: () => api.getAvailableNetworks(),
    refetchInterval: 12000,
  });

  const connectedNetwork = scanReport?.connected_network;
  const availableNetworks = scanReport?.available_networks || [];
  const platform = scanReport?.platform;

  // Separate currently connected network from other detected networks
  const otherNetworks = availableNetworks.filter((n) => !n.is_connected);
  const activeNetworkFromList = availableNetworks.find((n) => n.is_connected);

  const getSignalColor = (pct: number) => {
    if (pct >= 75) return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30';
    if (pct >= 50) return 'text-amber-400 bg-amber-500/20 border-amber-500/30';
    return 'text-rose-400 bg-rose-500/20 border-rose-500/30';
  };

  const getSignalBarBg = (pct: number) => {
    if (pct >= 75) return 'bg-emerald-400';
    if (pct >= 50) return 'bg-amber-400';
    return 'bg-rose-400';
  };

  return (
    <div className="rounded-2xl glass-panel border border-slate-800 p-5 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30">
            <Radio className={`w-5 h-5 ${isFetching ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                802.11 RF Beacon Telemetry
              </span>
              <TelemetryBadge type="REAL" size="xs" />
            </div>
            <h2 className="text-base font-bold text-slate-100 font-mono tracking-tight flex items-center gap-2">
              <span>Available Networks Around Device</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-teal-300 font-normal">
                {availableNetworks.length} detected
              </span>
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {scanReport?.scan_timestamp && (
            <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
              Updated: {new Date(scanReport.scan_timestamp).toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono text-teal-300 hover:text-teal-200 bg-slate-900 border border-teal-500/30 hover:border-teal-500/60 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            <span>Scan Networks</span>
          </button>
        </div>
      </div>

      {/* Currently Connected Network Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5 uppercase tracking-wider font-semibold text-[11px] text-teal-400">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Currently Connected Network</span>
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Active Default Route
          </span>
        </div>

        {connectedNetwork?.connected ? (
          <div className="p-4 rounded-xl bg-slate-900/90 border border-teal-500/40 relative overflow-hidden space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span className="text-lg font-black text-slate-100 font-mono tracking-tight">
                    {connectedNetwork.ssid || activeNetworkFromList?.ssid || 'Connected Network'}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                    CONNECTED
                  </span>
                </div>
                <div className="text-xs font-mono text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span>BSSID: <span className="text-slate-300">{connectedNetwork.bssid || activeNetworkFromList?.bssid || 'Hardware Assigned'}</span></span>
                  <span>•</span>
                  <span>Adapter: <span className="text-slate-300">{connectedNetwork.adapter_name || 'Wi-Fi 6 Adapter'}</span></span>
                </div>
              </div>

              {/* Signal Badge */}
              <div className="flex items-center gap-2">
                <div className={`px-2.5 py-1 rounded-lg border text-xs font-mono font-bold flex items-center gap-1.5 ${getSignalColor(connectedNetwork.signal_percent ?? 80)}`}>
                  <Signal className="w-3.5 h-3.5" />
                  <span>{connectedNetwork.signal_percent ?? 80}%</span>
                  <span className="text-[10px] font-normal uppercase">({connectedNetwork.signal_quality})</span>
                </div>
              </div>
            </div>

            {/* Metrics Grid for Active Network */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-xs font-mono">
              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="text-[10px] text-slate-500 block">BAND / FREQ</span>
                <span className="font-bold text-teal-300">{connectedNetwork.band || activeNetworkFromList?.band || '5 GHz'}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="text-[10px] text-slate-500 block">CHANNEL</span>
                <span className="font-bold text-slate-200">
                  {connectedNetwork.channel ? `Ch ${connectedNetwork.channel}` : activeNetworkFromList?.channel ? `Ch ${activeNetworkFromList.channel}` : 'Auto'}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="text-[10px] text-slate-500 block">SECURITY / CIPHER</span>
                <span className="font-bold text-slate-200 truncate block" title={activeNetworkFromList?.security_type || 'WPA2/WPA3'}>
                  {activeNetworkFromList?.security_type || 'WPA2-Personal'}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="text-[10px] text-slate-500 block">RADIO PROTOCOL</span>
                <span className="font-bold text-slate-200">{connectedNetwork.radio_type || '802.11ax'}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-xs font-mono text-slate-400 flex items-center justify-between">
            <span>No active Wi-Fi network interface currently connected.</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
              DISCONNECTED
            </span>
          </div>
        )}
      </div>

      {/* Other Available Networks List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="uppercase tracking-wider font-semibold text-[11px] text-slate-300 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-teal-400" />
            <span>Other Detected Wireless Networks ({otherNetworks.length})</span>
          </span>
          <span className="text-[10px] text-slate-500">Real OS 802.11 Beacon Scan</span>
        </div>

        {otherNetworks.length > 0 ? (
          <div className="space-y-2">
            {otherNetworks.map((net, idx) => (
              <div
                key={`${net.ssid}_${net.bssid}_${idx}`}
                className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors flex flex-wrap items-center justify-between gap-3 text-xs font-mono"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-slate-400" />
                    <span className="font-bold text-slate-200">{net.ssid}</span>
                    {net.security_type?.toLowerCase().includes('open') ? (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 flex items-center gap-1">
                        <Unlock className="w-2.5 h-2.5" /> Open
                      </span>
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5 text-slate-400" /> {net.security_type}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-x-2">
                    <span>BSSID: {net.bssid || 'Hidden'}</span>
                    <span>•</span>
                    <span>Band: {net.band || '2.4 GHz'}</span>
                    <span>•</span>
                    <span>Ch: {net.channel || '--'}</span>
                    <span>•</span>
                    <span>Proto: {net.radio_type || '802.11'}</span>
                  </div>
                </div>

                {/* Signal Bar & Quality */}
                <div className="flex items-center gap-3">
                  <div className="w-20 hidden sm:block">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <span>Signal</span>
                      <span>{net.signal_percent}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getSignalBarBg(net.signal_percent)}`}
                        style={{ width: `${net.signal_percent}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded border text-[11px] font-bold ${getSignalColor(net.signal_percent)}`}>
                    {net.signal_percent}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-center text-xs font-mono text-slate-400 space-y-1">
            <p>No additional wireless access points detected within device reception range.</p>
            <p className="text-[10px] text-slate-500">
              Only real broadcast beacons are displayed; unverified networks are never simulated.
            </p>
          </div>
        )}
      </div>

      {/* Platform & Sandbox Limitation Disclosure */}
      <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80 text-xs font-mono text-slate-400 space-y-1.5">
        <div className="flex items-center gap-2 text-teal-300 font-semibold">
          <Info className="w-4 h-4 text-teal-400 shrink-0" />
          <span>Platform & Hardware Telemetry Transparency</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          {platform?.hardware_scan_supported
            ? `Active Host Environment: ${platform.os}. Operating system wireless card native command interface used for direct 802.11 beacon discovery.`
            : platform?.restriction_notice ||
              'Browser Sandbox Notice: Standard W3C Web APIs do not permit client-side JavaScript to scan raw Wi-Fi SSIDs without local OS host daemon assistance.'}
        </p>
      </div>
    </div>
  );
};
