

# Privacy by Design: COPPA/GDPR Compliance Plan

## Current State

The application already has several privacy foundations in place:
- **Encryption at rest** for sensitive fields (health card, insurance, ID numbers) via `encrypt_sensitive()`/`decrypt_sensitive()` SECURITY DEFINER functions and secure views
- **Row-Level Security** on all tables ensuring data isolation
- **Child deletion** cascade (owner can delete a child and all associated data)
- **Export system** (ExportDialog component + `lib/exporters.ts`) supporting PDF/CSV/JSON -- but it is **not wired into any page** and is **missing several data sections**
- **Admin-only user deletion** via edge function -- but **no self-service account deletion**

## Gaps to Address

### 1. Data Minimization -- Audit & Cleanup
- Remove `created_by` from export outputs (internal audit field, not user data)
- Strip internal IDs (`id`, `child_id`, `created_by`) from exported data so only meaningful care information is included
- Ensure the `children` table read path uses `children_secure` view consistently for decrypted data in exports

### 2. Encryption at Rest -- Expand Coverage
Currently only 3 fields are encrypted: `health_card_number`, `insurance_number`, `id_number` (emergency cards), and `account_number` (financial docs).

Additional fields that contain sensitive child PII and should be encrypted:
- `children.phone_number`
- `children.address`
- `children.email`
- `children.emergency_contact`
- `children.emergency_phone`
- `children.medical_conditions`
- `children.allergies`

This requires:
- Adding `_encrypted` columns to `children` table
- Creating a new encryption trigger for the children table
- Updating the `children_secure` view to decrypt these fields

### 3. Data Portability -- Complete Export
The ExportDialog already exists but needs:
- **Wire it into the Dashboard** (add an Export button to the dashboard header or sidebar)
- **Add missing sections**: Emergency Cards, Employment Agreements, Financial/Legal, End-of-Life Wishes, Home Safety, Celebrations/Journeys, Documents metadata
- **Use secure views** (`children_secure`) in the export fetcher so encrypted data is properly decrypted for the caregiver's download
- **Sanitize output**: Remove internal database IDs and audit columns from exported data

### 4. Right to Erasure -- Self-Service Account Deletion
- Add a "Delete My Account" button to the Profile page
- Create a new edge function `delete-own-account` that:
  - Verifies the caller's identity
  - Deletes all children owned by the user (cascading all child data)
  - Removes the user's `child_access`, `profiles`, `user_roles`, `push_subscriptions`, `notification_preferences` records
  - Deletes the auth user via admin API
- Add confirmation dialog with clear warning about irreversibility

### 5. Privacy Policy & Consent
- Create a `/privacy` page (the footer already links to it but the route does not exist)
- Add a consent acknowledgment checkbox during registration
- Store consent timestamp in the `profiles` table

---

## Technical Implementation Details

### Database Migration

```sql
-- 1. Add encrypted columns to children table
ALTER TABLE public.children
  ADD COLUMN IF NOT EXISTS phone_number_encrypted text,
  ADD COLUMN IF NOT EXISTS address_encrypted text,
  ADD COLUMN IF NOT EXISTS email_encrypted text,
  ADD COLUMN IF NOT EXISTS emergency_contact_encrypted text,
  ADD COLUMN IF NOT EXISTS emergency_phone_encrypted text,
  ADD COLUMN IF NOT EXISTS medical_conditions_encrypted text,
  ADD COLUMN IF NOT EXISTS allergies_encrypted text;

-- 2. Create encryption trigger for children
CREATE OR REPLACE FUNCTION public.encrypt_children_sensitive()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$ BEGIN
  -- Encrypt each sensitive field if present and not already masked
  IF NEW.phone_number IS NOT NULL AND NEW.phone_number != '' AND NEW.phone_number != '***' THEN
    NEW.phone_number_encrypted := encrypt_sensitive(NEW.phone_number);
    NEW.phone_number := '***';
  END IF;
  -- (repeat pattern for address, email, emergency_contact, emergency_phone,
  --  medical_conditions, allergies)
  RETURN NEW;
END; $$;

CREATE TRIGGER encrypt_children_before_upsert
  BEFORE INSERT OR UPDATE ON public.children
  FOR EACH ROW EXECUTE FUNCTION encrypt_children_sensitive();

-- 3. Update children_secure view to decrypt new fields
CREATE OR REPLACE VIEW public.children_secure AS
SELECT id, created_by, name, avatar_url,
  decrypt_sensitive(COALESCE(full_name_encrypted, full_name)) as full_name,
  -- ... decrypt all encrypted fields
  created_at, updated_at
FROM public.children;

-- 4. Add consent fields to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS privacy_consent_at timestamptz,
  ADD COLUMN IF NOT EXISTS privacy_consent_version text;
```

### New Edge Function: `delete-own-account`
- Accepts no body (uses caller's JWT)
- Uses service role to cascade-delete all owned children, then delete the auth user
- No admin check -- any authenticated user can delete their own account

### Frontend Changes

| File | Change |
|------|--------|
| `src/pages/Profile.tsx` | Add "Delete My Account" section with confirmation dialog |
| `src/pages/Privacy.tsx` | New page with privacy policy content |
| `src/pages/Register.tsx` | Add consent checkbox |
| `src/App.tsx` | Add `/privacy` route |
| `src/lib/exporters.ts` | Add missing sections (emergency cards, employment, financial, end-of-life, home safety, celebrations, documents); use `children_secure` view; strip internal IDs |
| `src/components/export/ExportDialog.tsx` | Add the new sections to the SECTIONS list |
| `src/pages/Dashboard.tsx` | Wire in ExportDialog with a visible button |
| `src/components/layout/Dashboard.tsx` | Add Export action to sidebar/header |

### Execution Order
1. Database migration (new encrypted columns, trigger, updated view, consent fields)
2. Edge function: `delete-own-account`
3. Update `lib/exporters.ts` with complete data portability
4. Update ExportDialog sections list
5. Wire ExportDialog into Dashboard
6. Add Delete Account to Profile page
7. Create Privacy Policy page and add route
8. Add consent checkbox to Registration

