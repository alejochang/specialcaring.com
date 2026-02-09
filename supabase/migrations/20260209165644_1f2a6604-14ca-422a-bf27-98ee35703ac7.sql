
-- 1. Daily Log Entries
CREATE TABLE public.daily_log_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  category TEXT NOT NULL,
  mood TEXT NOT NULL DEFAULT 'neutral',
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  priority TEXT NOT NULL DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.daily_log_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own daily logs" ON public.daily_log_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own daily logs" ON public.daily_log_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own daily logs" ON public.daily_log_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own daily logs" ON public.daily_log_entries FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER update_daily_log_entries_updated_at BEFORE UPDATE ON public.daily_log_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Emergency Cards
CREATE TABLE public.emergency_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  front_image TEXT DEFAULT '',
  back_image TEXT DEFAULT '',
  id_type TEXT NOT NULL DEFAULT '',
  id_number TEXT NOT NULL DEFAULT '',
  issue_date TEXT DEFAULT '',
  expiry_date TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.emergency_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own emergency cards" ON public.emergency_cards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own emergency cards" ON public.emergency_cards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own emergency cards" ON public.emergency_cards FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own emergency cards" ON public.emergency_cards FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER update_emergency_cards_updated_at BEFORE UPDATE ON public.emergency_cards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Home Safety Checks (stores which checks a user has completed)
CREATE TABLE public.home_safety_checks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  check_id TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, check_id)
);

ALTER TABLE public.home_safety_checks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own safety checks" ON public.home_safety_checks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own safety checks" ON public.home_safety_checks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own safety checks" ON public.home_safety_checks FOR DELETE USING (auth.uid() = user_id);

-- 4. Saved Community Services
CREATE TABLE public.saved_community_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id TEXT NOT NULL,
  saved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, service_id)
);

ALTER TABLE public.saved_community_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own saved services" ON public.saved_community_services FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own saved services" ON public.saved_community_services FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own saved services" ON public.saved_community_services FOR DELETE USING (auth.uid() = user_id);

-- 5. Emergency Protocols
CREATE TABLE public.emergency_protocols (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'moderate',
  emergency_contacts TEXT NOT NULL DEFAULT '',
  immediate_steps TEXT NOT NULL DEFAULT '',
  when_to_call_911 TEXT DEFAULT '',
  additional_notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.emergency_protocols ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own protocols" ON public.emergency_protocols FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own protocols" ON public.emergency_protocols FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own protocols" ON public.emergency_protocols FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own protocols" ON public.emergency_protocols FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER update_emergency_protocols_updated_at BEFORE UPDATE ON public.emergency_protocols FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
