-- ============================================================
-- MISSING CREATE TABLE STATEMENTS
-- These tables were created outside of migrations (likely via Supabase
-- dashboard) and are referenced in types.ts but lack CREATE TABLE SQL.
-- Using IF NOT EXISTS guards so this is safe to run on environments
-- where tables already exist.
-- ============================================================

-- ============================================================
-- 1. celebration_categories
-- ============================================================
CREATE TABLE IF NOT EXISTS public.celebration_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  name text NOT NULL,
  icon text NOT NULL DEFAULT 'star',
  color text NOT NULL DEFAULT 'blue',
  sort_order integer,
  is_default boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(child_id, name)
);

CREATE INDEX IF NOT EXISTS celebration_categories_child_id_idx ON public.celebration_categories(child_id);

-- ============================================================
-- 2. journeys
-- ============================================================
CREATE TABLE IF NOT EXISTS public.journeys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  category_id uuid REFERENCES public.celebration_categories(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  stage text,
  is_starred boolean DEFAULT false,
  started_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS journeys_child_id_idx ON public.journeys(child_id);
CREATE INDEX IF NOT EXISTS journeys_category_id_idx ON public.journeys(category_id);

CREATE OR REPLACE FUNCTION public.update_journeys_updated_at()
  RETURNS trigger
  LANGUAGE plpgsql
  SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'journeys_updated_at'
    AND event_object_table = 'journeys'
  ) THEN
    CREATE TRIGGER journeys_updated_at
      BEFORE UPDATE ON public.journeys
      FOR EACH ROW EXECUTE FUNCTION public.update_journeys_updated_at();
  END IF;
END;
$$;

-- ============================================================
-- 3. journey_moments
-- ============================================================
CREATE TABLE IF NOT EXISTS public.journey_moments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_id uuid NOT NULL REFERENCES public.journeys(id) ON DELETE CASCADE,
  child_id uuid NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  title text NOT NULL,
  moment_date timestamptz NOT NULL DEFAULT now(),
  notes text,
  photo_url text,
  how_we_celebrated text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS journey_moments_journey_id_idx ON public.journey_moments(journey_id);
CREATE INDEX IF NOT EXISTS journey_moments_child_id_idx ON public.journey_moments(child_id);

-- Trigger to bump journey updated_at when a moment is added/updated
CREATE OR REPLACE FUNCTION public.update_journey_on_moment()
  RETURNS trigger
  LANGUAGE plpgsql
  SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.journeys SET updated_at = now() WHERE id = NEW.journey_id;
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'journey_moments_bump_journey'
    AND event_object_table = 'journey_moments'
  ) THEN
    CREATE TRIGGER journey_moments_bump_journey
      AFTER INSERT OR UPDATE ON public.journey_moments
      FOR EACH ROW EXECUTE FUNCTION public.update_journey_on_moment();
  END IF;
END;
$$;

-- ============================================================
-- 4. encryption_keys
-- No direct user access - only SECURITY DEFINER functions touch this.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.encryption_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  rotated_at timestamptz
);

-- ============================================================
-- 5. security_audit_log
-- Append-only log table written by SECURITY DEFINER trigger function.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  record_id uuid,
  child_id uuid,
  user_id uuid,
  action text NOT NULL,
  accessed_at timestamptz DEFAULT now(),
  ip_address inet,
  user_agent text,
  details jsonb
);

CREATE INDEX IF NOT EXISTS security_audit_log_child_id_idx ON public.security_audit_log(child_id);
CREATE INDEX IF NOT EXISTS security_audit_log_user_id_idx ON public.security_audit_log(user_id);
CREATE INDEX IF NOT EXISTS security_audit_log_accessed_at_idx ON public.security_audit_log(accessed_at DESC);

ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;
-- No direct-user policies: only accessible via get_audit_logs() SECURITY DEFINER function
