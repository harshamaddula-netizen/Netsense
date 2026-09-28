import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { NetworkThreshold } from '../../types';
import { Sliders, CheckCircle, Save, RotateCcw, AlertTriangle } from 'lucide-react';

export const ThresholdsManager: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: thresholds, isLoading } = useQuery({
    queryKey: ['thresholds'],
    queryFn: () => api.getThresholds(),
  });

  const [localValues, setLocalValues] = useState<Record<string, { warning: number; critical: number }>>({});
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);

  const handleValueChange = (metric: string, type: 'warning' | 'critical', val: number) => {
    setLocalValues((prev) => ({
      ...prev,
      [metric]: {
        warning: type === 'warning' ? val : prev[metric]?.warning ?? 0,
        critical: type === 'critical' ? val : prev[metric]?.critical ?? 0,
      },
    }));
  };

  const handleSave = async (metricName: string) => {
    const current = localValues[metricName];
    if (!current) return;
    try {
      await api.updateThreshold(metricName, {
        warning_value: current.warning,
        critical_value: current.critical,
      });
      queryClient.invalidateQueries({ queryKey: ['thresholds'] });
      setSavedSuccess(metricName);
      setTimeout(() => setSavedSuccess(null), 2500);
    } catch (err: any) {
      alert(`Error updating threshold: ${err.message}`);
    }
  };

  if (isLoading) {
    return <div className="text-xs text-slate-400 font-mono">Loading thresholds...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-teal-400" />
            <span>Network Health Engine SLA Thresholds</span>
          </h3>
          <p className="text-xs text-slate-400">
            Define boundaries for automated status detection (NORMAL → WARNING → CRITICAL).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {thresholds?.map((t) => {
          const warnVal = localValues[t.metric_name]?.warning ?? t.warning_value;
          const critVal = localValues[t.metric_name]?.critical ?? t.critical_value;

          return (
            <div key={t.id} className="p-4 rounded-xl glass-panel border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs font-mono text-slate-200 uppercase">
                  {t.metric_name.replace(/_/g, ' ')} ({t.unit})
                </span>
                {savedSuccess === t.metric_name && (
                  <span className="text-[10px] font-mono text-teal-300 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-teal-400" /> Saved
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="text-[11px] text-amber-400 font-mono">
                    Warning Threshold ({t.unit})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={warnVal}
                    onChange={(e) =>
                      handleValueChange(t.metric_name, 'warning', parseFloat(e.target.value))
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-rose-400 font-mono">
                    Critical Threshold ({t.unit})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={critVal}
                    onChange={(e) =>
                      handleValueChange(t.metric_name, 'critical', parseFloat(e.target.value))
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-rose-400 font-mono"
                  />
                </div>
              </div>

              <button
                onClick={() => handleSave(t.metric_name)}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                <Save className="w-3.5 h-3.5 text-teal-400" />
                <span>Save Metric Threshold</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
