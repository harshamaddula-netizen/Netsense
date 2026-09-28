// ==============================================================================
// NETSENSE CAMPUS - INCIDENT CORRELATION ENGINE
// ==============================================================================

import { db } from './db';
import { NetworkReport, Incident, IncidentEvent } from '../../src/types';

export class CorrelationService {
  private correlationWindowMinutes = 15;
  private correlationThresholdCount = 2; // Auto-group if 2+ reports match location in window

  /**
   * Evaluates an incoming or existing report and correlates it with active incidents
   * or triggers automated incident creation if a clustering threshold is met.
   */
  public correlateReport(report: NetworkReport): {
    correlated: boolean;
    incidentId: string | null;
    actionTaken: 'ATTACHED_TO_EXISTING' | 'CREATED_NEW_INCIDENT' | 'NONE';
  } {
    const activeIncidents = db.getIncidents().filter(
      (inc) => inc.location_id === report.location_id && inc.status !== 'RESOLVED'
    );

    // 1. Check if there's already an active incident in this exact location
    if (activeIncidents.length > 0) {
      const targetIncident = activeIncidents[0];
      // Correlate report to existing incident
      db.updateReport(report.id, {
        incident_id: targetIncident.id,
        status: 'CORRELATED',
      });

      // Append incident event
      db.addIncidentEvent(targetIncident.id, {
        event_type: 'REPORT_CORRELATED',
        description: `Correlated report #${report.id.substring(0, 8)} (${report.category}) from ${report.user_name || 'User'}`,
        metadata: {
          report_id: report.id,
          category: report.category,
          severity: report.severity,
          device_type: report.device_type,
        },
      });

      return {
        correlated: true,
        incidentId: targetIncident.id,
        actionTaken: 'ATTACHED_TO_EXISTING',
      };
    }

    // 2. Check recent uncorrelated reports in this location within the sliding window
    const now = Date.now();
    const windowStart = now - this.correlationWindowMinutes * 60 * 1000;

    const recentReports = db.getReports(undefined, report.location_id).filter((r) => {
      const reportTime = new Date(r.created_at).getTime();
      return reportTime >= windowStart && (!r.incident_id || r.status === 'SUBMITTED');
    });

    if (recentReports.length >= this.correlationThresholdCount) {
      // Gather latest telemetry measurement for evidence corroboration
      const measurements = db.getMeasurements(report.location_id, 1);
      const latestMetric = measurements[0];

      const location = db.getLocationById(report.location_id);
      const locationName = location?.name || 'Campus Location';

      // Generate descriptive title based on category clustering
      const categories = recentReports.map((r) => r.category);
      const primaryCategory = categories[0] || report.category;

      const incidentTitle = `Correlated Outage/Degradation in ${locationName}`;
      const description = `Automated incident correlation detected ${recentReports.length} student reports in ${locationName} within ${this.correlationWindowMinutes} minutes. Symptoms include ${primaryCategory.replace(/_/g, ' ').toLowerCase()}. Corroborated with ${latestMetric ? `${latestMetric.device_count} devices & ${latestMetric.latency_ms}ms latency` : 'telemetry'}.`;

      // Determine severity based on reports
      const hasCritical = recentReports.some((r) => r.severity === 'CRITICAL');
      const hasHigh = recentReports.some((r) => r.severity === 'HIGH');
      const severity = hasCritical ? 'CRITICAL' : hasHigh ? 'HIGH' : 'MEDIUM';

      // Create new incident
      const newIncident = db.createIncident({
        location_id: report.location_id,
        title: incidentTitle,
        description,
        severity,
        status: 'OPEN',
        detected_at: new Date().toISOString(),
        source: 'AUTOMATED_CORRELATION',
        correlated_report_ids: recentReports.map((r) => r.id),
      });

      // Link all recent reports to this new incident
      for (const r of recentReports) {
        db.updateReport(r.id, {
          incident_id: newIncident.id,
          status: 'CORRELATED',
        });
      }

      // Log event
      db.addIncidentEvent(newIncident.id, {
        event_type: 'AUTOMATED_CLUSTER_DETECTED',
        description: `Grouped ${recentReports.length} simultaneous reports into a unified actionable incident.`,
        metadata: {
          report_ids: recentReports.map((r) => r.id),
          primary_category: primaryCategory,
          latest_telemetry: latestMetric,
        },
      });

      return {
        correlated: true,
        incidentId: newIncident.id,
        actionTaken: 'CREATED_NEW_INCIDENT',
      };
    }

    return {
      correlated: false,
      incidentId: null,
      actionTaken: 'NONE',
    };
  }
}

export const correlationService = new CorrelationService();
