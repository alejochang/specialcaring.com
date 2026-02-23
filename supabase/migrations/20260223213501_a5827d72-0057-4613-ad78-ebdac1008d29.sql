
-- 1. Add encrypted columns to children table
ALTER TABLE public.children
  ADD COLUMN IF NOT EXISTS phone_number_encrypted text,
  ADD COLUMN IF NOT EXISTS address_encrypted text,
  ADD COLUMN IF NOT EXISTS email_encrypted text,
  ADD COLUMN IF NOT EXISTS emergency_contact_encrypted text,
  ADD COLUMN IF NOT EXISTS emergency_phone_encrypted text,
  ADD COLUMN IF NOT EXISTS medical_conditions_encrypted text,
  ADD COLUMN IF NOT EXISTS allergies_encrypted text,
  ADD COLUMN IF NOT EXISTS health_card_number_encrypted text,
  ADD COLUMN IF NOT EXISTS insurance_number_encrypted text;

-- 2. Create encryption trigger for children
CREATE OR REPLACE FUNCTION public.encrypt_children_sensitive()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.phone_number IS NOT NULL AND NEW.phone_number != '' AND NEW.phone_number != '***' THEN
    NEW.phone_number_encrypted := encrypt_sensitive(NEW.phone_number);
    NEW.phone_number := '***';
  END IF;
  IF NEW.address IS NOT NULL AND NEW.address != '' AND NEW.address != '***' THEN
    NEW.address_encrypted := encrypt_sensitive(NEW.address);
    NEW.address := '***';
  END IF;
  IF NEW.email IS NOT NULL AND NEW.email != '' AND NEW.email != '***' THEN
    NEW.email_encrypted := encrypt_sensitive(NEW.email);
    NEW.email := '***';
  END IF;
  IF NEW.emergency_contact IS NOT NULL AND NEW.emergency_contact != '' AND NEW.emergency_contact != '***' THEN
    NEW.emergency_contact_encrypted := encrypt_sensitive(NEW.emergency_contact);
    NEW.emergency_contact := '***';
  END IF;
  IF NEW.emergency_phone IS NOT NULL AND NEW.emergency_phone != '' AND NEW.emergency_phone != '***' THEN
    NEW.emergency_phone_encrypted := encrypt_sensitive(NEW.emergency_phone);
    NEW.emergency_phone := '***';
  END IF;
  IF NEW.medical_conditions IS NOT NULL AND NEW.medical_conditions != '' AND NEW.medical_conditions != '***' THEN
    NEW.medical_conditions_encrypted := encrypt_sensitive(NEW.medical_conditions);
    NEW.medical_conditions := '***';
  END IF;
  IF NEW.allergies IS NOT NULL AND NEW.allergies != '' AND NEW.allergies != '***' THEN
    NEW.allergies_encrypted := encrypt_sensitive(NEW.allergies);
    NEW.allergies := '***';
  END IF;
  IF NEW.health_card_number IS NOT NULL AND NEW.health_card_number != '' AND NEW.health_card_number != '***' THEN
    NEW.health_card_number_encrypted := encrypt_sensitive(NEW.health_card_number);
    NEW.health_card_number := '***';
  END IF;
  IF NEW.insurance_number IS NOT NULL AND NEW.insurance_number != '' AND NEW.insurance_number != '***' THEN
    NEW.insurance_number_encrypted := encrypt_sensitive(NEW.insurance_number);
    NEW.insurance_number := '***';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER encrypt_children_before_upsert
  BEFORE INSERT OR UPDATE ON public.children
  FOR EACH ROW EXECUTE FUNCTION encrypt_children_sensitive();

-- 3. Drop and recreate children_secure view with proper column order
DROP VIEW IF EXISTS public.children_secure;

CREATE VIEW public.children_secure AS
SELECT
  id,
  created_by,
  name,
  avatar_url,
  full_name,
  birth_date,
  decrypt_sensitive(COALESCE(address_encrypted, NULLIF(address, '***'))) as address,
  decrypt_sensitive(COALESCE(phone_number_encrypted, NULLIF(phone_number, '***'))) as phone_number,
  decrypt_sensitive(COALESCE(email_encrypted, NULLIF(email, '***'))) as email,
  decrypt_sensitive(COALESCE(health_card_number_encrypted, NULLIF(health_card_number, '***'))) as health_card_number,
  insurance_provider,
  decrypt_sensitive(COALESCE(insurance_number_encrypted, NULLIF(insurance_number, '***'))) as insurance_number,
  decrypt_sensitive(COALESCE(emergency_contact_encrypted, NULLIF(emergency_contact, '***'))) as emergency_contact,
  decrypt_sensitive(COALESCE(emergency_phone_encrypted, NULLIF(emergency_phone, '***'))) as emergency_phone,
  decrypt_sensitive(COALESCE(medical_conditions_encrypted, NULLIF(medical_conditions, '***'))) as medical_conditions,
  decrypt_sensitive(COALESCE(allergies_encrypted, NULLIF(allergies, '***'))) as allergies,
  likes,
  dislikes,
  do_nots,
  additional_notes,
  created_at,
  updated_at
FROM public.children;

-- 4. Add consent fields to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS privacy_consent_at timestamptz,
  ADD COLUMN IF NOT EXISTS privacy_consent_version text;
