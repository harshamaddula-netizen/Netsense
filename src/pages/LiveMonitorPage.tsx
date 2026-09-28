import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { AvailableNetworksCard } from '../features/network/AvailableNetworksCard';
import { LiveSpeedMonitor } from '../features/network/LiveSpeedMonitor';
import { ExactLocationCard } from '../features/location/ExactLocationCard';
import { NetworkHistorySection } from '../features/network/NetworkHistorySection';
import { PlatformLimitationsCard } from '../features/network/PlatformLimitationsCard';
import { GPSCoordinates } from '../utils/geolocation';
import { NetworkHistoryRecord } from '../types';
import { TelemetryBadge } from '../components/common/TelemetryBadge';
import {
  Activity,
  Radio,
  MapPin,
  History,
  ShieldCheck,
  Zap,
  Globe,
  Sliders,
  CheckCircle,
} from 'lucide-react';

const STORAGE_KEY = 'netsense_network_history_v1';

export const LiveMonitorPage: React.FC = () => {
  const [deviceLocation, setDeviceLocation] = useState<GPSCoordinates | null>(null);
  const [history, setHistory] = useState<NetworkHistoryRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const { data: locations } = useQuery({
    queryKey: ['locations'],
    queryFn: () => api.getLocations(),
  });

  // Handle new speed measurement from LiveSpeedMonitor
  const handleNewMeasurement = (newRecord: NetworkHistoryRecord) => {
    setHistory((prev) => {
      const updated = [newRecord, ...prev].slice(0, 50); // retain up to 50 local records
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.warn('Could not save to localStorage:', err);
      }
      return updated;
    });
  };

  // Handle clear history
  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your local network measurement history?')) {
      setHistory([]);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (err) {
        console.warn('Could not clear localStorage:', err);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Hero */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-100 font-mono tracking-tight">
              Real-Time Network Telemetry & Monitoring Suite
            </h1>
            <TelemetryBadge type="REAL" size="sm" />
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl font-mono">
            Direct host RF beacon scanning, continuous multi-probe latency monitoring, verified binary throughput testing, and device GPS mapping with zero simulated data.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
            <span>Live Stream Active</span>
          </div>
        </div>
      </div>

      {/* Real-Time Speed & Continuous Monitoring Card */}
      <LiveSpeedMonitor
        deviceLocation={deviceLocation}
        onNewMeasurement={handleNewMeasurement}
      />

      {/* Grid: Available Networks Card & Exact Device Location Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <AvailableNetworksCard />
        <ExactLocationCard
          locations={locations || []}
          onLocationUpdate={setDeviceLocation}
          historyPoints={history}
        />
      </div>

      {/* Network Measurement History (Graphs & Table) */}
      <NetworkHistorySection
        history={history}
        onClearHistory={handleClearHistory}
      />

      {/* Platform & Sandbox Limitations Transparency */}
      <PlatformLimitationsCard />
    </div>
  );
};
