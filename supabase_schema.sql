-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 0. Enums (Custom Types)
-- ==========================================
CREATE TYPE ticket_state AS ENUM ('pending', 'taken', 'closed');
CREATE TYPE technician_state AS ENUM ('available', 'busy', 'absent');

-- ==========================================
-- 1. Employees Table (Users submitting tickets)
-- ==========================================
CREATE TABLE employees (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    department TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 2. Technicians Table (Admins fixing tickets)
-- ==========================================
CREATE TABLE technicians (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    bio TEXT,
    status technician_state NOT NULL DEFAULT 'available',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- Auth Trigger: Handle Auto-routing & Email Restrictions
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- 1. Check if the user is a whitelisted technician
  IF new.email IN ('test@itfix.com', 'admin@itfix.com') THEN
    INSERT INTO public.technicians (id, full_name, email)
    VALUES (
      new.id, 
      COALESCE(new.raw_user_meta_data->>'full_name', 'Technician'), 
      new.email
    );
    
  -- 2. Check if the user has a valid employee email (@estin.dz)
  ELSIF new.email LIKE '%@estin.dz' THEN
    INSERT INTO public.employees (id, full_name, email)
    VALUES (
      new.id, 
      COALESCE(new.raw_user_meta_data->>'full_name', 'Employee'), 
      new.email
    );
    
  -- 3. Block any other email addresses from creating accounts
  ELSE
    RAISE EXCEPTION 'Access denied. You must use an @estin.dz email or be a whitelisted technician.';
  END IF;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==========================================
-- 3. Tickets Table
-- ==========================================
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    short_id TEXT UNIQUE NOT NULL DEFAULT substring(md5(random()::text) from 1 for 8), 
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    urgency TEXT NOT NULL,
    status ticket_state NOT NULL DEFAULT 'pending', -- Enum: pending, taken, closed
    image_url TEXT, -- Optional screenshot or image attachment
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    technician_id UUID REFERENCES technicians(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 4. Ticket Comments Table
-- ==========================================
CREATE TABLE ticket_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
    
    author_id UUID NOT NULL, 
    author_role TEXT NOT NULL, -- 'employee' or 'technician'
    
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- Trigger: Auto-update 'updated_at' on Tickets
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_tickets_updated_at ON tickets;
CREATE TRIGGER update_tickets_updated_at
    BEFORE UPDATE ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- Security: Row Level Security (RLS)
-- ==========================================
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------
-- Employees Policies
-- ------------------------------------------
-- Anyone can view basic employee details (needed for UI display)
CREATE POLICY "Anyone can view employees" ON employees FOR SELECT USING (true);
-- Employees can only update their own profile
CREATE POLICY "Employees can update their own profile" ON employees FOR UPDATE USING (auth.uid() = id);

-- ------------------------------------------
-- Technicians Policies
-- ------------------------------------------
-- Anyone can view technician details (needed for the browse technicians page)
CREATE POLICY "Anyone can view technicians" ON technicians FOR SELECT USING (true);
-- Technicians can only update their own profile
CREATE POLICY "Technicians can update their own profile" ON technicians FOR UPDATE USING (auth.uid() = id);

-- ------------------------------------------
-- Tickets Policies
-- ------------------------------------------
-- Employees can view tickets they created, Technicians can view tickets assigned to them
CREATE POLICY "View tickets" ON tickets FOR SELECT 
USING (auth.uid() = employee_id OR auth.uid() = technician_id);

-- Only employees can create tickets (and they must set themselves as the employee_id)
CREATE POLICY "Create tickets" ON tickets FOR INSERT 
WITH CHECK (auth.uid() = employee_id);

-- Both employees and assigned technicians can update the ticket (e.g., status, urgency)
CREATE POLICY "Update tickets" ON tickets FOR UPDATE 
USING (auth.uid() = employee_id OR auth.uid() = technician_id);

-- ------------------------------------------
-- Ticket Comments Policies
-- ------------------------------------------
-- Users can read comments on tickets they have access to
CREATE POLICY "View comments" ON ticket_comments FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM tickets 
    WHERE tickets.id = ticket_comments.ticket_id 
    AND (tickets.employee_id = auth.uid() OR tickets.technician_id = auth.uid())
  )
);

-- Users can only insert comments on tickets they have access to, and must be the author
CREATE POLICY "Create comments" ON ticket_comments FOR INSERT 
WITH CHECK (
  auth.uid() = author_id AND
  EXISTS (
    SELECT 1 FROM tickets 
    WHERE tickets.id = ticket_comments.ticket_id 
    AND (tickets.employee_id = auth.uid() OR tickets.technician_id = auth.uid())
  )
);
