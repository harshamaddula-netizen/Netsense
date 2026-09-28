import { z } from 'zod';

// ==============================================================================
// NETSENSE CAMPUS - ZOD VALIDATION SCHEMAS
// ==============================================================================

export const UserRoleSchema = z.enum(['student', 'faculty', 'admin']);

export const NetworkStatusSchema = z.enum(['NORMAL', 'WARNING', 'CRITICAL', 'UNKNOWN']);
export const TelemetrySourceSchema = z.enum(['REAL', 'DEMO', 'CLIENT']);
export const SeverityLevelSchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
export const IncidentStatusSchema = z.enum(['OPEN', 'INVESTIGATING', 'MITIGATED', 'RESOLVED']);
export const ReportStatusSchema = z.enum(['SUBMITTED', 'CORRELATED', 'INVESTIGATING', 'RESOLVED']);

export const ReportCategorySchema = z.enum([
  'NO_INTERNET',
  'CANNOT_CONNECT',
  'FREQUENT_DISCONNECT',
  'CONNECTED_NO_INTERNET',
  'SLOW_INTERNET',
  'HIGH_LATENCY',
  'PACKET_LOSS',
  'BUFFERING',
  'AUTHENTICATION_FAILURE',
  'LOGIN_PROBLEM',
  'DNS_FAILURE',
  'DNS_SLOW',
  'HIGH_DEVICE_LOAD',
  'NETWORK_OUTAGE',
  'ACCESS_POINT_ISSUE',
  'UPLINK_ISSUE',
  'OTHER',
]);

// Diagnostic Result Schema
export const DiagnosticResultSchema = z.object({
  timestamp: z.string(),
  source: z.literal('CLIENT'),
  is_online: z.boolean(),
  latency_ms: z.number().min(0).max(10000),
  jitter_ms: z.number().min(0).max(10000),
  packet_loss_percent: z.number().min(0).max(100),
  dns_reachable: z.boolean(),
  api_reachable: z.boolean(),
  download_speed_mbps: z.number().nullable().optional(),
  connection_type: z.string().optional(),
  client_assessment: z.object({
    status: NetworkStatusSchema,
    summary: z.string(),
    details: z.array(z.string()),
    is_client_side_problem: z.boolean(),
  }),
});

// Network Report Create Schema
export const CreateReportSchema = z.object({
  user_id: z.string().uuid().optional().nullable(),
  location_id: z.string().uuid({ message: 'Invalid location selection' }),
  category: ReportCategorySchema,
  description: z
    .string()
    .min(5, { message: 'Description must be at least 5 characters' })
    .max(1000, { message: 'Description must not exceed 1000 characters' }),
  severity: SeverityLevelSchema.default('MEDIUM'),
  device_type: z.enum(['Laptop', 'Mobile', 'Tablet', 'Desktop', 'Other']).default('Laptop'),
  diagnostic_data: DiagnosticResultSchema.nullable().optional(),
});

// Update Report Schema
export const UpdateReportSchema = z.object({
  status: ReportStatusSchema.optional(),
  severity: SeverityLevelSchema.optional(),
  incident_id: z.string().uuid().nullable().optional(),
});

// Create Incident Schema
export const CreateIncidentSchema = z.object({
  location_id: z.string().uuid({ message: 'Invalid location' }),
  title: z.string().min(5).max(150),
  description: z.string().min(10).max(2000),
  severity: SeverityLevelSchema.default('MEDIUM'),
  status: IncidentStatusSchema.default('OPEN'),
  source: z.string().default('ADMIN_CREATED'),
});

// Update Incident Schema
export const UpdateIncidentSchema = z.object({
  title: z.string().min(5).max(150).optional(),
  description: z.string().min(10).max(2000).optional(),
  severity: SeverityLevelSchema.optional(),
  status: IncidentStatusSchema.optional(),
  resolved_at: z.string().nullable().optional(),
});

// Add Incident Event Schema
export const CreateIncidentEventSchema = z.object({
  event_type: z.string().min(2).max(50),
  description: z.string().min(3).max(1000),
  metadata: z.record(z.any()).optional(),
  created_by: z.string().uuid().optional().nullable(),
});

// Thresholds Schema
export const NetworkThresholdSchema = z.object({
  metric_name: z.string().min(2).max(50),
  warning_value: z.number().min(0),
  critical_value: z.number().min(0),
  unit: z.string().min(1).max(20),
  is_active: z.boolean().default(true),
});

export const UpdateThresholdSchema = z.object({
  warning_value: z.number().min(0).optional(),
  critical_value: z.number().min(0).optional(),
  is_active: z.boolean().optional(),
});

// AI Schemas (Enforcing strict contract from Gemini outputs)
export const AITroubleshootResponseSchema = z.object({
  problem_category: z.string(),
  assessment: z.string(),
  steps: z.array(
    z.object({
      step: z.number(),
      instruction: z.string(),
      expected_result: z.string(),
    })
  ),
  need_more_information: z.boolean(),
  question: z.string().nullable(),
  recommend_report: z.boolean(),
  reason: z.string(),
});

export const AIIncidentSummarySchema = z.object({
  summary: z.string(),
  affected_area: z.string(),
  severity: SeverityLevelSchema,
  evidence: z.array(z.string()),
  possible_causes: z.array(z.string()),
  recommended_investigation: z.array(z.string()),
  confidence: z.enum(['LOW', 'MEDIUM', 'HIGH']),
});

export const AINetworkAnalysisSchema = z.object({
  network_status: NetworkStatusSchema,
  observations: z.array(z.string()),
  anomalies: z.array(z.string()),
  trend: z.enum(['IMPROVING', 'STABLE', 'DEGRADING', 'UNKNOWN']),
  recommendations: z.array(z.string()),
  confidence: z.enum(['LOW', 'MEDIUM', 'HIGH']),
});

// Chat Input Schema
export const ChatMessageInputSchema = z.object({
  session_id: z.string().uuid().optional(),
  user_id: z.string().uuid().optional().nullable(),
  message: z.string().min(1).max(2000),
  location_id: z.string().uuid().optional().nullable(),
  location_name: z.string().optional().nullable(),
  diagnostics: DiagnosticResultSchema.optional().nullable(),
});

// Simulator Request Schema
export const SimulatorRequestSchema = z.object({
  scenario: z.enum(['NORMAL', 'HIGH_LOAD', 'HIGH_LATENCY', 'PACKET_LOSS', 'OUTAGE', 'CROWD_BURST']),
  target_location_id: z.string().uuid().optional(),
  duration_minutes: z.number().min(1).max(120).default(30),
});
