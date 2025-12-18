-- Create attendees table for event registration
CREATE TABLE public.attendees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  face_type INTEGER NOT NULL DEFAULT 1,
  clothes_type INTEGER NOT NULL DEFAULT 1,
  pants_type INTEGER NOT NULL DEFAULT 1,
  hair_color TEXT NOT NULL DEFAULT '#2D1B0E',
  skin_color TEXT NOT NULL DEFAULT '#FFDCB5',
  face_photo_url TEXT,
  position_x REAL NOT NULL DEFAULT 0,
  position_y REAL NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.attendees ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read attendees (public event)
CREATE POLICY "Anyone can view attendees" 
ON public.attendees 
FOR SELECT 
USING (true);

-- Allow anyone to register (public event)
CREATE POLICY "Anyone can register" 
ON public.attendees 
FOR INSERT 
WITH CHECK (true);

-- Create storage bucket for face photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('face-photos', 'face-photos', true);

-- Allow anyone to upload face photos
CREATE POLICY "Anyone can upload face photos"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'face-photos');

-- Allow anyone to view face photos
CREATE POLICY "Anyone can view face photos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'face-photos');

-- Enable realtime for attendees
ALTER PUBLICATION supabase_realtime ADD TABLE public.attendees;