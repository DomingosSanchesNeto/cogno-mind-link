-- Add length constraints to prevent DoS via large text submissions

-- AUT responses: limit response_text to 5000 characters
ALTER TABLE public.aut_responses 
  ADD CONSTRAINT aut_responses_response_text_length 
  CHECK (char_length(response_text) <= 5000);

-- FIQ responses: limit response_text to 5000 characters
ALTER TABLE public.fiq_responses 
  ADD CONSTRAINT fiq_responses_response_text_length 
  CHECK (char_length(response_text) <= 5000);

-- Dilemma responses: limit justification to 5000 characters
ALTER TABLE public.dilemma_responses 
  ADD CONSTRAINT dilemma_responses_justification_length 
  CHECK (char_length(justification) <= 5000);

-- Sociodemographic data: limit profession to 100 characters
ALTER TABLE public.sociodemographic_data 
  ADD CONSTRAINT sociodemographic_profession_length 
  CHECK (char_length(profession) <= 100);