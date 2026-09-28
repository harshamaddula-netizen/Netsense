import React from 'react';

export type TelemetryType =
  | 'REAL'
  | 'CLIENT'
  | 'REPORT'
  | 'DEMO'
  | 'AI';

interface TelemetryBadgeProps {
  type: TelemetryType | string;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export const TelemetryBadge: React.FC<TelemetryBadgeProps> = ({
  type,
  size = 'xs',
  className = '',
}) => {
  const norm = type.toUpperCase();

  const sizeClasses = {
    xs: 'text-[10px] px-1.5 py-0.5 tracking-wider',
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  }[size];

  switch (norm) {
    case 'REAL':
    case 'REAL TELEMETRY':
      return (
        <span
          className={`inline-flex items-center gap-1 font-mono font-medium rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 ${sizeClasses} ${className}`}
          title="Telemetry derived directly from campus AP controller"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          REAL TELEMETRY
        </span>
      );

    case 'CLIENT':
    case 'CLIENT MEASUREMENT':
      return (
        <span
          className={`inline-flex items-center gap-1 font-mono font-medium rounded border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 ${sizeClasses} ${className}`}
          title="Safe browser-side HTTP RTT & throughput probe"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
          CLIENT MEASUREMENT
        </span>
      );

    case 'REPORT':
    case 'USER REPORT':
      return (
        <span
          className={`inline-flex items-center gap-1 font-mono font-medium rounded border border-sky-500/30 bg-sky-500/10 text-sky-400 ${sizeClasses} ${className}`}
          title="Reported by verified student or faculty member"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
          USER REPORT
        </span>
      );

    case 'DEMO':
    case 'DEMO DATA':
      return (
        <span
          className={`inline-flex items-center gap-1 font-mono font-semibold rounded border border-amber-500/40 bg-amber-500/15 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.15)] ${sizeClasses} ${className}`}
          title="Synthetically generated scenario for hackathon evaluation"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
          DEMO DATA
        </span>
      );

    case 'AI':
    case 'AI-GENERATED ANALYSIS':
    case 'AI-GENERATED':
      return (
        <span
          className={`inline-flex items-center gap-1 font-mono font-medium rounded border border-purple-500/30 bg-purple-500/10 text-purple-300 ${sizeClasses} ${className}`}
          title="Synthesized by Google Gemini models"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
          AI-GENERATED
        </span>
      );

    case 'TREND':
    case 'TREND-BASED INSIGHT':
      return (
        <span
          className={`inline-flex items-center gap-1 font-mono font-medium rounded border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 ${sizeClasses} ${className}`}
          title="Statistical aggregation of historical congestion windows"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
          TREND-BASED INSIGHT
        </span>
      );

    default:
      return (
        <span className={`inline-flex items-center font-mono rounded bg-slate-800 text-slate-300 ${sizeClasses} ${className}`}>
          {type}
        </span>
      );
  }
};
