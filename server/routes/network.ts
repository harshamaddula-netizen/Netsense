import { Router, Request, Response } from 'express';
import { db } from '../services/db';
import { wifiService } from '../services/wifiService';
import { calculateNetworkHealth } from '../../src/utils/networkEngine';
import { DiagnosticResultSchema, UpdateThresholdSchema } from '../validators/schemas';

import os from 'os';

const router = Router();

// Fast Ping probe for client-side round trip timing
router.get('/ping', (req: Request, res: Response) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.json({
    status: 'ok',
    server_time: Date.now(),
    source: 'CAMPUS_GATEWAY_NODE',
  });
});

// Live Connected Wi-Fi Telemetry from System Interface
router.get('/wifi-interface', async (req: Request, res: Response) => {
  try {
    const wifiInfo = await wifiService.getConnectedWifi();
    res.json({
      success: true,
      data: wifiInfo,
      error: null,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      data: null,
      error: { code: 'WIFI_QUERY_ERROR', message: err.message },
    });
  }
});

// Full Hardware Scan of Available Wireless Networks in Range
router.get('/wifi-available', async (req: Request, res: Response) => {
  try {
    const scanReport = await wifiService.getAvailableNetworks();
    res.json({
      success: true,
      data: scanReport,
      error: null,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      data: null,
      error: { code: 'WIFI_SCAN_ERROR', message: err.message },
    });
  }
});

// Real Speed Test - Binary Download Payload (1MB chunk)
const SPEEDTEST_BUFFER = Buffer.alloc(1024 * 1024, 0x4e); // 1 Megabyte chunk
router.get('/speed/download', (req: Request, res: Response) => {
  res.set({
    'Content-Type': 'application/octet-stream',
    'Content-Length': SPEEDTEST_BUFFER.length.toString(),
    'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  });
  res.end(SPEEDTEST_BUFFER);
});

// Real Speed Test - Binary Upload Payload
router.post('/speed/upload', (req: Request, res: Response) => {
  const startTime = process.hrtime.bigint();
  let bytesReceived = 0;

  req.on('data', (chunk) => {
    bytesReceived += chunk.length;
  });

  req.on('end', () => {
    const endTime = process.hrtime.bigint();
    const durationMs = Number(endTime - startTime) / 1e6;
    res.set('Cache-Control', 'no-store, no-cache');
    res.json({
      success: true,
      bytesReceived,
      durationServerMs: Math.max(0.1, durationMs),
      timestamp: Date.now(),
    });
  });

  req.on('error', (err) => {
    res.status(500).json({ success: false, error: err.message });
  });
});

// High-resolution ping probe for jitter & latency calculation
router.get('/speed/ping', (req: Request, res: Response) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.json({
    status: 'ok',
    timestamp: Date.now(),
  });
});

// Safe IP & Interface Telemetry
router.get('/ip-info', (req: Request, res: Response) => {
  const clientIp =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
    req.socket.remoteAddress ||
    '127.0.0.1';

  const ifaces = os.networkInterfaces();
  const localIps: { name: string; address: string; family: string; mac: string; internal: boolean }[] = [];

  for (const [name, addrs] of Object.entries(ifaces)) {
    if (addrs) {
      for (const a of addrs) {
        localIps.push({
          name,
          address: a.address,
          family: a.family,
          mac: a.mac,
          internal: a.internal,
        });
      }
    }
  }

  res.json({
    success: true,
    data: {
      client_ip: clientIp.replace('::ffff:', ''),
      hostname: os.hostname(),
      platform: os.platform(),
      release: os.release(),
      local_interfaces: localIps.filter((i) => !i.internal && (i.family === 'IPv4' || (i.family as any) === 4)),
      timestamp: new Date().toISOString(),
    },
    error: null,
  });
});

// Overall campus health
router.get('/status', (req: Request, res: Response) => {
  const locations = db.getLocations();
  const thresholds = db.getThresholds();

  let totalDevices = 0;
  let totalLatency = 0;
  let totalLoss = 0;
  let validCount = 0;

  for (const loc of locations) {
    if (loc.latest_measurement) {
      totalDevices += loc.latest_measurement.device_count;
      totalLatency += loc.latest_measurement.latency_ms;
      totalLoss += loc.latest_measurement.packet_loss_percent;
      validCount++;
    }
  }

  const avgDevices = validCount > 0 ? totalDevices / validCount : 100;
  const avgLatency = validCount > 0 ? totalLatency / validCount : 25;
  const avgLoss = validCount > 0 ? totalLoss / validCount : 0.2;

  const assessment = calculateNetworkHealth(
    {
      device_count: Math.round(avgDevices),
      latency_ms: avgLatency,
      packet_loss_percent: avgLoss,
      availability_percent: 99.8,
    },
    thresholds
  );

  const activeIncidents = db.getIncidents().filter((i) => i.status !== 'RESOLVED');

  res.json({
    success: true,
    data: {
      overall_status: assessment.status,
      severity: assessment.severity,
      total_connected_devices: totalDevices,
      average_latency_ms: Number(avgLatency.toFixed(1)),
      average_packet_loss_percent: Number(avgLoss.toFixed(1)),
      active_incidents_count: activeIncidents.length,
      monitored_locations_count: locations.length,
      reasons: assessment.reasons,
      timestamp: new Date().toISOString(),
    },
    error: null,
  });
});

// Locations with latest telemetry
router.get('/locations', (req: Request, res: Response) => {
  const locations = db.getLocations();
  res.json({
    success: true,
    data: locations,
    error: null,
  });
});

// Single location
router.get('/locations/:locationId', (req: Request, res: Response) => {
  const locationId = req.params.locationId as string;
  const location = db.getLocationById(locationId);
  if (!location) {
    res.status(404).json({
      success: false,
      data: null,
      error: { code: 'NOT_FOUND', message: 'Campus location not found' },
    });
    return;
  }
  const measurements = db.getMeasurements(locationId, 24);
  const reports = db.getReports(undefined, locationId);
  const incidents = db.getIncidents().filter((i) => i.location_id === locationId);

  res.json({
    success: true,
    data: {
      location,
      measurements,
      reports,
      incidents,
    },
    error: null,
  });
});

// Measurements time-series
router.get('/measurements', (req: Request, res: Response) => {
  const { locationId, limit } = req.query;
  const locId = typeof locationId === 'string' ? locationId : undefined;
  const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : 100;
  const measurements = db.getMeasurements(locId, parsedLimit);
  res.json({
    success: true,
    data: measurements,
    error: null,
  });
});

// Submit client-side diagnostic telemetry
router.post('/diagnostics', (req: Request, res: Response) => {
  const parsed = DiagnosticResultSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      data: null,
      error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message || 'Invalid diagnostic data' },
    });
    return;
  }

  // Store client measurement if location is provided in header or body
  const locationId = (req.body.location_id as string) || '22222222-2222-2222-2222-222222222201';
  db.recordMeasurement({
    location_id: locationId,
    device_count: 1,
    latency_ms: parsed.data.latency_ms,
    packet_loss_percent: parsed.data.packet_loss_percent,
    availability_percent: parsed.data.is_online ? 100 : 0,
    status: parsed.data.client_assessment.status,
    source: 'CLIENT',
    measured_at: parsed.data.timestamp,
  });

  res.json({
    success: true,
    data: {
      message: 'Client diagnostic logged successfully',
      result: parsed.data,
    },
    error: null,
  });
});

// Thresholds
router.get('/thresholds', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: db.getThresholds(),
    error: null,
  });
});

router.patch('/thresholds/:metricName', (req: Request, res: Response) => {
  const metricName = req.params.metricName as string;
  const parsed = UpdateThresholdSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      data: null,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid threshold parameters' },
    });
    return;
  }
  const updated = db.updateThreshold(metricName, parsed.data);
  if (!updated) {
    res.status(404).json({
      success: false,
      data: null,
      error: { code: 'NOT_FOUND', message: 'Threshold not found' },
    });
    return;
  }
  res.json({
    success: true,
    data: updated,
    error: null,
  });
});

export default router;
