import React from 'react';
import { AnalyticsDashboard } from '../features/analytics/AnalyticsDashboard';
import { TelemetryBadge } from '../components/common/TelemetryBadge';
import { BarChart3, TrendingUp, Sparkles } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-teal-400" />
          <h1 className="text-xl font-bold text-slate-100">Historical Analytics & Predictive Intelligence</h1>
          <TelemetryBadge type="TREND" size="xs" />
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Longitudinal device concurrency, latency distributions, category breakdowns, and verified trend predictions.
        </p>
      </div>

      <AnalyticsDashboard />
    </div>
  );
};
