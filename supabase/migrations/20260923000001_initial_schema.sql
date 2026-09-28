-- ==============================================================================
-- NETSENSE CAMPUS - DATABASE SCHEMA (PostgreSQL / Supabase)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum Types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('student', 'faculty', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE network_status AS ENUM ('NORMAL', 'WARNING', 'CRITICAL', 'UNKNOWN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE telemetry_source AS ENUM ('REAL', 'DEMO', 'CLIENT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE report_category AS ENUM (
        'NO_INTERNET', 'CANNOT_CONNECT', 'FREQUENT_DISCONNECT', 'CONNECTED_NO_INTERNET',
        'SLOW_INTERNET', 'HIGH_LATENCY', 'PACKET_LOSS', 'BUFFERING',
        'AUTHENTICATION_FAILURE', 'LOGIN_PROBLEM',
        'DNS_FAILURE', 'DNS_SLOW',
        'HIGH_DEVICE_LOAD', 'NETWORK_OUTAGE', 'ACCESS_POINT_ISSUE', 'UPLINK_ISSUE',
        'OTHER'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE severity_level AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE incident_status AS ENUM ('OPEN', 'INVESTIGATING', 'MITIGATED', 'RESOLVED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE report_status AS ENUM ('SUBMITTED', 'CORRELATED', 'INVESTIGATING', 'RESOLVED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role user_role NOT NULL DEFAULT 'student',
    department TEXT,
    year_of_study INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. campus_locations table
CREATE TABLE IF NOT EXISTS campus_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    building TEXT NOT NULL,
    floor TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. network_measurements table
CREATE TABLE IF NOT EXISTS network_measurements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id UUID NOT NULL REFERENCES campus_locations(id) ON DELETE CASCADE,
    device_count INTEGER NOT NULL DEFAULT 0,
    latency_ms DOUBLE PRECISION NOT NULL DEFAULT 0,
    packet_loss_percent DOUBLE PRECISION NOT NULL DEFAULT 0,
    availability_percent DOUBLE PRECISION NOT NULL DEFAULT 100,
    status network_status NOT NULL DEFAULT 'NORMAL',
    source telemetry_source NOT NULL DEFAULT 'REAL',
    measured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. network_reports table
CREATE TABLE IF NOT EXISTS network_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    location_id UUID NOT NULL REFERENCES campus_locations(id) ON DELETE CASCADE,
    category report_category NOT NULL,
    description TEXT NOT NULL,
    severity severity_level NOT NULL DEFAULT 'MEDIUM',
    device_type TEXT DEFAULT 'Laptop',
    diagnostic_data JSONB DEFAULT '{}'::jsonb,
    status report_status NOT NULL DEFAULT 'SUBMITTED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. incidents table
CREATE TABLE IF NOT EXISTS incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id UUID NOT NULL REFERENCES campus_locations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    severity severity_level NOT NULL DEFAULT 'MEDIUM',
    status incident_status NOT NULL DEFAULT 'OPEN',
    detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    source TEXT NOT NULL DEFAULT 'AUTOMATED_CORRELATION',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. incident_events table
CREATE TABLE IF NOT EXISTS incident_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. network_thresholds table
CREATE TABLE IF NOT EXISTS network_thresholds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_name TEXT NOT NULL UNIQUE,
    warning_value DOUBLE PRECISION NOT NULL,
    critical_value DOUBLE PRECISION NOT NULL,
    unit TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. ai_reports table
CREATE TABLE IF NOT EXISTS ai_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE,
    report_type TEXT NOT NULL,
    summary TEXT NOT NULL,
    recommendations JSONB DEFAULT '[]'::jsonb,
    risk_level severity_level NOT NULL DEFAULT 'MEDIUM',
    model TEXT NOT NULL DEFAULT 'gemini-1.5-flash',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. chat_sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Troubleshooting Session',
    context JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    sender TEXT NOT NULL, -- 'user', 'assistant', 'system'
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_network_measurements_location_id ON network_measurements(location_id);
CREATE INDEX IF NOT EXISTS idx_network_measurements_measured_at ON network_measurements(measured_at DESC);
CREATE INDEX IF NOT EXISTS idx_network_reports_location_id ON network_reports(location_id);
CREATE INDEX IF NOT EXISTS idx_network_reports_user_id ON network_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_network_reports_created_at ON network_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_network_reports_status ON network_reports(status);
CREATE INDEX IF NOT EXISTS idx_incidents_location_id ON incidents(location_id);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents(severity);
CREATE INDEX IF NOT EXISTS idx_incident_events_incident_id ON incident_events(incident_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE campus_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE network_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE network_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE network_thresholds ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all basic profiles, update their own
CREATE POLICY "Public profiles are readable" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Campus Locations: Public read
CREATE POLICY "Locations readable by all" ON campus_locations FOR SELECT USING (true);
CREATE POLICY "Locations editable by admin only" ON campus_locations FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Measurements: Public read
CREATE POLICY "Measurements readable by all" ON network_measurements FOR SELECT USING (true);
CREATE POLICY "Measurements insertable by service/admin" ON network_measurements FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin') OR auth.uid() IS NULL
);

-- Reports: Users can create and read own reports; Admins can read all
CREATE POLICY "Users can read own reports" ON network_reports FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Users can insert reports" ON network_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update reports" ON network_reports FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Incidents: Public read for transparency; Admin manage
CREATE POLICY "Incidents readable by all" ON incidents FOR SELECT USING (true);
CREATE POLICY "Incidents manageable by admin" ON incidents FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Incident Events: Public read
CREATE POLICY "Incident events readable by all" ON incident_events FOR SELECT USING (true);
CREATE POLICY "Incident events insertable by admin" ON incident_events FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Thresholds: Public read, Admin manage
CREATE POLICY "Thresholds readable by all" ON network_thresholds FOR SELECT USING (true);
CREATE POLICY "Thresholds manageable by admin" ON network_thresholds FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- AI Reports: Admin view
CREATE POLICY "AI reports viewable by admin" ON ai_reports FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Chat: Users own their sessions
CREATE POLICY "Users can manage own chat sessions" ON chat_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own chat messages" ON chat_messages FOR ALL USING (
    EXISTS (SELECT 1 FROM chat_sessions WHERE chat_sessions.id = chat_messages.session_id AND chat_sessions.user_id = auth.uid())
);
