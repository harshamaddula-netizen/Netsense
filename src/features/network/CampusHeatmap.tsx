import React, { useState } from 'react';
import { CampusLocation, NetworkStatus } from '../../types';
import { TelemetryBadge } from '../../components/common/TelemetryBadge';
import {
  Wifi,
  Users,
  Clock,
  AlertTriangle,
  FileText,
  Activity,
  ChevronRight,
  Info,
  Layers,
} from 'lucide-react';

interface CampusHeatmapProps {
  locations: CampusLocation[];
  onSelectLocation?: (location: CampusLocation) => void;
  selectedLocationId?: string;
}

export const CampusHeatmap: React.FC<CampusHeatmapProps> = ({
  locations,
  onSelectLocation,
  selectedLocationId,
}) => {
  const [activeModalLoc, setActiveModalLoc] = useState<CampusLocation | null>(null);

  const getStatusColor = (status?: NetworkStatus) => {
    switch (status) {
      case 'NORMAL':
        return {
          bg: 'bg-emerald-500/15',
          border: 'border-emerald-500/40',
          hoverBorder: 'hover:border-emerald-400',
          glow: 'shadow-[0_0_15px_rgba(16,185,129,0.15)]',
          pin: 'bg-emerald-500',
          text: 'text-emerald-400',
          ring: 'ring-emerald-500/30',
        };
      case 'WARNING':
        return {
          bg: 'bg-amber-500/15',
          border: 'border-amber-500/40',
          hoverBorder: 'hover:border-amber-400',
          glow: 'shadow-[0_0_20px_rgba(245,158,11,0.25)]',
          pin: 'bg-amber-500',
          text: 'text-amber-400',
          ring: 'ring-amber-500/30',
        };
      case 'CRITICAL':
        return {
          bg: 'bg-rose-500/20',
          border: 'border-rose-500/50',
          hoverBorder: 'hover:border-rose-400',
          glow: 'shadow-[0_0_25px_rgba(239,68,68,0.3)] animate-pulse',
          pin: 'bg-rose-500',
          text: 'text-rose-400',
          ring: 'ring-rose-500/30',
        };
      case 'UNKNOWN':
      default:
        return {
          bg: 'bg-slate-800/40',
          border: 'border-slate-700',
          hoverBorder: 'hover:border-slate-500',
          glow: '',
          pin: 'bg-slate-500',
          text: 'text-slate-400',
          ring: 'ring-slate-500/30',
        };
    }
  };

  return (
    <div className="space-y-4">
      {/* Legend & Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-teal-400" />
          <span className="text-xs font-semibold text-slate-200">Interactive Campus Radio Heatmap</span>
          <span className="text-[11px] text-slate-400 hidden sm:inline">(Click zone for AP telemetry)</span>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-slate-300">Normal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="text-slate-300">Warning (Load)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
            <span className="text-slate-300">Critical</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-600"></span>
            <span className="text-slate-400">No Data</span>
          </div>
        </div>
      </div>

      {/* Grid of Campus Zones styled as a Campus Blueprint Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {locations.map((loc) => {
          const m = loc.latest_measurement;
          const status = m?.status || 'UNKNOWN';
          const theme = getStatusColor(status);
          const isSelected = selectedLocationId === loc.id;
          const hasIncidents = (loc.active_incident_count || 0) > 0;
          const isDemo = m?.source === 'DEMO';

          return (
            <div
              key={loc.id}
              onClick={() => {
                setActiveModalLoc(loc);
                onSelectLocation?.(loc);
              }}
              className={`cursor-pointer rounded-xl p-4 transition-all duration-200 relative overflow-hidden group border ${
                theme.bg
              } ${theme.border} ${theme.hoverBorder} ${theme.glow} ${
                isSelected ? 'ring-2 ring-teal-400 ring-offset-2 ring-offset-slate-950' : ''
              }`}
            >
              {/* Background Blueprint Grid Watermark */}
              <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-3 translate-y-3 group-hover:opacity-20 transition-opacity">
                <Wifi className="w-24 h-24 text-white" />
              </div>

              {/* Status Header */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${theme.pin} ${status === 'CRITICAL' ? 'animate-ping' : ''}`}></span>
                  <span className={`text-[11px] font-mono font-bold uppercase tracking-wider ${theme.text}`}>
                    {status}
                  </span>
                </div>
                {isDemo && <TelemetryBadge type="DEMO" size="xs" />}
              </div>

              {/* Location Title */}
              <h3 className="font-semibold text-sm text-slate-100 group-hover:text-teal-300 transition-colors line-clamp-1">
                {loc.name}
              </h3>
              <p className="text-[11px] text-slate-400 mb-3">
                {loc.floor} • {loc.building}
              </p>

              {/* Key Telemetry Badges */}
              <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-800/80 text-[11px] font-mono">
                <div className="bg-slate-950/60 p-1.5 rounded-lg text-center">
                  <div className="flex items-center justify-center gap-1 text-slate-400 text-[10px]">
                    <Users className="w-3 h-3 text-teal-400" />
                    <span>Dev</span>
                  </div>
                  <div className="font-bold text-slate-100 mt-0.5">{m?.device_count ?? '--'}</div>
                </div>

                <div className="bg-slate-950/60 p-1.5 rounded-lg text-center">
                  <div className="flex items-center justify-center gap-1 text-slate-400 text-[10px]">
                    <Clock className="w-3 h-3 text-teal-400" />
                    <span>RTT</span>
                  </div>
                  <div className="font-bold text-slate-100 mt-0.5">{m ? `${m.latency_ms}ms` : '--'}</div>
                </div>

                <div className="bg-slate-950/60 p-1.5 rounded-lg text-center">
                  <div className="flex items-center justify-center gap-1 text-slate-400 text-[10px]">
                    <Activity className="w-3 h-3 text-teal-400" />
                    <span>Loss</span>
                  </div>
                  <div className="font-bold text-slate-100 mt-0.5">{m ? `${m.packet_loss_percent}%` : '--'}</div>
                </div>
              </div>

              {/* Active Incident Warning Ribbon */}
              {hasIncidents && (
                <div className="mt-2.5 flex items-center justify-between text-[11px] px-2 py-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>{loc.active_incident_count} Active Outage/Incident</span>
                  </div>
                  <ChevronRight className="w-3 h-3" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Location Inspection Modal */}
      {activeModalLoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl glass-panel border border-slate-700 p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-100">{activeModalLoc.name}</h2>
                  <TelemetryBadge
                    type={activeModalLoc.latest_measurement?.source || 'REAL'}
                    size="xs"
                  />
                </div>
                <p className="text-xs text-slate-400">
                  {activeModalLoc.floor} • {activeModalLoc.building} (Coordinates: {activeModalLoc.latitude}, {activeModalLoc.longitude})
                </p>
              </div>
              <button
                onClick={() => setActiveModalLoc(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              {activeModalLoc.description || 'Standard wireless coverage cell under campus Wi-Fi infrastructure.'}
            </p>

            {/* Detailed Telemetry Status */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center font-mono">
                <span className="text-[10px] text-slate-400">Device Count</span>
                <p className="text-base font-bold text-slate-100 mt-1">
                  {activeModalLoc.latest_measurement?.device_count ?? '--'}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center font-mono">
                <span className="text-[10px] text-slate-400">Latency (RTT)</span>
                <p className="text-base font-bold text-slate-100 mt-1">
                  {activeModalLoc.latest_measurement?.latency_ms ?? '--'} ms
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center font-mono">
                <span className="text-[10px] text-slate-400">Packet Loss</span>
                <p className="text-base font-bold text-slate-100 mt-1">
                  {activeModalLoc.latest_measurement?.packet_loss_percent ?? '--'}%
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center font-mono">
                <span className="text-[10px] text-slate-400">Availability</span>
                <p className="text-base font-bold text-slate-100 mt-1">
                  {activeModalLoc.latest_measurement?.availability_percent ?? '--'}%
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <span className="text-[11px] text-slate-400 font-mono">
                Last Probe: {activeModalLoc.latest_measurement ? new Date(activeModalLoc.latest_measurement.measured_at).toLocaleTimeString() : 'Never'}
              </span>
              <button
                onClick={() => setActiveModalLoc(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-teal-500 hover:bg-teal-400 text-slate-950 transition-colors"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
