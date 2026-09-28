import React from 'react';
import { DiagnosticRunner } from '../features/diagnostics/DiagnosticRunner';
import { ConnectedWifiCard } from '../features/network/ConnectedWifiCard';
import { TelemetryBadge } from '../components/common/TelemetryBadge';
import { Activity, ShieldCheck, HelpCircle, Wifi } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DiagnosticsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <div className="flex items-center gap-2">
          <Activity className="w-6 h-6 text-teal-400" />
          <h1 className="text-xl font-bold text-slate-100">Campus Network Diagnostics</h1>
          <TelemetryBadge type="CLIENT" size="xs" />
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Perform a browser-compatible connectivity, RTT latency, and request drop analysis without installing any software.
        </p>
      </div>

      {/* Connected Device Wi-Fi Telemetry */}
      <ConnectedWifiCard />

      {/* Main Diagnostic Runner */}
      <DiagnosticRunner
        onOpenAssistantWithDiagnostic={(diag) => {
          navigate('/dashboard');
        }}
      />

      {/* Telemetry Integrity Callout (Section 4.3) */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs text-slate-300">
        <h3 className="font-semibold text-slate-200 flex items-center gap-2 font-mono">
          <ShieldCheck className="w-4 h-4 text-teal-400" />
          <span>Understanding Client-Side Measurement vs. Infrastructure Telemetry</span>
        </h3>
        <p className="text-slate-400 leading-relaxed">
          Browser diagnostics measure the round-trip time between your browser socket and the nearest campus gateway probe. While it cannot directly read hardware internal radio registers, elevated client latency combined with zero local CPU load is strong empirical evidence of wireless contention or saturated 2.4/5GHz airtime channels.
        </p>
      </div>
    </div>
  );
};
