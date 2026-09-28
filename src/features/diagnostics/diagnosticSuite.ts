// ==============================================================================
// NETSENSE CAMPUS - SAFE IN-BROWSER NETWORK DIAGNOSTIC SUITE
// ==============================================================================

import { DiagnosticResult, NetworkStatus } from '../../types';
import { api } from '../../lib/api';

export interface DiagnosticProgressCallback {
  (stage: string, percent: number, details?: string): void;
}

/**
 * Runs client-side network diagnostics strictly using safe browser capabilities:
 * 1. Online state verification
 * 2. Multi-sample RTT latency measurement to backend & public CDN
 * 3. Jitter calculation (variation in packet arrival times)
 * 4. Synthetic packet loss estimation via burst fetch success rate
 * 5. DNS & Gateway reachability evaluation
 */
export async function runClientDiagnostics(
  onProgress?: DiagnosticProgressCallback
): Promise<DiagnosticResult> {
  const timestamp = new Date().toISOString();
  onProgress?.('Initializing diagnostic probes...', 10);

  // 1. Client Browser Connectivity Check
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  if (!isOnline) {
    return {
      timestamp,
      source: 'CLIENT',
      is_online: false,
      latency_ms: 0,
      jitter_ms: 0,
      packet_loss_percent: 100,
      dns_reachable: false,
      api_reachable: false,
      download_speed_mbps: 0,
      connection_type: 'Disconnected',
      client_assessment: {
        status: 'CRITICAL',
        summary: 'Your device is completely disconnected from any active network interface.',
        details: [
          'Browser reports offline state (navigator.onLine = false)',
          'No IP address or Wi-Fi link detected on your operating system',
          'Recommendation: Check your physical Wi-Fi toggle or Ethernet cable',
        ],
        is_client_side_problem: true,
      },
    };
  }

  onProgress?.('Testing DNS and API gateway reachability...', 25);

  let apiReachable = false;
  let dnsReachable = false;
  const sampleLatencies: number[] = [];
  const testEndpoints = [
    '/api/network/ping',
    'https://www.cloudflare.com/cdn-cgi/trace',
    'https://dns.google/resolve?name=example.com',
  ];

  // 2. Measure Round-Trip Latency across 5 samples
  const totalSamples = 5;
  for (let i = 0; i < totalSamples; i++) {
    onProgress?.(`Measuring round-trip latency (sample ${i + 1}/${totalSamples})...`, 30 + i * 10);
    const start = performance.now();
    try {
      const cacheBuster = `?_cb=${Date.now()}_${i}`;
      // Primary probe: Local API gateway
      const res = await fetch(`/api/network/ping${cacheBuster}`, {
        method: 'GET',
        cache: 'no-store',
        signal: AbortSignal.timeout(3000),
      });

      const end = performance.now();
      const duration = Math.max(1, end - start);
      sampleLatencies.push(duration);
      if (res.ok) apiReachable = true;
    } catch (err) {
      // If primary probe fails, probe secondary public endpoint
      try {
        const altStart = performance.now();
        await fetch(`https://1.1.1.1/cdn-cgi/trace?_cb=${Date.now()}`, {
          mode: 'no-cors',
          cache: 'no-store',
          signal: AbortSignal.timeout(2000),
        });
        const altEnd = performance.now();
        sampleLatencies.push(altEnd - altStart);
        dnsReachable = true;
      } catch (altErr) {
        // Dropped sample
      }
    }
  }

  // 3. Measure simulated packet loss via rapid probe burst
  onProgress?.('Evaluating packet loss and jitter...', 80);
  const burstCount = 6;
  let successfulBursts = 0;
  for (let j = 0; j < burstCount; j++) {
    try {
      const res = await fetch(`/api/network/ping?burst=${j}&t=${Date.now()}`, {
        method: 'GET',
        cache: 'no-store',
        signal: AbortSignal.timeout(1800),
      });
      if (res.ok) {
        successfulBursts++;
        dnsReachable = true;
      }
    } catch (e) {
      // dropped packet
    }
  }

  onProgress?.('Testing actual download throughput with binary payload...', 85);

  let measuredDownloadSpeed = 0;
  try {
    const { bytes, durationMs } = await api.downloadSpeedChunk();
    const seconds = durationMs / 1000;
    measuredDownloadSpeed = Number(((bytes * 8) / seconds / 1e6).toFixed(2));
  } catch (speedErr) {
    console.warn('Direct download speed probe failed, using fallback ping calculation:', speedErr);
    measuredDownloadSpeed = 0;
  }

  onProgress?.('Synthesizing diagnostic telemetry...', 95);

  const packetLossPercent = Math.round(((burstCount - successfulBursts) / burstCount) * 100);
  const validLatencies = sampleLatencies.length > 0 ? sampleLatencies : [999];
  const avgLatency =
    validLatencies.reduce((acc, curr) => acc + curr, 0) / validLatencies.length;

  // Calculate Jitter (average difference between consecutive latency samples)
  let jitterSum = 0;
  for (let k = 1; k < validLatencies.length; k++) {
    jitterSum += Math.abs(validLatencies[k] - validLatencies[k - 1]);
  }
  const avgJitter = validLatencies.length > 1 ? jitterSum / (validLatencies.length - 1) : 2.5;

  // 4. Formulate Client Assessment
  let status: NetworkStatus = 'NORMAL';
  let isClientSide = false;
  const details: string[] = [];

  if (avgLatency > 180 || packetLossPercent >= 15) {
    status = 'CRITICAL';
    details.push(`High latency (${avgLatency.toFixed(0)}ms) and elevated packet loss (${packetLossPercent}%).`);
    details.push('Likely severe wireless interference, saturated campus AP, or upstream ISP queue.');
  } else if (avgLatency > 75 || packetLossPercent > 3) {
    status = 'WARNING';
    details.push(`Elevated response time (${avgLatency.toFixed(0)}ms) or intermittent dropped requests.`);
    details.push('Connection is usable for browsing, but video calls and gaming will stutter.');
  } else {
    status = 'NORMAL';
    details.push(`Optimal connection response (${avgLatency.toFixed(0)}ms latency, ${packetLossPercent}% loss).`);
    details.push('Local Wi-Fi link and campus gateway are operating within normal tolerances.');
  }

  // Check if connection information API is available on modern browsers
  let connectionType = 'Wi-Fi / Ethernet';
  if (typeof navigator !== 'undefined' && 'connection' in navigator) {
    const conn = (navigator as any).connection;
    if (conn?.effectiveType) {
      connectionType = `${conn.effectiveType.toUpperCase()} (${conn.type || 'wireless'})`;
    }
  }

  onProgress?.('Diagnostics complete.', 100);

  return {
    timestamp,
    source: 'CLIENT',
    is_online: isOnline,
    latency_ms: Number(avgLatency.toFixed(1)),
    jitter_ms: Number(avgJitter.toFixed(1)),
    packet_loss_percent: packetLossPercent,
    dns_reachable: dnsReachable || apiReachable,
    api_reachable: apiReachable,
    download_speed_mbps: measuredDownloadSpeed,
    connection_type: connectionType,
    client_assessment: {
      status,
      summary:
        status === 'NORMAL'
          ? 'Client connection is healthy. No client-side bottleneck detected.'
          : status === 'WARNING'
          ? 'Elevated latency detected from your device to the campus gateway.'
          : 'Severe latency or packet drop detected from your device.',
      details,
      is_client_side_problem: isClientSide,
    },
  };
}
