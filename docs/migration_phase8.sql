-- Phase 8: Worker PIN Auth + Shift Enhancements
-- Run this in Supabase SQL Editor

-- Add PIN to workers (nullable, existing workers won't have PINs)
ALTER TABLE workers ADD COLUMN IF NOT EXISTS pin TEXT DEFAULT NULL;

-- Add type and reason to shifts for absence requests
ALTER TABLE shifts ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'shift';
ALTER TABLE shifts ADD COLUMN IF NOT EXISTS reason TEXT DEFAULT '';
