-- ============================================================================
-- ParkSense IoT - Commercial Smart Parking System Supabase Database Schema
-- Run this script in your Supabase SQL Editor to set up all tables and security
-- ============================================================================

-- 1. Vehicle Audit & Parking Records Table
CREATE TABLE IF NOT EXISTS public.vehicle_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id VARCHAR(50) UNIQUE NOT NULL,
    plate VARCHAR(30) NOT NULL,
    bay VARCHAR(50) NOT NULL,
    entry_time TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    exit_time TIMESTAMP WITH TIME ZONE,
    duration VARCHAR(30),
    base_fare NUMERIC(10, 2) DEFAULT 0.00,
    tax NUMERIC(10, 2) DEFAULT 0.00,
    total_amount NUMERIC(10, 2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'PAID',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Parking Facilities Table (Used by Leaflet Map)
CREATE TABLE IF NOT EXISTS public.parking_facilities (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    tagline TEXT,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    address TEXT,
    rate_per_hour NUMERIC(10, 2) DEFAULT 30.00,
    two_wheeler_rate NUMERIC(10, 2) DEFAULT 15.00,
    suv_rate NUMERIC(10, 2) DEFAULT 40.00,
    ev_rate NUMERIC(10, 2) DEFAULT 50.00,
    total_spots INT DEFAULT 50,
    vacant_spots INT DEFAULT 20,
    rating NUMERIC(3, 1) DEFAULT 4.8,
    is_current_facility BOOLEAN DEFAULT false,
    features TEXT[] DEFAULT ARRAY['Covered Roof', '24/7 CCTV', 'EV Charging'],
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Parking Bays / Slots State Table
CREATE TABLE IF NOT EXISTS public.parking_slots (
    id VARCHAR(50) PRIMARY KEY,
    floor_id VARCHAR(20) NOT NULL,
    name VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'VACANT', -- 'VACANT', 'OCCUPIED', 'RESERVED', 'MAINTENANCE'
    plate VARCHAR(30),
    start_time TIMESTAMP WITH TIME ZONE,
    is_hardware BOOLEAN DEFAULT false,
    car_color VARCHAR(30) DEFAULT 'cyan',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Admin Settings & Tariff Config
CREATE TABLE IF NOT EXISTS public.admin_settings (
    key VARCHAR(50) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. System Activity Logs
CREATE TABLE IF NOT EXISTS public.system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- Enable Row Level Security (RLS) & Public Read/Write Access
-- ============================================================================
ALTER TABLE public.vehicle_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parking_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parking_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read-write for vehicle_records" ON public.vehicle_records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for parking_facilities" ON public.parking_facilities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for parking_slots" ON public.parking_slots FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for admin_settings" ON public.admin_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for system_logs" ON public.system_logs FOR ALL USING (true) WITH CHECK (true);

-- Enable Realtime Broadcasts on tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.vehicle_records;
ALTER PUBLICATION supabase_realtime ADD TABLE public.parking_slots;
ALTER PUBLICATION supabase_realtime ADD TABLE public.parking_facilities;

-- ============================================================================
-- Initial Data Seed
-- ============================================================================
INSERT INTO public.admin_settings (key, value)
VALUES 
    ('tariff_config', '{"ratePerHour": 30.0, "fastDemoRate": true, "taxPct": 0.05, "gracePeriodMins": 15}'::jsonb),
    ('barrier_config', '{"autoMode": true, "openAngle": 90, "closeAngle": 0}'::jsonb)
ON CONFLICT (key) DO NOTHING;
