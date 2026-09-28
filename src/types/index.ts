// ==============================================================================
// NETSENSE CAMPUS - CORE TYPE DEFINITIONS
// ==============================================================================

export type UserRole = 'student' | 'faculty' | 'admin';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone_number?: string | null;
  role: UserRole;
  department?: string | null;
  year_of_study?: number | null;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: UserProfile;
  token: string;
}

export interface CampusLocation {
  id: string;
  name: string;
  building: string;
  floor: string;
  latitude: number;
  longitude: number;
  description?: string | null;
  is_active: boolean;
  created_at?: string;
  // Computed / latest metrics when joined
  latest_measurement?: NetworkMeasurement;
  active_incident_count?: number;
  recent_report_count?: number;
}

export type NetworkStatus = 'NORMAL' | 'WARNING' | 'CRITICAL' | 'UNKNOWN';
export type TelemetrySource = 'REAL' | 'DEMO' | 'CLIENT';

export interface NetworkMeasurement {
  id: string;
  location_id: string;
  location_name?: string;
  device_count: number;
  latency_ms: number;
  packet_loss_percent: number;
  availability_percent: number;
  status: NetworkStatus;
  source: TelemetrySource;
  measured_at: string;
  created_at?: string;
}

export type ReportCategory =
  | 'NO_INTERNET'
  | 'CANNOT_CONNECT'
  | 'FREQUENT_DISCONNECT'
  | 'CONNECTED_NO_INTERNET'
  | 'SLOW_INTERNET'
  | 'HIGH_LATENCY'
  | 'PACKET_LOSS'
  | 'BUFFERING'
  | 'AUTHENTICATION_FAILURE'
  | 'LOGIN_PROBLEM'
  | 'DNS_FAILURE'
  | 'DNS_SLOW'
  | 'HIGH_DEVICE_LOAD'
  | 'NETWORK_OUTAGE'
  | 'ACCESS_POINT_ISSUE'
  | 'UPLINK_ISSUE'
  | 'OTHER';

export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ReportStatus = 'SUBMITTED' | 'CORRELATED' | 'INVESTIGATING' | 'RESOLVED';

export interface NetworkReport {
  id: string;
  user_id: string | null;
  user_name?: string;
  user_role?: UserRole;
  location_id: string;
  location_name?: string;
  category: ReportCategory;
  description: string;
  severity: SeverityLevel;
  device_type?: string;
  diagnostic_data?: DiagnosticResult | null;
  status: ReportStatus;
  incident_id?: string | null;
  created_at: string;
  updated_at: string;
}

export type IncidentStatus = 'OPEN' | 'INVESTIGATING' | 'MITIGATED' | 'RESOLVED';

export interface Incident {
  id: string;
  location_id: string;
  location_name?: string;
  title: string;
  description: string;
  severity: SeverityLevel;
  status: IncidentStatus;
  detected_at: string;
  resolved_at?: string | null;
  source: string;
  correlated_report_ids?: string[];
  correlated_reports?: NetworkReport[];
  events?: IncidentEvent[];
  ai_summary?: AIIncidentSummary | null;
  created_at: string;
  updated_at: string;
}

export interface IncidentEvent {
  id: string;
  incident_id: string;
  event_type: string;
  description: string;
  metadata?: Record<string, any>;
  created_by?: string | null;
  created_at: string;
}

export interface NetworkThreshold {
  id: string;
  metric_name: string; // 'LATENCY', 'PACKET_LOSS', 'DEVICE_COUNT', 'AVAILABILITY'
  warning_value: number;
  critical_value: number;
  unit: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// Client-side Safe Diagnostics Data
export interface DiagnosticResult {
  timestamp: string;
  source: 'CLIENT';
  is_online: boolean;
  latency_ms: number;
  jitter_ms: number;
  packet_loss_percent: number;
  dns_reachable: boolean;
  api_reachable: boolean;
  download_speed_mbps?: number | null;
  connection_type?: string;
  client_assessment: {
    status: NetworkStatus;
    summary: string;
    details: string[];
    is_client_side_problem: boolean;
  };
}

// Network Health Engine Assessment
export interface NetworkHealthAssessment {
  status: NetworkStatus;
  severity: SeverityLevel;
  reasons: string[];
  metrics: {
    device_count: number;
    latency_ms: number;
    packet_loss_percent: number;
    availability_percent: number;
  };
  thresholds_exceeded: string[];
  timestamp: string;
}

// AI Schemas
export interface AITroubleshootResponse {
  problem_category: string;
  assessment: string;
  steps: Array<{
    step: number;
    instruction: string;
    expected_result: string;
  }>;
  need_more_information: boolean;
  question: string | null;
  recommend_report: boolean;
  reason: string;
}

export interface AIIncidentSummary {
  summary: string;
  affected_area: string;
  severity: SeverityLevel;
  evidence: string[];
  possible_causes: string[];
  recommended_investigation: string[];
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface AINetworkAnalysis {
  network_status: NetworkStatus;
  observations: string[];
  anomalies: string[];
  trend: 'IMPROVING' | 'STABLE' | 'DEGRADING' | 'UNKNOWN';
  recommendations: string[];
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
}

// Chat Session
export interface ChatMessage {
  id: string;
  session_id: string;
  sender: 'user' | 'assistant' | 'system';
  message: string;
  metadata?: {
    troubleshooting?: AITroubleshootResponse;
    diagnostic_attached?: boolean;
    quick_options?: string[];
    action_prompt?: {
      type: 'RUN_DIAGNOSTIC' | 'CREATE_REPORT';
      label: string;
    };
  };
  created_at: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  context?: Record<string, any>;
  created_at: string;
  updated_at: string;
  messages?: ChatMessage[];
}

// Simulator Scenarios
export type SimulatorScenario =
  | 'NORMAL'
  | 'HIGH_LOAD'
  | 'HIGH_LATENCY'
  | 'PACKET_LOSS'
  | 'OUTAGE'
  | 'CROWD_BURST';

// Standard API Response
export interface ApiResponse<T = any> {
  success: boolean;
  data: T | null;
  error: {
    code: string;
    message: string;
  } | null;
}

// Available Networks Telemetry
export interface AvailableNetwork {
  ssid: string;
  bssid: string | null;
  signal_percent: number;
  signal_quality: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  security_type: string;
  encryption: string;
  band: string | null;
  channel: number | null;
  radio_type: string | null;
  network_type: string;
  is_connected: boolean;
}

export interface NetworkScanReport {
  connected_network: {
    connected: boolean;
    ssid: string | null;
    bssid: string | null;
    signal_percent: number | null;
    signal_quality: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'DISCONNECTED';
    band: string | null;
    channel: number | null;
    radio_type: string | null;
    adapter_name: string | null;
    receive_rate_mbps: number | null;
    transmit_rate_mbps: number | null;
    rssi_dbm: number | null;
    timestamp: string;
    source: 'SYSTEM_HARDWARE_INTERFACE';
  } | null;
  available_networks: AvailableNetwork[];
  scan_timestamp: string;
  networks_count: number;
  platform: {
    os: string;
    hardware_scan_supported: boolean;
    restriction_notice: string | null;
  };
}

// Live Speed & Continuous Monitoring
export interface LiveSpeedMeasurement {
  id: string;
  timestamp: string;
  download_speed_mbps: number;
  upload_speed_mbps: number;
  latency_ms: number;
  jitter_ms: number;
  packet_loss_percent: number;
  connection_status: 'CONNECTED' | 'DISCONNECTED' | 'TESTING' | 'POOR' | 'GOOD';
  network_type: string;
  signal_percent?: number | null;
  client_ip?: string;
  location?: {
    latitude: number;
    longitude: number;
    accuracy_meters: number;
  } | null;
}

// Network History Storage
export interface NetworkHistoryRecord {
  id: string;
  timestamp: string;
  download_speed_mbps: number;
  upload_speed_mbps: number;
  latency_ms: number;
  jitter_ms: number;
  packet_loss_percent: number;
  network_name: string;
  network_type: string;
  signal_percent: number | null;
  client_ip?: string;
  status: 'GOOD' | 'FAIR' | 'POOR' | 'DISCONNECTED';
  location?: {
    latitude: number;
    longitude: number;
    accuracy_meters: number;
  } | null;
}

