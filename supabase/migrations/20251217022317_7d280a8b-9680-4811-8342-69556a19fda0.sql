-- TCLE Configuration table
CREATE TABLE public.tcle_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  file_url TEXT,
  version_tag TEXT NOT NULL DEFAULT 'TCLE_v1.0',
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AUT Stimuli table
CREATE TABLE public.aut_stimuli (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  object_name TEXT NOT NULL,
  instruction_text TEXT,
  image_url TEXT,
  suggested_time_seconds INTEGER DEFAULT 180,
  display_order INTEGER NOT NULL DEFAULT 0,
  version_tag TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- FIQ Stimuli table
CREATE TABLE public.fiq_stimuli (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  question_text TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  version_tag TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ethical Dilemmas table
CREATE TABLE public.ethical_dilemmas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dilemma_text TEXT NOT NULL,
  likert_scale_type INTEGER NOT NULL DEFAULT 5,
  display_order INTEGER NOT NULL DEFAULT 0,
  version_tag TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Participants table
CREATE TABLE public.participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_id UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  tcle_version_tag TEXT,
  consent_given BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'declined')),
  device_type TEXT,
  user_agent TEXT,
  screen_resolution TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Sociodemographic data table
CREATE TABLE public.sociodemographic_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
  age INTEGER,
  sex TEXT,
  education_level TEXT,
  profession TEXT,
  socioeconomic_class TEXT,
  ai_experience BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AUT Responses table
CREATE TABLE public.aut_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
  stimulus_id UUID NOT NULL REFERENCES public.aut_stimuli(id),
  object_name TEXT NOT NULL,
  object_image_url TEXT,
  version_tag TEXT,
  response_text TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  submitted_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- FIQ Responses table
CREATE TABLE public.fiq_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
  stimulus_id UUID NOT NULL REFERENCES public.fiq_stimuli(id),
  presentation_order INTEGER,
  version_tag TEXT,
  response_text TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  submitted_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Dilemma Responses table
CREATE TABLE public.dilemma_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
  dilemma_id UUID NOT NULL REFERENCES public.ethical_dilemmas(id),
  version_tag TEXT,
  likert_value INTEGER,
  justification TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  submitted_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Screen timestamps table
CREATE TABLE public.screen_timestamps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
  screen_name TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE,
  submitted_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Admin users table (for authentication)
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.tcle_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aut_stimuli ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fiq_stimuli ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ethical_dilemmas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sociodemographic_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aut_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fiq_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dilemma_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.screen_timestamps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Public read policies for experiment content (TCLE, stimuli)
CREATE POLICY "Anyone can read active TCLE" ON public.tcle_config FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can read active AUT stimuli" ON public.aut_stimuli FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can read active FIQ stimuli" ON public.fiq_stimuli FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can read active dilemmas" ON public.ethical_dilemmas FOR SELECT USING (is_active = true);

-- Public insert policies for participant data (anonymous experiment)
CREATE POLICY "Anyone can create participants" ON public.participants FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update own participant" ON public.participants FOR UPDATE USING (true);
CREATE POLICY "Anyone can insert sociodemographic data" ON public.sociodemographic_data FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert AUT responses" ON public.aut_responses FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert FIQ responses" ON public.fiq_responses FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert dilemma responses" ON public.dilemma_responses FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert screen timestamps" ON public.screen_timestamps FOR INSERT WITH CHECK (true);

-- Storage bucket for experiment files
INSERT INTO storage.buckets (id, name, public) VALUES ('experiment-files', 'experiment-files', true);

-- Storage policies for public read, admin write
CREATE POLICY "Public can read experiment files" ON storage.objects FOR SELECT USING (bucket_id = 'experiment-files');
CREATE POLICY "Anyone can upload experiment files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'experiment-files');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_tcle_config_updated_at BEFORE UPDATE ON public.tcle_config FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_aut_stimuli_updated_at BEFORE UPDATE ON public.aut_stimuli FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_fiq_stimuli_updated_at BEFORE UPDATE ON public.fiq_stimuli FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ethical_dilemmas_updated_at BEFORE UPDATE ON public.ethical_dilemmas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();