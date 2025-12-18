-- SQL Fix for Admin Actions (Delete & Update)
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- 1. Ensure is_winner column exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='attendees' AND column_name='is_winner') THEN
        ALTER TABLE public.attendees ADD COLUMN is_winner BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- 2. Allow anyone to update attendees (Public Update Policy)
-- This is required for editing names and selecting winners from the frontend
DROP POLICY IF EXISTS "Anyone can update attendees" ON public.attendees;
CREATE POLICY "Anyone can update attendees" 
ON public.attendees 
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- 3. Allow anyone to delete attendees (Public Delete Policy)
-- This is required for the Admin Dashboard deletion feature
DROP POLICY IF EXISTS "Anyone can delete attendees" ON public.attendees;
CREATE POLICY "Anyone can delete attendees" 
ON public.attendees 
FOR DELETE 
USING (true);

-- 4. Ensure all other policies are also open for public access
DROP POLICY IF EXISTS "Anyone can view attendees" ON public.attendees;
CREATE POLICY "Anyone can view attendees" ON public.attendees FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can register" ON public.attendees;
CREATE POLICY "Anyone can register" ON public.attendees FOR INSERT WITH CHECK (true);
