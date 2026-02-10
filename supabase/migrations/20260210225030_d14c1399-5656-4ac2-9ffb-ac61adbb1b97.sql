
-- 1. Create the children table
CREATE TABLE public.children (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own children" ON public.children FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own children" ON public.children FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own children" ON public.children FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own children" ON public.children FOR DELETE USING (auth.uid() = user_id);

-- Limit to 10 children per user via trigger
CREATE OR REPLACE FUNCTION public.check_children_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF (SELECT COUNT(*) FROM public.children WHERE user_id = NEW.user_id) >= 10 THEN
    RAISE EXCEPTION 'Maximum of 10 children per account';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_children_limit
BEFORE INSERT ON public.children
FOR EACH ROW EXECUTE FUNCTION public.check_children_limit();

CREATE TRIGGER update_children_updated_at
BEFORE UPDATE ON public.children
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Add child_id to all data tables (nullable initially for migration)
ALTER TABLE public.key_information ADD COLUMN child_id UUID REFERENCES public.children(id) ON DELETE CASCADE;
ALTER TABLE public.medications ADD COLUMN child_id UUID REFERENCES public.children(id) ON DELETE CASCADE;
ALTER TABLE public.emergency_cards ADD COLUMN child_id UUID REFERENCES public.children(id) ON DELETE CASCADE;
ALTER TABLE public.daily_log_entries ADD COLUMN child_id UUID REFERENCES public.children(id) ON DELETE CASCADE;
ALTER TABLE public.emergency_protocols ADD COLUMN child_id UUID REFERENCES public.children(id) ON DELETE CASCADE;
ALTER TABLE public.home_safety_checks ADD COLUMN child_id UUID REFERENCES public.children(id) ON DELETE CASCADE;
ALTER TABLE public.medical_contacts ADD COLUMN child_id UUID REFERENCES public.children(id) ON DELETE CASCADE;
ALTER TABLE public.suppliers ADD COLUMN child_id UUID REFERENCES public.children(id) ON DELETE CASCADE;
ALTER TABLE public.saved_community_services ADD COLUMN child_id UUID REFERENCES public.children(id) ON DELETE CASCADE;

-- 3. Auto-create a default child for each existing user and link their data
DO $$
DECLARE
  r RECORD;
  new_child_id UUID;
  child_name TEXT;
BEGIN
  FOR r IN SELECT DISTINCT user_id FROM public.key_information
  LOOP
    -- Try to get the child's name from key_information
    SELECT full_name INTO child_name FROM public.key_information WHERE user_id = r.user_id LIMIT 1;
    child_name := COALESCE(NULLIF(child_name, ''), 'My Child');
    
    INSERT INTO public.children (user_id, name) VALUES (r.user_id, child_name) RETURNING id INTO new_child_id;
    
    UPDATE public.key_information SET child_id = new_child_id WHERE user_id = r.user_id AND child_id IS NULL;
    UPDATE public.medications SET child_id = new_child_id WHERE user_id = r.user_id AND child_id IS NULL;
    UPDATE public.emergency_cards SET child_id = new_child_id WHERE user_id = r.user_id AND child_id IS NULL;
    UPDATE public.daily_log_entries SET child_id = new_child_id WHERE user_id = r.user_id AND child_id IS NULL;
    UPDATE public.emergency_protocols SET child_id = new_child_id WHERE user_id = r.user_id AND child_id IS NULL;
    UPDATE public.home_safety_checks SET child_id = new_child_id WHERE user_id = r.user_id AND child_id IS NULL;
    UPDATE public.medical_contacts SET child_id = new_child_id WHERE user_id = r.user_id AND child_id IS NULL;
    UPDATE public.suppliers SET child_id = new_child_id WHERE user_id = r.user_id AND child_id IS NULL;
    UPDATE public.saved_community_services SET child_id = new_child_id WHERE user_id = r.user_id AND child_id IS NULL;
  END LOOP;
  
  -- Also handle users who have data in other tables but not in key_information
  FOR r IN 
    SELECT DISTINCT user_id FROM public.medications WHERE child_id IS NULL
    UNION SELECT DISTINCT user_id FROM public.emergency_cards WHERE child_id IS NULL
    UNION SELECT DISTINCT user_id FROM public.daily_log_entries WHERE child_id IS NULL
    UNION SELECT DISTINCT user_id FROM public.emergency_protocols WHERE child_id IS NULL
    UNION SELECT DISTINCT user_id FROM public.home_safety_checks WHERE child_id IS NULL
    UNION SELECT DISTINCT user_id FROM public.medical_contacts WHERE child_id IS NULL
    UNION SELECT DISTINCT user_id FROM public.suppliers WHERE child_id IS NULL
    UNION SELECT DISTINCT user_id FROM public.saved_community_services WHERE child_id IS NULL
  LOOP
    -- Check if this user already has a child
    SELECT id INTO new_child_id FROM public.children WHERE user_id = r.user_id LIMIT 1;
    IF new_child_id IS NULL THEN
      INSERT INTO public.children (user_id, name) VALUES (r.user_id, 'My Child') RETURNING id INTO new_child_id;
    END IF;
    
    UPDATE public.medications SET child_id = new_child_id WHERE user_id = r.user_id AND child_id IS NULL;
    UPDATE public.emergency_cards SET child_id = new_child_id WHERE user_id = r.user_id AND child_id IS NULL;
    UPDATE public.daily_log_entries SET child_id = new_child_id WHERE user_id = r.user_id AND child_id IS NULL;
    UPDATE public.emergency_protocols SET child_id = new_child_id WHERE user_id = r.user_id AND child_id IS NULL;
    UPDATE public.home_safety_checks SET child_id = new_child_id WHERE user_id = r.user_id AND child_id IS NULL;
    UPDATE public.medical_contacts SET child_id = new_child_id WHERE user_id = r.user_id AND child_id IS NULL;
    UPDATE public.suppliers SET child_id = new_child_id WHERE user_id = r.user_id AND child_id IS NULL;
    UPDATE public.saved_community_services SET child_id = new_child_id WHERE user_id = r.user_id AND child_id IS NULL;
  END LOOP;
END;
$$;

-- 4. Now make child_id NOT NULL on all tables
ALTER TABLE public.key_information ALTER COLUMN child_id SET NOT NULL;
ALTER TABLE public.medications ALTER COLUMN child_id SET NOT NULL;
ALTER TABLE public.emergency_cards ALTER COLUMN child_id SET NOT NULL;
ALTER TABLE public.daily_log_entries ALTER COLUMN child_id SET NOT NULL;
ALTER TABLE public.emergency_protocols ALTER COLUMN child_id SET NOT NULL;
ALTER TABLE public.home_safety_checks ALTER COLUMN child_id SET NOT NULL;
ALTER TABLE public.medical_contacts ALTER COLUMN child_id SET NOT NULL;
ALTER TABLE public.suppliers ALTER COLUMN child_id SET NOT NULL;
ALTER TABLE public.saved_community_services ALTER COLUMN child_id SET NOT NULL;
