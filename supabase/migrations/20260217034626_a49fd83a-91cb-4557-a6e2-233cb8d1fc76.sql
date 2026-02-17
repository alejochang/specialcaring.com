
-- Fix mutable search_path on all functions that are missing it

-- update_journeys_updated_at
CREATE OR REPLACE FUNCTION public.update_journeys_updated_at()
  RETURNS trigger
  LANGUAGE plpgsql
  SET search_path TO 'public'
AS $function$
  BEGIN
    NEW.updated_at = now();
    RETURN NEW;
  END;
$function$;

-- update_journey_on_moment
CREATE OR REPLACE FUNCTION public.update_journey_on_moment()
  RETURNS trigger
  LANGUAGE plpgsql
  SET search_path TO 'public'
AS $function$
  BEGIN
    UPDATE public.journeys SET updated_at = now() WHERE id = NEW.journey_id;
    RETURN NEW;
  END;
$function$;

-- seed_celebration_categories (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.seed_celebration_categories(p_child_id uuid)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $function$
  BEGIN
    INSERT INTO public.celebration_categories (child_id, name, icon, color, sort_order, is_default)
    VALUES
      (p_child_id, 'Firsts & Big Moments', 'star', 'yellow', 1, true),
      (p_child_id, 'Communication', 'message-circle', 'blue', 2, true),
      (p_child_id, 'On My Own', 'hand', 'green', 3, true),
      (p_child_id, 'Moving & Doing', 'footprints', 'orange', 4, true),
      (p_child_id, 'Connecting', 'heart', 'pink', 5, true),
      (p_child_id, 'Everyday Wins', 'home', 'purple', 6, true)
    ON CONFLICT (child_id, name) DO NOTHING;
  END;
$function$;

-- get_audit_logs (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.get_audit_logs(p_table_name text DEFAULT NULL::text, p_child_id uuid DEFAULT NULL::uuid, p_days_back integer DEFAULT 30, p_limit integer DEFAULT 100)
  RETURNS TABLE(id uuid, table_name text, record_id uuid, child_id uuid, user_id uuid, action text, accessed_at timestamp with time zone, details jsonb)
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $function$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid() AND role = 'admin'
    ) THEN
      RAISE EXCEPTION 'Access denied: Admin role required';
    END IF;

    RETURN QUERY
    SELECT
      sal.id, sal.table_name, sal.record_id, sal.child_id, sal.user_id,
      sal.action, sal.accessed_at, sal.details
    FROM security_audit_log sal
    WHERE
      (p_table_name IS NULL OR sal.table_name = p_table_name)
      AND (p_child_id IS NULL OR sal.child_id = p_child_id)
      AND sal.accessed_at >= now() - (p_days_back || ' days')::interval
    ORDER BY sal.accessed_at DESC
    LIMIT p_limit;
  END;
$function$;

-- get_audit_summary (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.get_audit_summary(p_days_back integer DEFAULT 7)
  RETURNS TABLE(table_name text, total_actions bigint, inserts bigint, updates bigint, deletes bigint, unique_users bigint)
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $function$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid() AND role = 'admin'
    ) THEN
      RAISE EXCEPTION 'Access denied: Admin role required';
    END IF;

    RETURN QUERY
    SELECT
      sal.table_name,
      count(*) as total_actions,
      count(*) FILTER (WHERE sal.action = 'INSERT') as inserts,
      count(*) FILTER (WHERE sal.action = 'UPDATE') as updates,
      count(*) FILTER (WHERE sal.action = 'DELETE') as deletes,
      count(DISTINCT sal.user_id) as unique_users
    FROM security_audit_log sal
    WHERE sal.accessed_at >= now() - (p_days_back || ' days')::interval
    GROUP BY sal.table_name
    ORDER BY total_actions DESC;
  END;
$function$;

-- verify_audit_triggers (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.verify_audit_triggers()
  RETURNS TABLE(table_name text, has_audit_trigger boolean)
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $function$
  BEGIN
    RETURN QUERY
    SELECT
      t.table_name::text,
      EXISTS (
        SELECT 1 FROM information_schema.triggers tr
        WHERE tr.event_object_table = t.table_name
        AND tr.trigger_name LIKE 'audit_%'
      ) as has_audit_trigger
    FROM (
      VALUES
        ('children'), ('child_access'), ('child_invites'), ('profiles'),
        ('key_information'), ('medications'), ('medical_contacts'),
        ('emergency_cards'), ('emergency_protocols'), ('daily_log_entries'),
        ('suppliers'), ('employment_agreements'), ('financial_legal_docs'),
        ('end_of_life_wishes'), ('home_safety_checks'), ('documents'),
        ('journeys'), ('journey_moments'), ('celebration_categories')
    ) AS t(table_name);
  END;
$function$;

-- log_data_modification (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.log_data_modification()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $function$
  DECLARE
    v_child_id uuid;
    v_record_id uuid;
    v_details jsonb;
    v_new_jsonb jsonb;
    v_old_jsonb jsonb;
  BEGIN
    IF TG_OP = 'DELETE' THEN
      v_old_jsonb := to_jsonb(OLD);
      v_record_id := (v_old_jsonb->>'id')::uuid;
      v_child_id := CASE WHEN v_old_jsonb ? 'child_id' THEN (v_old_jsonb->>'child_id')::uuid ELSE NULL END;
    ELSE
      v_new_jsonb := to_jsonb(NEW);
      v_record_id := (v_new_jsonb->>'id')::uuid;
      v_child_id := CASE WHEN v_new_jsonb ? 'child_id' THEN (v_new_jsonb->>'child_id')::uuid ELSE NULL END;
    END IF;

    IF TG_OP = 'UPDATE' THEN
      v_old_jsonb := to_jsonb(OLD);
      v_details := jsonb_build_object(
        'changed_fields', (
          SELECT jsonb_object_agg(key, value)
          FROM jsonb_each(v_new_jsonb)
          WHERE v_new_jsonb -> key IS DISTINCT FROM v_old_jsonb -> key
        )
      );
    ELSIF TG_OP = 'DELETE' THEN
      v_details := jsonb_build_object('deleted_record', v_old_jsonb);
    ELSE
      v_details := '{}'::jsonb;
    END IF;

    INSERT INTO security_audit_log (table_name, record_id, child_id, user_id, action, details)
    VALUES (TG_TABLE_NAME, v_record_id, v_child_id, auth.uid(), TG_OP, v_details);

    IF TG_OP = 'DELETE' THEN
      RETURN OLD;
    ELSE
      RETURN NEW;
    END IF;
  END;
$function$;

-- has_child_access single-arg (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.has_child_access(p_child_id uuid)
  RETURNS boolean
  LANGUAGE plpgsql
  STABLE SECURITY DEFINER
  SET search_path TO 'public'
AS $function$
  BEGIN
    RETURN EXISTS (
      SELECT 1 FROM child_access
      WHERE child_access.child_id = p_child_id
      AND child_access.user_id = auth.uid()
    );
  END;
$function$;
