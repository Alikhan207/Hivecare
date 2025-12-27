-- Create enum for bee species
CREATE TYPE public.bee_species AS ENUM (
  'apis_dorsata',
  'apis_cerana', 
  'apis_florea',
  'apis_mellifera',
  'unknown'
);

-- Create enum for colony behavior
CREATE TYPE public.colony_behavior AS ENUM (
  'calm',
  'agitated',
  'shimmering',
  'unknown'
);

-- Create enum for sighting status
CREATE TYPE public.sighting_status AS ENUM (
  'reported',
  'verified',
  'relocated',
  'monitoring',
  'resolved'
);

-- Create table for bee sightings
CREATE TABLE public.bee_sightings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  species bee_species DEFAULT 'unknown',
  confidence_score DECIMAL(5,2),
  behavior colony_behavior DEFAULT 'unknown',
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  address TEXT,
  image_url TEXT,
  analysis_result JSONB,
  status sighting_status DEFAULT 'reported',
  notes TEXT,
  proximity_warning BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for relocation requests
CREATE TABLE public.relocation_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sighting_id UUID REFERENCES public.bee_sightings(id) ON DELETE CASCADE NOT NULL,
  requester_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  guardian_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  request_type TEXT NOT NULL DEFAULT 'relocate',
  urgency TEXT DEFAULT 'normal',
  status TEXT DEFAULT 'pending',
  contact_phone TEXT,
  contact_email TEXT,
  additional_notes TEXT,
  scheduled_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for user profiles
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  user_type TEXT DEFAULT 'citizen',
  badges JSONB DEFAULT '[]'::jsonb,
  sightings_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.bee_sightings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relocation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bee_sightings
CREATE POLICY "Anyone can view bee sightings"
ON public.bee_sightings
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create sightings"
ON public.bee_sightings
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own sightings"
ON public.bee_sightings
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- RLS Policies for relocation_requests
CREATE POLICY "Users can view their own relocation requests"
ON public.relocation_requests
FOR SELECT
TO authenticated
USING (auth.uid() = requester_id OR auth.uid() = guardian_id);

CREATE POLICY "Authenticated users can create relocation requests"
ON public.relocation_requests
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update their own relocation requests"
ON public.relocation_requests
FOR UPDATE
TO authenticated
USING (auth.uid() = requester_id OR auth.uid() = guardian_id);

-- RLS Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone"
ON public.profiles
FOR SELECT
USING (true);

CREATE POLICY "Users can create their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for timestamp updates
CREATE TRIGGER update_bee_sightings_updated_at
BEFORE UPDATE ON public.bee_sightings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_relocation_requests_updated_at
BEFORE UPDATE ON public.relocation_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user profile creation
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to increment sightings count
CREATE OR REPLACE FUNCTION public.increment_sightings_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_id IS NOT NULL THEN
    UPDATE public.profiles
    SET sightings_count = sightings_count + 1
    WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to increment count on new sighting
CREATE TRIGGER on_new_sighting
AFTER INSERT ON public.bee_sightings
FOR EACH ROW EXECUTE FUNCTION public.increment_sightings_count();