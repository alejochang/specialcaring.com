-- Fix log_data_modification: use to_jsonb() for ? and ->> operators on NEW/OLD records
CREATE OR REPLACE FUNCTION public.log_data_modification()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
AS $function$
  DECLARE
    v_child_id uuid;
    v_record_id uuid;
    v_details jsonb;
    v_new_jsonb jsonb;
    v_old_jsonb jsonb;
  BEGIN
    -- Convert to jsonb for field access
    IF TG_OP = 'DELETE' THEN
      v_old_jsonb := to_jsonb(OLD);
      v_record_id := (v_old_jsonb->>'id')::uuid;
      v_child_id := CASE WHEN v_old_jsonb ? 'child_id' THEN (v_old_jsonb->>'child_id')::uuid ELSE NULL END;
    ELSE
      v_new_jsonb := to_jsonb(NEW);
      v_record_id := (v_new_jsonb->>'id')::uuid;
      v_child_id := CASE WHEN v_new_jsonb ? 'child_id' THEN (v_new_jsonb->>'child_id')::uuid ELSE NULL END;
    END IF;

    -- Build details based on operation
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
