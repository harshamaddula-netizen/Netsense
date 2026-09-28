import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { ReportForm } from '../features/reports/ReportForm';
import { TelemetryBadge } from '../components/common/TelemetryBadge';
import { PlusCircle, HelpCircle, ShieldCheck } from 'lucide-react';

export const NewReportPage: React.FC = () => {
  const { data: locations, isLoading } = useQuery({
    queryKey: ['locations'],
    queryFn: () => api.getLocations(),
  });

  if (isLoading || !locations) {
    return <div className="text-xs text-slate-400 font-mono">Loading campus locations...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <PlusCircle className="w-6 h-6 text-teal-400" />
          <h1 className="text-xl font-bold text-slate-100">Submit a Network Issue Report</h1>
          <TelemetryBadge type="REPORT" size="xs" />
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Reports are evaluated immediately by the automated Incident Correlation Engine to alert campus network engineers.
        </p>
      </div>

      <div className="p-6 rounded-2xl glass-panel border border-slate-800">
        <ReportForm locations={locations} />
      </div>
    </div>
  );
};
