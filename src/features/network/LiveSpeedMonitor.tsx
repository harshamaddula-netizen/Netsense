import React, { useState, useEffect, useRef } from 'react';
import { speedTestService, SpeedTestProgress } from '../../services/speedTestService';
import { LiveSpeedMeasurement, NetworkHistoryRecord } from '../../types';
import { GPSCoordinates } from '../../utils/geolocation';
import { TelemetryBadge } from '../../components/common/TelemetryBadge';
import {
  Activity,
  Play,
  Square,
  Zap,
  RotateCcw,
  ArrowDown,
  ArrowUp,
  Clock,
  Wifi,
  WifiOff,
  Signal,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Settings2,
  Shield,
  Layers,
  Globe,
} from 'lucide-react';

interface LiveSpeedMonitorProps {
  deviceLocation?: GPSCoordinates | null;
  onNewMeasurement?: (measurement: NetworkHistoryRecord) => void;
}

export const LiveSpeedMonitor: React.FC<LiveSpeedMonitorProps> = ({
  deviceLocation,
  onNewMeasurement,
}) => {
  const [isTesting, setIsTesting] = useState(false);
  const [testProgress, setTestProgress] = useState<SpeedTestProgress | null>(null);
  const [latestMeasurement, setLatestMeasurement] = useState<LiveSpeedMeasurement | null>(null);

  // Continuous monitoring state
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [monitorIntervalSec, setMonitorIntervalSec] = useState(15);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Live online/offline state
  const [isBrowserOnline, setIsBrowserOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  const monitoringTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Listen to browser network connectivity events
  useEffect(() => {
    const handleOnline = () => setIsBrowserOnline(true);
    const handleOffline = () => setIsBrowserOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      const conn = (navigator as any).connection;
      conn?.addEventListener?.('change', () => {
        // Trigger background refresh when connection type changes
        if (!isTesting) {
          speedTestService.runLightweightMonitorProbe(
            deviceLocation
              ? {
                  latitude: deviceLocation.latitude,
                  longitude: deviceLocation.longitude,
                  accuracy_meters: deviceLocation.accuracyMeters,
                }
              : null
          ).then((res) => setLatestMeasurement(res));
        }
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [deviceLocation, isTesting]);

  // Run full speed test
  const runFullTest = async () => {
    if (isTesting) return;
    setIsTesting(true);

    try {
      const loc = deviceLocation
        ? {
            latitude: deviceLocation.latitude,
            longitude: deviceLocation.longitude,
            accuracy_meters: deviceLocation.accuracyMeters,
          }
        : null;

      const result = await speedTestService.runFullSpeedTest((progress) => {
        setTestProgress(progress);
      }, loc);

      setLatestMeasurement(result);

      // Save to network history
      const historyRecord: NetworkHistoryRecord = {
        id: result.id,
        timestamp: result.timestamp,
        download_speed_mbps: result.download_speed_mbps,
        upload_speed_mbps: result.upload_speed_mbps,
        latency_ms: result.latency_ms,
        jitter_ms: result.jitter_ms,
        packet_loss_percent: result.packet_loss_percent,
        network_name: result.network_type || 'Active Wi-Fi',
        network_type: result.network_type || '802.11',
        signal_percent: result.signal_percent ?? null,
        client_ip: result.client_ip,
        status:
          result.connection_status === 'GOOD'
            ? 'GOOD'
            : result.connection_status === 'POOR'
            ? 'POOR'
            : result.connection_status === 'DISCONNECTED'
            ? 'DISCONNECTED'
            : 'FAIR',
        location: loc,
      };

      onNewMeasurement?.(historyRecord);
    } catch (err) {
      console.error('Speed test error:', err);
    } finally {
      setIsTesting(false);
      setTestProgress(null);
    }
  };

  // Continuous monitoring loop
  useEffect(() => {
    if (isMonitoring) {
      // Run initial lightweight probe immediately
      speedTestService
        .runLightweightMonitorProbe(
          deviceLocation
            ? {
                latitude: deviceLocation.latitude,
                longitude: deviceLocation.longitude,
                accuracy_meters: deviceLocation.accuracyMeters,
              }
            : null
        )
        .then((res) => setLatestMeasurement(res));

      monitoringTimerRef.current = setInterval(() => {
        speedTestService
          .runLightweightMonitorProbe(
            deviceLocation
              ? {
                  latitude: deviceLocation.latitude,
                  longitude: deviceLocation.longitude,
                  accuracy_meters: deviceLocation.accuracyMeters,
                }
              : null
          )
          .then((res) => {
            setLatestMeasurement((prev) => ({
              ...res,
              // Preserve latest full download/upload figures if present
              download_speed_mbps: prev?.download_speed_mbps ?? 0,
              upload_speed_mbps: prev?.upload_speed_mbps ?? 0,
            }));
          });
      }, monitorIntervalSec * 1000);
    } else {
      if (monitoringTimerRef.current) {
        clearInterval(monitoringTimerRef.current);
        monitoringTimerRef.current = null;
      }
    }

    return () => {
      if (monitoringTimerRef.current) {
        clearInterval(monitoringTimerRef.current);
        monitoringTimerRef.current = null;
      }
    };
  }, [isMonitoring, monitorIntervalSec, deviceLocation]);

  // Status Indicator formatting
  const getConnectionStatus = () => {
    if (!isBrowserOnline) {
      return {
        label: 'DISCONNECTED',
        color: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
        dot: 'bg-rose-400',
        icon: WifiOff,
      };
    }
    if (isTesting) {
      return {
        label: 'TESTING LIVE...',
        color: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
        dot: 'bg-teal-400 animate-ping',
        icon: Activity,
      };
    }
    if (!latestMeasurement) {
      return {
        label: 'CONNECTED',
        color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        dot: 'bg-emerald-400',
        icon: Wifi,
      };
    }
    switch (latestMeasurement.connection_status) {
      case 'POOR':
        return {
          label: 'POOR CONNECTION',
          color: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          dot: 'bg-amber-400',
          icon: AlertTriangle,
        };
      case 'DISCONNECTED':
        return {
          label: 'DISCONNECTED',
          color: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
          dot: 'bg-rose-400',
          icon: XCircle,
        };
      case 'GOOD':
      default:
        return {
          label: 'GOOD CONNECTION',
          color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          dot: 'bg-emerald-400',
          icon: CheckCircle,
        };
    }
  };

  const status = getConnectionStatus();
  const StatusIcon = status.icon;

  return (
    <div className="rounded-2xl glass-panel-glow border border-slate-800 p-5 space-y-5">
      {/* Header with Live Status & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30">
            <Activity className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                Real-Time Bandwidth & Latency Engine
              </span>
              <TelemetryBadge type="REAL" size="xs" />
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <h2 className="text-base font-bold text-slate-100 font-mono tracking-tight">
                Live Speed & Connection Monitor
              </h2>
              {/* Real-time Status Badge */}
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border flex items-center gap-1.5 ${status.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
                <span>{status.label}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Continuous Monitoring Toggle */}
          <button
            onClick={() => setIsMonitoring(!isMonitoring)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all ${
              isMonitoring
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
            }`}
            title="Toggle periodic lightweight background measurements"
          >
            {isMonitoring ? (
              <>
                <Square className="w-3 h-3 fill-current text-amber-400" />
                <span>Stop Monitoring</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current text-teal-400" />
                <span>Start Monitoring</span>
              </>
            )}
          </button>

          {/* Settings button */}
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="Configure monitoring interval"
          >
            <Settings2 className="w-3.5 h-3.5" />
          </button>

          {/* Full Speed Test Button */}
          <button
            onClick={runFullTest}
            disabled={isTesting || !isBrowserOnline}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all shadow-md ${
              isTesting
                ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                : 'bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-teal-500/20'
            }`}
          >
            {isTesting ? (
              <>
                <RotateCcw className="w-3.5 h-3.5 animate-spin text-teal-400" />
                <span>Measuring...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Run Speed Test</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Monitoring Interval Settings Drawer */}
      {settingsOpen && (
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between text-slate-300">
            <span>Continuous Monitoring Interval:</span>
            <span className="text-teal-300 font-bold">{monitorIntervalSec} seconds</span>
          </div>
          <div className="flex items-center gap-2">
            {[10, 15, 30, 60, 120].map((sec) => (
              <button
                key={sec}
                onClick={() => setMonitorIntervalSec(sec)}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
                  monitorIntervalSec === sec
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 font-bold'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                {sec}s
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-500">
            Lightweight interval checks latency and packet loss periodically without consuming heavy data.
          </p>
        </div>
      )}

      {/* Test In-Progress Stage Display */}
      {isTesting && testProgress && (
        <div className="p-4 rounded-xl bg-slate-900/90 border border-teal-500/40 space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-teal-300 flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
              {testProgress.message}
            </span>
            <span className="text-slate-400 font-bold">{testProgress.progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full transition-all duration-200"
              style={{ width: `${testProgress.progressPercent}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Primary Real-Time Metric Telemetry Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-mono">
        {/* Download Speed */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center space-y-1">
          <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
            <ArrowDown className="w-3 h-3 text-teal-400" />
            <span>Download</span>
          </div>
          <div className="text-2xl font-black text-slate-100 mt-1">
            {latestMeasurement?.download_speed_mbps !== undefined && latestMeasurement.download_speed_mbps > 0
              ? latestMeasurement.download_speed_mbps
              : isTesting && testProgress?.currentDownloadMbps
              ? testProgress.currentDownloadMbps
              : '--'}
            <span className="text-xs font-normal text-slate-400 ml-1">Mbps</span>
          </div>
          <span className="text-[10px] text-teal-400 block">Real Payload Rx</span>
        </div>

        {/* Upload Speed */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center space-y-1">
          <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
            <ArrowUp className="w-3 h-3 text-cyan-400" />
            <span>Upload</span>
          </div>
          <div className="text-2xl font-black text-slate-100 mt-1">
            {latestMeasurement?.upload_speed_mbps !== undefined && latestMeasurement.upload_speed_mbps > 0
              ? latestMeasurement.upload_speed_mbps
              : isTesting && testProgress?.currentUploadMbps
              ? testProgress.currentUploadMbps
              : '--'}
            <span className="text-xs font-normal text-slate-400 ml-1">Mbps</span>
          </div>
          <span className="text-[10px] text-cyan-400 block">Real Payload Tx</span>
        </div>

        {/* Ping / Latency */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center space-y-1">
          <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
            <Clock className="w-3 h-3 text-emerald-400" />
            <span>Ping (RTT)</span>
          </div>
          <div className="text-2xl font-black text-slate-100 mt-1">
            {latestMeasurement ? latestMeasurement.latency_ms : testProgress?.currentPingMs ?? '--'}
            <span className="text-xs font-normal text-slate-400 ml-1">ms</span>
          </div>
          <span className="text-[10px] text-slate-400 block">Multi-probe RTT</span>
        </div>

        {/* Jitter */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center space-y-1">
          <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
            <Activity className="w-3 h-3 text-purple-400" />
            <span>Jitter</span>
          </div>
          <div className="text-2xl font-black text-slate-100 mt-1">
            {latestMeasurement ? latestMeasurement.jitter_ms : '--'}
            <span className="text-xs font-normal text-slate-400 ml-1">ms</span>
          </div>
          <span className="text-[10px] text-slate-400 block">RFC 3550 Mean Dev</span>
        </div>

        {/* Packet Loss */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center space-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
            <Shield className="w-3 h-3 text-amber-400" />
            <span>Packet Loss</span>
          </div>
          <div className="text-2xl font-black text-slate-100 mt-1">
            {latestMeasurement ? `${latestMeasurement.packet_loss_percent}%` : '--'}
          </div>
          <span className="text-[10px] text-slate-400 block">
            {latestMeasurement && latestMeasurement.packet_loss_percent === 0 ? '0% Loss' : 'Probe Integrity'}
          </span>
        </div>
      </div>

      {/* Network Details Sub-bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs font-mono text-slate-400">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5 text-teal-400" />
            <span>Network: <strong className="text-slate-200">{latestMeasurement?.network_type || 'Active Wi-Fi'}</strong></span>
          </span>
          {latestMeasurement?.client_ip && (
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>IP: <strong className="text-slate-300">{latestMeasurement.client_ip}</strong></span>
            </span>
          )}
          {latestMeasurement?.signal_percent !== null && latestMeasurement?.signal_percent !== undefined && (
            <span className="flex items-center gap-1.5">
              <Signal className="w-3.5 h-3.5 text-teal-400" />
              <span>Signal: <strong className="text-slate-200">{latestMeasurement.signal_percent}%</strong></span>
            </span>
          )}
        </div>

        <div>
          {latestMeasurement?.timestamp ? (
            <span className="text-[10px] text-slate-500">
              Measured: {new Date(latestMeasurement.timestamp).toLocaleTimeString()}
            </span>
          ) : (
            <span className="text-[10px] text-slate-500">Ready for measurement</span>
          )}
        </div>
      </div>
    </div>
  );
};
