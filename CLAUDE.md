# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Special Caring is a care management platform for families with special-needs children. It provides a centralized hub to organize essential care information, medical records, emergency contacts, and daily care activities.

**Tech Stack:** React 18 + TypeScript, Vite, Tailwind CSS, shadcn/ui (Radix UI), Supabase (PostgreSQL + Auth), TanStack Query, React Hook Form + Zod, i18next (i18n)

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (port 8080)
npm run build        # Production build
npm run build:dev    # Development build
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

## Architecture

### Application Structure

```
src/
├── App.tsx                    # Root: QueryClient, Router, AuthProvider, ChildProvider
├── pages/                     # Route pages (Dashboard, Login, Register, AdminPanel, Profile)
├── components/
│   ├── layout/                # DashboardLayout (sidebar + header + content area)
│   ├── sections/              # Feature components (KeyInformation, Medications, etc.)
│   ├── auth/                  # Auth components (ProtectedRoute, AuthForm)
│   └── ui/                    # shadcn/ui primitives
├── contexts/
│   ├── AuthContext.tsx        # Supabase auth state, OAuth providers, review mode
│   └── ChildContext.tsx       # Multi-child management, active child selection
├── hooks/                     # Custom hooks (useUserRole, useMedications, etc.)
├── integrations/supabase/     # Supabase client + auto-generated types
└── i18n/                      # i18next config + locale files (en, fr-CA, es)
```

### Key Architectural Patterns

**Multi-Child Support:** Users can manage multiple children. `ChildContext` tracks the active child, and all data queries filter by `child_id`. The `child_access` table controls permissions (owner/caregiver/viewer).

**Role-Based Access:** Three roles via `user_roles` table: `admin`, `caregiver`, `viewer`. The `useUserRole` hook provides `canEdit`, `isAdmin`, etc. Sidebar items filter by role.

**Section Components Pattern:** Each dashboard section (KeyInformation, Medications, etc.) follows the same pattern:
- Uses `useQuery` with `queryKey: ['tableName', activeChild?.id]`
- Uses `useMutation` for create/update operations
- Form state via React Hook Form + Zod validation
- Data transforms between camelCase (form) and snake_case (database)

**Authentication Flow:**
- `AuthContext` wraps the app with Supabase auth state
- `AuthNavigationHandler` redirects based on auth state
- `ProtectedRoute` guards authenticated routes
- OAuth providers: Google, Twitter, Facebook
- Review mode: bypasses auth for demos (stored in localStorage)

### Database Schema (Key Tables)

All child-related tables have a `child_id` foreign key to `children`:
- `children` - Child profiles (linked to owner via `user_id`)
- `child_access` - Permissions per child (role: owner/caregiver/viewer)
- `key_information` - Core child profile data
- `medications`, `medical_contacts`, `emergency_cards`, `suppliers`
- `daily_log_entries`, `emergency_protocols`, `employment_agreements`
- `financial_legal_docs`, `end_of_life_wishes`, `home_safety_checks`

Types are auto-generated in `src/integrations/supabase/types.ts`.

### Supabase Edge Functions

Located in `supabase/functions/`:
- `delete-user` - Admin user deletion (requires service role)
- `send-medications`, `export-medications` - Email/export medications
- `send-emergency-cards`, `export-emergency-cards` - Email/export cards

## Data Fetching Pattern

Standard pattern for section components:

```typescript
// Fetch data
const { data, isLoading } = useQuery({
  queryKey: ['tableName', activeChild?.id],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('table_name')
      .select('*')
      .eq('child_id', activeChild.id);
    if (error) throw error;
    return data;
  },
  enabled: !!user && !!activeChild,
});

// Mutate data
const mutation = useMutation({
  mutationFn: async (values) => {
    const { error } = await supabase.from('table_name').insert([...]);
    if (error) throw error;
  },
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tableName', activeChild?.id] }),
});
```

## Path Aliases

Use `@/` for imports from `src/`:
```typescript
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
```

## Internationalization

Supported locales: `en-CA` (default), `fr-CA`, `es`. Translation files in `src/i18n/locales/`. Use `useTranslation` hook:

```typescript
const { t } = useTranslation();
<span>{t('key.path')}</span>
```

## Important Notes

- **Child Context Required:** Most data operations require an active child. Always check `activeChild` before queries.
- **Review Mode:** Demo mode bypasses real auth - check `isReviewMode` when testing auth flows.
- **Lovable Integration:** This project uses Lovable's `lovable-tagger` plugin in dev mode.
- **Supabase Types:** Database types are auto-generated. Don't manually edit `types.ts`.
