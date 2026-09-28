import React, { useState } from 'react';
import { NetworkHistoryRecord } from '../../types';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  History,
  Trash2,
  Download,
  Calendar,
  ArrowDown,
  ArrowUp,
  Clock,
  Activity,
  MapPin,
  Shield,
  FileSpreadsheet,
} from 'lucide-react';

interface NetworkHistorySectionProps {
  history: NetworkHistoryRecord[];
  onClearHistory: () => void;
}

export const NetworkHistorySection: React.FC<NetworkHistorySectionProps> = ({
  history,
  onClearHistory,
}) => {
  const [activeTab, setActiveTab] = useState<'GRAPH' | 'TABLE'>('GRAPH');

  // Format chart data (chronological)
  const chartData = [...history].reverse().map((item) => ({
    time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    download: item.download_speed_mbps,
    upload: item.upload_speed_mbps,
    latency: item.latency_ms,
    jitter: item.jitter_ms,
  }));

  // Export history as JSON
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `netsense_history_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export history as CSV
  const handleExportCsv = () => {
    const headers = ['Timestamp', 'Download_Mbps', 'Upload_Mbps', 'Ping_ms', 'Jitter_ms', 'Loss_Percent', 'Network', 'Latitude', 'Longitude', 'Status'];
    const rows = history.map((h) => [
      h.timestamp,
      h.download_speed_mbps,
      h.upload_speed_mbps,
      h.latency_ms,
      h.jitter_ms,
      h.packet_loss_percent,
      `"${h.network_name}"`,
      h.location?.latitude || '',
      h.location?.longitude || '',
      h.status,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodeURI(csvContent));
    downloadAnchor.setAttribute('download', `netsense_history_${Date.now()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="rounded-2xl glass-panel border border-slate-800 p-5 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <History className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
              Persistent Local Storage Telemetry
            </span>
            <h2 className="text-base font-bold text-slate-100 font-mono tracking-tight flex items-center gap-2">
              <span>Network Measurement History</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-purple-300 font-normal">
                {history.length} records
              </span>
            </h2>
          </div>
        </div>

        {/* View Switcher & Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Tab Buttons */}
          <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setActiveTab('GRAPH')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                activeTab === 'GRAPH'
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Performance Graph
            </button>
            <button
              onClick={() => setActiveTab('TABLE')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                activeTab === 'TABLE'
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Records Table
            </button>
          </div>

          {/* Export CSV / JSON */}
          {history.length > 0 && (
            <>
              <button
                onClick={handleExportCsv}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
                title="Export history as CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-teal-400" />
                <span className="hidden sm:inline">CSV</span>
              </button>

              <button
                onClick={handleExportJson}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
                title="Export history as JSON"
              >
                <Download className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden sm:inline">JSON</span>
              </button>

              <button
                onClick={onClearHistory}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono text-rose-300 hover:text-rose-200 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-colors"
                title="Clear all stored network history"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear History</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content Area */}
      {history.length === 0 ? (
        <div className="p-8 rounded-xl bg-slate-900/40 border border-slate-800 text-center font-mono space-y-2">
          <History className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-xs text-slate-300">No network measurements recorded yet.</p>
          <p className="text-[11px] text-slate-500">
            Click &apos;Run Speed Test&apos; above or start continuous monitoring to log verified throughput, latency, and packet loss.
          </p>
        </div>
      ) : activeTab === 'GRAPH' ? (
        /* Recharts Interactive Area Chart */
        <div className="space-y-3">
          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="downloadGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="uploadGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="latencyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingTop: '10px' }}
                />
                <Area
                  type="monotone"
                  dataKey="download"
                  name="Download (Mbps)"
                  stroke="#14b8a6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#downloadGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="upload"
                  name="Upload (Mbps)"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#uploadGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="latency"
                  name="Ping (ms)"
                  stroke="#a855f7"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  fillOpacity={1}
                  fill="url(#latencyGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1">
            <span>Left: Recent measurements</span>
            <span>Right: Most recent</span>
          </div>
        </div>
      ) : (
        /* Records Table View */
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Download</th>
                <th className="py-2.5 px-3">Upload</th>
                <th className="py-2.5 px-3">Ping</th>
                <th className="py-2.5 px-3">Jitter</th>
                <th className="py-2.5 px-3">Loss</th>
                <th className="py-2.5 px-3">Network</th>
                <th className="py-2.5 px-3">GPS Pin</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
              {history.map((record) => (
                <tr key={record.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-2.5 px-3 text-slate-300">
                    {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-teal-300">
                    {record.download_speed_mbps > 0 ? `${record.download_speed_mbps} Mbps` : '--'}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-cyan-300">
                    {record.upload_speed_mbps > 0 ? `${record.upload_speed_mbps} Mbps` : '--'}
                  </td>
                  <td className="py-2.5 px-3 text-slate-200">
                    {record.latency_ms} ms
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">
                    {record.jitter_ms} ms
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">
                    {record.packet_loss_percent}%
                  </td>
                  <td className="py-2.5 px-3 text-slate-300 truncate max-w-[120px]" title={record.network_name}>
                    {record.network_name}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">
                    {record.location ? (
                      <span className="flex items-center gap-1 text-cyan-400">
                        <MapPin className="w-3 h-3" />
                        <span>±{record.location.accuracy_meters}m</span>
                      </span>
                    ) : (
                      <span className="text-slate-600">None</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        record.status === 'GOOD'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : record.status === 'POOR'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
