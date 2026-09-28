import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { AdminSimulatorPanel } from '../features/admin/AdminSimulatorPanel';
import { TelemetryBadge } from '../components/common/TelemetryBadge';
import { PlayCircle, ShieldAlert } from 'lucide-react';

export const SimulatorPage: React.FC = () => {
  const { data: locations, refetch } = useQuery({
    queryKey: ['locations'],
    queryFn: () => api.getLocations(),
  });

  if (!locations) {
    return <div className="text-xs text-slate-400 font-mono">Loading simulator...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <div className="flex items-center gap-2">
          <PlayCircle className="w-6 h-6 text-amber-400" />
          <h1 className="text-xl font-bold text-slate-100">Hackathon Simulation Engine</h1>
          <TelemetryBadge type="DEMO" size="xs" />
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Inject synthetic device surges, RF interference, packet loss bursts, and crowd report waves for evaluation.
        </p>
      </div>

      <AdminSimulatorPanel
        locations={locations}
        onScenarioTriggered={() => {
          refetch();
        }}
      />
    </div>
  );
};
