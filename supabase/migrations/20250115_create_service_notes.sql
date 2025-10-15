-- Create service_notes table for storing markdown documentation per service
CREATE TABLE IF NOT EXISTS public.service_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  service_name TEXT NOT NULL,
  markdown_content TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, service_name)
);

-- Enable Row Level Security
ALTER TABLE public.service_notes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own service notes
CREATE POLICY "Users can view their own service notes"
  ON public.service_notes
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own service notes
CREATE POLICY "Users can insert their own service notes"
  ON public.service_notes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own service notes
CREATE POLICY "Users can update their own service notes"
  ON public.service_notes
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own service notes
CREATE POLICY "Users can delete their own service notes"
  ON public.service_notes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_service_notes_user_service 
  ON public.service_notes(user_id, service_name);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_service_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_service_notes_updated_at
  BEFORE UPDATE ON public.service_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_service_notes_updated_at();
