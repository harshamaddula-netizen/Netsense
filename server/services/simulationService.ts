// ==============================================================================
// NETSENSE CAMPUS - NETWORK SIMULATION ENGINE (DEMO DATA GENERATOR)
// ==============================================================================

import { db } from './db';
import { correlationService } from './correlationService';
import {
  SimulatorScenario,
  NetworkMeasurement,
  NetworkStatus,
  ReportCategory,
  SeverityLevel,
} from '../../src/types';

export class SimulationService {
  /**
   * Triggers a synthetic network condition across target location or whole campus.
   * Every injected metric is strictly stamped with source: 'DEMO'.
   */
  public triggerScenario(
    scenario: SimulatorScenario,
    targetLocationId?: string,
    durationMinutes: number = 30
  ) {
    const locations = db.getLocations();
    const targetLoc = targetLocationId
      ? locations.find((l) => l.id === targetLocationId)
      : locations[0]; // Defaults to Engineering Block Floor 2 if unspecified

    if (!targetLoc) throw new Error('Target campus location not found');

    const now = new Date().toISOString();

    switch (scenario) {
      case 'NORMAL': {
        // Reset all locations to nominal healthy state
        for (const loc of locations) {
          db.recordMeasurement({
            location_id: loc.id,
            device_count: Math.floor(80 + Math.random() * 60),
            latency_ms: Number((18 + Math.random() * 10).toFixed(1)),
            packet_loss_percent: Number((Math.random() * 0.4).toFixed(1)),
            availability_percent: 100.0,
            status: 'NORMAL',
            source: 'DEMO',
            measured_at: now,
          });
        }
        return {
          scenario: 'NORMAL',
          message: 'Campus network restored to nominal baseline across all AP zones.',
          affected_location: 'All Campus Locations',
          metrics: { status: 'NORMAL', avg_latency: '22ms', packet_loss: '0.2%' },
        };
      }

      case 'HIGH_LOAD': {
        // Saturate target location with 480 devices
        const measurement = db.recordMeasurement({
          location_id: targetLoc.id,
          device_count: 485,
          latency_ms: 135.2,
          packet_loss_percent: 4.8,
          availability_percent: 97.5,
          status: 'CRITICAL',
          source: 'DEMO',
          measured_at: now,
        });

        return {
          scenario: 'HIGH_LOAD',
          message: `Injected acute device concurrency load (${measurement.device_count} devices) in ${targetLoc.name}.`,
          affected_location: targetLoc.name,
          metrics: measurement,
        };
      }

      case 'HIGH_LATENCY': {
        // Upstream ISP queue congestion: 260ms latency
        const measurement = db.recordMeasurement({
          location_id: targetLoc.id,
          device_count: 220,
          latency_ms: 264.8,
          packet_loss_percent: 6.5,
          availability_percent: 94.0,
          status: 'CRITICAL',
          source: 'DEMO',
          measured_at: now,
        });

        return {
          scenario: 'HIGH_LATENCY',
          message: `Injected upstream latency spike (264.8ms) and packet drop in ${targetLoc.name}.`,
          affected_location: targetLoc.name,
          metrics: measurement,
        };
      }

      case 'PACKET_LOSS': {
        // Severe radio frequency interference: 16.5% packet loss
        const measurement = db.recordMeasurement({
          location_id: targetLoc.id,
          device_count: 190,
          latency_ms: 110.0,
          packet_loss_percent: 16.5,
          availability_percent: 88.0,
          status: 'CRITICAL',
          source: 'DEMO',
          measured_at: now,
        });

        return {
          scenario: 'PACKET_LOSS',
          message: `Injected severe radio interference (${measurement.packet_loss_percent}% packet drop) in ${targetLoc.name}.`,
          affected_location: targetLoc.name,
          metrics: measurement,
        };
      }

      case 'OUTAGE': {
        // Access point crash / disconnected switch
        const measurement = db.recordMeasurement({
          location_id: targetLoc.id,
          device_count: 0,
          latency_ms: 999.0,
          packet_loss_percent: 100.0,
          availability_percent: 0.0,
          status: 'CRITICAL',
          source: 'DEMO',
          measured_at: now,
        });

        // Auto create an immediate outage incident
        const inc = db.createIncident({
          location_id: targetLoc.id,
          title: `Simulated Major AP Outage in ${targetLoc.name}`,
          description: `Total connectivity failure detected at access point cluster in ${targetLoc.name}. Gateway ping unreachable.`,
          severity: 'CRITICAL',
          status: 'OPEN',
          source: 'DEMO',
          detected_at: now,
        });

        return {
          scenario: 'OUTAGE',
          message: `Simulated complete access point failure in ${targetLoc.name}.`,
          affected_location: targetLoc.name,
          metrics: measurement,
          incident_id: inc.id,
        };
      }

      case 'CROWD_BURST': {
        // Rapid flurry of 4 simulated students submitting complaints in 2 minutes
        const simulatedComplaints: Array<{ category: ReportCategory; desc: string; user: string }> = [
          {
            category: 'BUFFERING',
            desc: 'Online lecture video keeps freezing every 10 seconds. Unusable.',
            user: 'Simulated Student (Priya K.)',
          },
          {
            category: 'SLOW_INTERNET',
            desc: 'Cannot load GitHub or university portal from the classroom.',
            user: 'Simulated Student (David L.)',
          },
          {
            category: 'FREQUENT_DISCONNECT',
            desc: 'Wi-Fi keeps dropping and reconnecting repeatedly.',
            user: 'Simulated Student (Ananya S.)',
          },
          {
            category: 'HIGH_LATENCY',
            desc: 'Ping to google is over 300ms, terminal SSH is lagging.',
            user: 'Simulated Student (Rahul M.)',
          },
        ];

        // Record a congested measurement first
        db.recordMeasurement({
          location_id: targetLoc.id,
          device_count: 360,
          latency_ms: 185.0,
          packet_loss_percent: 7.2,
          availability_percent: 96.0,
          status: 'CRITICAL',
          source: 'DEMO',
          measured_at: now,
        });

        const createdReports = [];
        let correlationResult;

        for (const comp of simulatedComplaints) {
          const report = db.createReport({
            user_id: null,
            location_id: targetLoc.id,
            category: comp.category,
            description: `[SIMULATED DEMO REPORT] ${comp.desc}`,
            severity: 'HIGH',
            device_type: 'Laptop',
            status: 'SUBMITTED',
            diagnostic_data: null,
          });
          createdReports.push(report);
          // Run through correlation engine
          correlationResult = correlationService.correlateReport(report);
        }

        return {
          scenario: 'CROWD_BURST',
          message: `Simulated crowd burst of ${createdReports.length} student complaints in ${targetLoc.name}. Automated correlation triggered.`,
          affected_location: targetLoc.name,
          reports_generated: createdReports.length,
          correlation: correlationResult,
        };
      }

      default:
        throw new Error(`Unsupported simulation scenario: ${scenario}`);
    }
  }
}

export const simulationService = new SimulationService();
