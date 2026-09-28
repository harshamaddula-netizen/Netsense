import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { CampusHeatmap } from '../features/network/CampusHeatmap';
import { TelemetryBadge } from '../components/common/TelemetryBadge';
import { Layers, Radio, Activity, RefreshCw } from 'lucide-react';

export const NetworkTopologyPage: React.FC = () => {
  const { data: locations, refetch, isFetching } = useQuery({
    queryKey: ['locations'],
    queryFn: () => api.getLocations(),
    refetchInterval: 10000,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-6 h-6 text-teal-400" />
            <h1 className="text-xl font-bold text-slate-100">Campus Heatmap & Wireless AP Topology</h1>
            <TelemetryBadge type="REAL" size="xs" />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time wireless signal congestion across academic blocks, science labs, hostels, and dining commons.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-teal-400 ${isFetching ? 'animate-spin' : ''}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {locations && <CampusHeatmap locations={locations} />}
    </div>
  );
};
