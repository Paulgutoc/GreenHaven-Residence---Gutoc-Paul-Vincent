-- =====================================================================
-- Green Haven Residence EMS - Supabase Database Schema
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- =====================================================================

-- 1. EMPLOYEES TABLE
CREATE TABLE IF NOT EXISTS public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  birthdate DATE,
  gender VARCHAR(20),
  address TEXT,
  province VARCHAR(100),
  city VARCHAR(100),
  zip VARCHAR(20),
  contact_number VARCHAR(50),
  company_email VARCHAR(255) UNIQUE NOT NULL,
  department VARCHAR(100) NOT NULL DEFAULT 'Operations',
  role VARCHAR(50) NOT NULL DEFAULT 'Employee', -- 'Employee' or 'Department Manager'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ACCOUNTS TABLE
CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id VARCHAR(50) UNIQUE NOT NULL REFERENCES public.employees(employee_id) ON DELETE CASCADE,
  username VARCHAR(100) UNIQUE,
  password_hash TEXT,
  default_password TEXT,
  verification_token TEXT,
  activated BOOLEAN DEFAULT FALSE,
  must_change_password BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ATTENDANCE TABLE
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id VARCHAR(50) NOT NULL REFERENCES public.employees(employee_id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  time_in TIME,
  time_out TIME,
  shift VARCHAR(50) DEFAULT 'Day Shift (8:00 AM - 5:00 PM)',
  status VARCHAR(50) NOT NULL DEFAULT 'Present', -- 'Present', 'On Leave', 'Absent'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, date)
);

-- 4. TASKS TABLE
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  address TEXT,
  assigned_employee VARCHAR(50) NOT NULL REFERENCES public.employees(employee_id) ON DELETE CASCADE,
  assigned_by VARCHAR(50) REFERENCES public.employees(employee_id),
  due_date TIMESTAMPTZ,
  status VARCHAR(50) DEFAULT 'Assigned', -- 'Assigned', 'Pending Approval', 'Completed', 'Overdue'
  proof_file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  audience VARCHAR(100) DEFAULT 'All Employees', -- 'All Employees', 'Operations', 'Maintenance', etc.
  date DATE DEFAULT CURRENT_DATE,
  status VARCHAR(50) DEFAULT 'Published', -- 'Draft', 'Published'
  author VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. LEAVE REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id VARCHAR(50) NOT NULL REFERENCES public.employees(employee_id) ON DELETE CASCADE,
  leave_type VARCHAR(100) NOT NULL, -- 'Vacation Leave', 'Sick Leave', 'Emergency Leave'
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_half_day BOOLEAN DEFAULT FALSE,
  days_count NUMERIC(4, 1) NOT NULL DEFAULT 1.0,
  reason TEXT,
  status VARCHAR(50) DEFAULT 'Pending', -- 'Pending', 'Approved', 'Rejected'
  decided_by VARCHAR(50) REFERENCES public.employees(employee_id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. LEAVE BALANCES TABLE
CREATE TABLE IF NOT EXISTS public.leave_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id VARCHAR(50) NOT NULL REFERENCES public.employees(employee_id) ON DELETE CASCADE,
  leave_type VARCHAR(100) NOT NULL,
  days_allowed NUMERIC(4, 1) DEFAULT 15.0,
  days_used NUMERIC(4, 1) DEFAULT 0.0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, leave_type)
);

-- 8. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender VARCHAR(50) NOT NULL REFERENCES public.employees(employee_id),
  recipient VARCHAR(50) NOT NULL REFERENCES public.employees(employee_id),
  body TEXT NOT NULL,
  sent_time TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) Enablement
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Allow anon read for public demonstration or configure based on Supabase Auth
CREATE POLICY "Public read announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Employees can view own record" ON public.employees FOR SELECT USING (true);
CREATE POLICY "Service role full access employees" ON public.employees USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access accounts" ON public.accounts USING (true) WITH CHECK (true);

-- =====================================================================
-- INITIAL SEED DATA FOR TESTING ACTIVATION
-- =====================================================================
INSERT INTO public.employees (
  employee_id, name, birthdate, gender, address, province, city, zip, contact_number, company_email, department, role
) VALUES
(
  'EM-2026-001',
  'Paul Vincent Gutoc',
  '1995-04-12',
  'Male',
  'Block 4 Lot 12 Green Haven Avenue',
  'Laguna',
  'Santa Rosa',
  '4026',
  '+63 912 345 6789',
  'paul.vincent@greenhavenresidence.com',
  'Management',
  'Department Manager'
),
(
  'EM-2026-002',
  'Maria Santos',
  '1998-08-25',
  'Female',
  'Block 2 Lot 8 Jasmine St',
  'Laguna',
  'Santa Rosa',
  '4026',
  '+63 917 888 1234',
  'maria.santos@greenhavenresidence.com',
  'Operations',
  'Employee'
)
ON CONFLICT (employee_id) DO NOTHING;
