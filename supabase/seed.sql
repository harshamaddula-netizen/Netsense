-- ==============================================================================
-- NETSENSE CAMPUS - SEED DATA
-- ==============================================================================

-- 1. Insert Campus Thresholds
INSERT INTO network_thresholds (id, metric_name, warning_value, critical_value, unit, is_active)
VALUES
    ('11111111-1111-1111-1111-111111111101', 'LATENCY', 70.0, 150.0, 'ms', true),
    ('11111111-1111-1111-1111-111111111102', 'PACKET_LOSS', 2.0, 5.0, '%', true),
    ('11111111-1111-1111-1111-111111111103', 'DEVICE_COUNT', 250.0, 400.0, 'devices', true),
    ('11111111-1111-1111-1111-111111111104', 'AVAILABILITY', 98.0, 90.0, '%', true)
ON CONFLICT (metric_name) DO UPDATE 
SET warning_value = EXCLUDED.warning_value, critical_value = EXCLUDED.critical_value;

-- 2. Insert Realistic Campus Locations
INSERT INTO campus_locations (id, name, building, floor, latitude, longitude, description, is_active)
VALUES
    ('22222222-2222-2222-2222-222222222201', 'Engineering Block - 2nd Floor Labs', 'Engineering Block', '2nd Floor', 12.9716, 77.5946, 'High density computer science labs & lecture halls with dual AP clusters.', true),
    ('22222222-2222-2222-2222-222222222202', 'Engineering Block - 1st Floor Classrooms', 'Engineering Block', '1st Floor', 12.9715, 77.5945, 'Mechanical & Civil engineering classrooms and lecture theatre.', true),
    ('22222222-2222-2222-2222-222222222203', 'Central Library & Learning Commons', 'Library Tower', '3rd Floor', 12.9720, 77.5950, 'Silent study zones, digital repository, and multi-user study carrels.', true),
    ('22222222-2222-2222-2222-222222222204', 'Science & Innovation Complex', 'Science Center', 'Ground Floor', 12.9725, 77.5938, 'Physics & Chemistry research wings, IoT testbed zone.', true),
    ('22222222-2222-2222-2222-222222222205', 'Student Hostels - Block A', 'Hostel Block A', 'All Floors', 12.9708, 77.5960, 'Residential student quarters, evening peak recreational traffic.', true),
    ('22222222-2222-2222-2222-222222222206', 'Student Hostels - Block B', 'Hostel Block B', 'All Floors', 12.9705, 77.5965, 'Residential student quarters with outdoor common study lounge.', true),
    ('22222222-2222-2222-2222-222222222207', 'Campus Cafeteria & Student Center', 'Dining & Social Hall', '1st Floor', 12.9712, 77.5935, 'Peak lunchtime concurrency hotspot with mobile devices.', true),
    ('22222222-2222-2222-2222-222222222208', 'Administrative Center & Auditorium', 'Admin Complex', 'Ground Floor', 12.9730, 77.5955, 'Executive offices, conference room, university gateway uplink.', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Initial Profiles (Seed demo users)
INSERT INTO profiles (id, full_name, email, role, department, year_of_study)
VALUES
    ('33333333-3333-3333-3333-333333333301', 'Alex Chen', 'alex.chen@student.netsense.edu', 'student', 'Computer Science & Engineering', 3),
    ('33333333-3333-3333-3333-333333333302', 'Dr. Sarah Mitchell', 'sarah.mitchell@faculty.netsense.edu', 'faculty', 'Information Technology', NULL),
    ('33333333-3333-3333-3333-333333333303', 'Marcus Vance', 'marcus.vance@admin.netsense.edu', 'admin', 'Network Operations Center (NOC)', NULL)
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Initial Baseline Network Measurements
INSERT INTO network_measurements (location_id, device_count, latency_ms, packet_loss_percent, availability_percent, status, source, measured_at)
VALUES
    ('22222222-2222-2222-2222-222222222201', 315, 95.4, 2.8, 99.1, 'WARNING', 'REAL', NOW() - INTERVAL '5 minutes'),
    ('22222222-2222-2222-2222-222222222202', 120, 24.2, 0.1, 100.0, 'NORMAL', 'REAL', NOW() - INTERVAL '5 minutes'),
    ('22222222-2222-2222-2222-222222222203', 185, 28.5, 0.4, 100.0, 'NORMAL', 'REAL', NOW() - INTERVAL '5 minutes'),
    ('22222222-2222-2222-2222-222222222204', 85, 18.0, 0.0, 100.0, 'NORMAL', 'REAL', NOW() - INTERVAL '5 minutes'),
    ('22222222-2222-2222-2222-222222222205', 210, 38.0, 0.8, 99.8, 'NORMAL', 'REAL', NOW() - INTERVAL '5 minutes'),
    ('22222222-2222-2222-2222-222222222206', 195, 32.5, 0.5, 99.9, 'NORMAL', 'REAL', NOW() - INTERVAL '5 minutes'),
    ('22222222-2222-2222-2222-222222222207', 280, 82.0, 2.2, 98.7, 'WARNING', 'REAL', NOW() - INTERVAL '5 minutes'),
    ('22222222-2222-2222-2222-222222222208', 45, 14.8, 0.0, 100.0, 'NORMAL', 'REAL', NOW() - INTERVAL '5 minutes');

-- 5. Insert an Initial Pre-correlated Incident for Demo & Clarity
INSERT INTO incidents (id, location_id, title, description, severity, status, detected_at, source)
VALUES
    ('44444444-4444-4444-4444-444444444401', '22222222-2222-2222-2222-222222222201', 'High Concurrency Degrades Throughput in Eng Block L2', 'Multiple students reporting severe buffering and delayed socket handshakes during lab hours. Corroborated with AP load exceeding 300 devices.', 'MEDIUM', 'INVESTIGATING', NOW() - INTERVAL '25 minutes', 'AUTOMATED_CORRELATION')
ON CONFLICT (id) DO NOTHING;

-- 6. Insert Incident Events
INSERT INTO incident_events (incident_id, event_type, description, metadata, created_by)
VALUES
    ('44444444-4444-4444-4444-444444444401', 'CORRELATION_TRIGGERED', 'System grouped 4 user reports submitted within 10 minutes from Engineering Block 2nd Floor.', '{"report_count": 4, "avg_latency": 94}'::jsonb, '33333333-3333-3333-3333-333333333303'),
    ('44444444-4444-4444-4444-444444444401', 'STATUS_CHANGE', 'Incident acknowledged by NOC Admin Marcus Vance. Dynamic channel width adjustment scheduled.', '{"previous_status": "OPEN", "new_status": "INVESTIGATING"}'::jsonb, '33333333-3333-3333-3333-333333333303')
ON CONFLICT (id) DO NOTHING;
