// ==============================================================================
// NETSENSE CAMPUS - REUSABLE NETWORK HEALTH ENGINE
// ==============================================================================

import {
  NetworkStatus,
  SeverityLevel,
  NetworkMeasurement,
  NetworkThreshold,
  NetworkHealthAssessment,
} from '../types';

export const DEFAULT_THRESHOLDS: Record<string, { warning: number; critical: number; unit: string }> = {
  LATENCY: { warning: 70, critical: 150, unit: 'ms' },
  PACKET_LOSS: { warning: 2.0, critical: 5.0, unit: '%' },
  DEVICE_COUNT: { warning: 250, critical: 400, unit: 'devices' },
  AVAILABILITY: { warning: 98.0, critical: 90.0, unit: '%' }, // lower is worse for availability
};

/**
 * Pure, deterministic calculation of network health based on telemetry metrics and dynamic thresholds.
 * Evaluates:
 * - Device count concurrency
 * - Latency (RTT)
 * - Packet loss percentage
 * - Service availability percentage
 */
export function calculateNetworkHealth(
  metrics: {
    device_count: number;
    latency_ms: number;
    packet_loss_percent: number;
    availability_percent?: number;
  },
  thresholds?: NetworkThreshold[]
): NetworkHealthAssessment {
  const activeThresholds = { ...DEFAULT_THRESHOLDS };

  // Overlay custom thresholds if provided
  if (thresholds && thresholds.length > 0) {
    for (const t of thresholds) {
      if (t.is_active && activeThresholds[t.metric_name]) {
        activeThresholds[t.metric_name] = {
          warning: t.warning_value,
          critical: t.critical_value,
          unit: t.unit,
        };
      }
    }
  }

  const reasons: string[] = [];
  const thresholds_exceeded: string[] = [];
  let isCritical = false;
  let isWarning = false;

  const availability = metrics.availability_percent ?? 100;

  // 1. Check Latency
  if (metrics.latency_ms >= activeThresholds.LATENCY.critical) {
    isCritical = true;
    thresholds_exceeded.push('LATENCY_CRITICAL');
    reasons.push(
      `Latency (${metrics.latency_ms.toFixed(1)}ms) severely exceeds critical threshold of ${activeThresholds.LATENCY.critical}ms`
    );
  } else if (metrics.latency_ms >= activeThresholds.LATENCY.warning) {
    isWarning = true;
    thresholds_exceeded.push('LATENCY_WARNING');
    reasons.push(
      `Latency (${metrics.latency_ms.toFixed(1)}ms) is elevated above warning threshold of ${activeThresholds.LATENCY.warning}ms`
    );
  }

  // 2. Check Packet Loss
  if (metrics.packet_loss_percent >= activeThresholds.PACKET_LOSS.critical) {
    isCritical = true;
    thresholds_exceeded.push('PACKET_LOSS_CRITICAL');
    reasons.push(
      `Packet loss (${metrics.packet_loss_percent.toFixed(1)}%) is at critical level (>= ${activeThresholds.PACKET_LOSS.critical}%)`
    );
  } else if (metrics.packet_loss_percent >= activeThresholds.PACKET_LOSS.warning) {
    isWarning = true;
    thresholds_exceeded.push('PACKET_LOSS_WARNING');
    reasons.push(
      `Packet loss (${metrics.packet_loss_percent.toFixed(1)}%) is above warning threshold (>= ${activeThresholds.PACKET_LOSS.warning}%)`
    );
  }

  // 3. Check Device Concurrency Load
  if (metrics.device_count >= activeThresholds.DEVICE_COUNT.critical) {
    isCritical = true;
    thresholds_exceeded.push('DEVICE_LOAD_CRITICAL');
    reasons.push(
      `Device load (${metrics.device_count} devices) exceeds AP saturated capacity of ${activeThresholds.DEVICE_COUNT.critical}`
    );
  } else if (metrics.device_count >= activeThresholds.DEVICE_COUNT.warning) {
    isWarning = true;
    thresholds_exceeded.push('DEVICE_LOAD_WARNING');
    reasons.push(
      `Elevated device load (${metrics.device_count} devices) approaching high capacity (${activeThresholds.DEVICE_COUNT.warning})`
    );
  }

  // 4. Check Availability (lower than threshold is bad)
  if (availability <= activeThresholds.AVAILABILITY.critical) {
    isCritical = true;
    thresholds_exceeded.push('AVAILABILITY_CRITICAL');
    reasons.push(
      `Availability (${availability.toFixed(1)}%) dropped below critical uptime threshold (${activeThresholds.AVAILABILITY.critical}%)`
    );
  } else if (availability <= activeThresholds.AVAILABILITY.warning) {
    isWarning = true;
    thresholds_exceeded.push('AVAILABILITY_WARNING');
    reasons.push(
      `Availability (${availability.toFixed(1)}%) is degraded below ${activeThresholds.AVAILABILITY.warning}%`
    );
  }

  let status: NetworkStatus = 'NORMAL';
  let severity: SeverityLevel = 'LOW';

  if (isCritical) {
    status = 'CRITICAL';
    severity = 'CRITICAL';
  } else if (isWarning) {
    status = 'WARNING';
    severity = 'MEDIUM';
  } else {
    reasons.push('All measured network parameters are well within nominal operational thresholds.');
  }

  return {
    status,
    severity,
    reasons,
    metrics: {
      device_count: metrics.device_count,
      latency_ms: metrics.latency_ms,
      packet_loss_percent: metrics.packet_loss_percent,
      availability_percent: availability,
    },
    thresholds_exceeded,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Formats status for UI with color classes and human readable labels
 */
export function getStatusTheme(status: NetworkStatus) {
  switch (status) {
    case 'NORMAL':
      return {
        label: 'Optimal / Normal',
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        dot: 'bg-emerald-400 shadow-[0_0_8px_#10b981]',
      };
    case 'WARNING':
      return {
        label: 'Congested / Warning',
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        dot: 'bg-amber-400 shadow-[0_0_8px_#f59e0b]',
      };
    case 'CRITICAL':
      return {
        label: 'Critical / Degraded',
        color: 'text-rose-400',
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/30',
        badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        dot: 'bg-rose-500 shadow-[0_0_10px_#ef4444]',
      };
    case 'UNKNOWN':
    default:
      return {
        label: 'No Data / Unknown',
        color: 'text-slate-400',
        bg: 'bg-slate-500/10',
        border: 'border-slate-500/30',
        badge: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
        dot: 'bg-slate-400',
      };
  }
}
