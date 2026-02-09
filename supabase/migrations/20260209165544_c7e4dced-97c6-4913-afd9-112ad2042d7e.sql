
-- 1. Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Key Information table
CREATE TABLE public.key_information (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  birth_date TEXT NOT NULL DEFAULT '',
  health_card_number TEXT DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  phone_number TEXT NOT NULL DEFAULT '',
  email TEXT DEFAULT '',
  insurance_provider TEXT DEFAULT '',
  insurance_number TEXT DEFAULT '',
  emergency_contact TEXT NOT NULL DEFAULT '',
  emergency_phone TEXT NOT NULL DEFAULT '',
  medical_conditions TEXT DEFAULT '',
  allergies TEXT DEFAULT '',
  likes TEXT DEFAULT '',
  dislikes TEXT DEFAULT '',
  do_nots TEXT DEFAULT '',
  additional_notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.key_information ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own key info" ON public.key_information FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own key info" ON public.key_information FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own key info" ON public.key_information FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own key info" ON public.key_information FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_key_information_updated_at BEFORE UPDATE ON public.key_information FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Medications table
CREATE TABLE public.medications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL DEFAULT '',
  frequency TEXT NOT NULL DEFAULT '',
  instructions TEXT DEFAULT '',
  prescriber TEXT DEFAULT '',
  purpose TEXT DEFAULT '',
  start_date TEXT DEFAULT '',
  end_date TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own medications" ON public.medications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own medications" ON public.medications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own medications" ON public.medications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own medications" ON public.medications FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_medications_updated_at BEFORE UPDATE ON public.medications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Medical Contacts table
CREATE TABLE public.medical_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  specialty TEXT DEFAULT '',
  type TEXT NOT NULL DEFAULT '',
  phone_number TEXT NOT NULL DEFAULT '',
  email TEXT DEFAULT '',
  address TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.medical_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own medical contacts" ON public.medical_contacts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own medical contacts" ON public.medical_contacts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own medical contacts" ON public.medical_contacts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own medical contacts" ON public.medical_contacts FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_medical_contacts_updated_at BEFORE UPDATE ON public.medical_contacts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Suppliers table
CREATE TABLE public.suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL DEFAULT 'Other',
  item_name TEXT NOT NULL,
  dosage_or_size TEXT NOT NULL DEFAULT '',
  brand_or_strength TEXT DEFAULT '',
  provider_name TEXT NOT NULL DEFAULT '',
  contact_phone TEXT NOT NULL DEFAULT '',
  address TEXT DEFAULT '',
  website TEXT DEFAULT '',
  ordering_instructions TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  inventory_threshold INTEGER DEFAULT NULL,
  last_order_date TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own suppliers" ON public.suppliers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own suppliers" ON public.suppliers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own suppliers" ON public.suppliers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own suppliers" ON public.suppliers FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
