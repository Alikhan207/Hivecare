-- Create storage bucket for bee sighting images
INSERT INTO storage.buckets (id, name, public)
VALUES ('bee-images', 'bee-images', true);

-- Create storage policies for bee-images bucket
CREATE POLICY "Anyone can view bee images"
ON storage.objects FOR SELECT
USING (bucket_id = 'bee-images');

CREATE POLICY "Authenticated users can upload bee images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'bee-images');

CREATE POLICY "Users can update their own bee images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'bee-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own bee images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'bee-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create urban_guardians table for relocators
CREATE TABLE public.urban_guardians (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  service_area TEXT,
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  radius_km INTEGER DEFAULT 25,
  is_available BOOLEAN DEFAULT true,
  rating DECIMAL(3, 2) DEFAULT 5.00,
  total_relocations INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.urban_guardians ENABLE ROW LEVEL SECURITY;

-- RLS policies for urban_guardians
CREATE POLICY "Anyone can view available guardians"
ON public.urban_guardians FOR SELECT
USING (is_available = true OR auth.uid() = user_id);

CREATE POLICY "Users can register as guardians"
ON public.urban_guardians FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Guardians can update their own profile"
ON public.urban_guardians FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_urban_guardians_updated_at
BEFORE UPDATE ON public.urban_guardians
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for bee_sightings
ALTER PUBLICATION supabase_realtime ADD TABLE public.bee_sightings;