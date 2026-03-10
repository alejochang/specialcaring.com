# Special Caring - Technical Deep Dive Report

> **Comprehensive Domain Expert Reference**
> Generated: 2026-02-23 | Platform Version: Active Development
> Built with: Lovable (Vite + React template)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Business Context & Value Proposition](#2-business-context--value-proposition)
3. [Technology Stack](#3-technology-stack)
4. [Application Architecture](#4-application-architecture)
5. [Database Schema & Data Model](#5-database-schema--data-model)
6. [Authentication & Security](#6-authentication--security)
7. [Routing & Navigation](#7-routing--navigation)
8. [Feature Inventory](#8-feature-inventory)
9. [Component Architecture](#9-component-architecture)
10. [State Management](#10-state-management)
11. [Backend Integration (Supabase)](#11-backend-integration-supabase)
12. [Internationalization (i18n)](#12-internationalization-i18n)
13. [Offline & PWA Capabilities](#13-offline--pwa-capabilities)
14. [Data Export & Sharing](#14-data-export--sharing)
15. [Design System & Styling](#15-design-system--styling)
16. [Testing Infrastructure](#16-testing-infrastructure)
17. [Build, Configuration & Deployment](#17-build-configuration--deployment)
18. [User Flows & Diagrams](#18-user-flows--diagrams)
19. [Third-Party Integrations](#19-third-party-integrations)
20. [Performance & Optimization](#20-performance--optimization)
21. [Codebase Statistics](#21-codebase-statistics)
22. [Enhancement Opportunities](#22-enhancement-opportunities)

---

## 1. Executive Summary

**Special Caring** is a comprehensive care management platform specifically designed for families with special-needs children. It provides a centralized digital hub to organize, store, and share essential care information including medical records, emergency protocols, medications, caregiver contacts, daily care activities, and legal/financial documents.

### Key Differentiators

- **Multi-child, multi-caregiver** architecture with role-based access
- **Offline-first PWA** for reliability in any network condition
- **Real-time collaboration** across care team members
- **Emergency preparedness** with instant access to critical protocols
- **Trilingual support** (English-CA, French-CA, Spanish)
- **Data export/email** for medical appointments and provider communication

### Platform at a Glance

| Attribute | Detail |
|-----------|--------|
| **Framework** | React 18.3 + TypeScript 5.5 |
| **Build Tool** | Vite 5.4 (SWC compiler) |
| **Backend** | Supabase (PostgreSQL + Auth + Edge Functions) |
| **UI System** | shadcn/ui + Radix UI + Tailwind CSS |
| **State** | React Query + React Context |
| **Languages** | English (CA), French (CA), Spanish |
| **PWA** | Service Worker + IndexedDB offline storage |
| **Auth** | Email/password + Google/Twitter/Facebook OAuth |

---

## 2. Business Context & Value Proposition

### Target Users

1. **Primary caregivers** (parents/guardians of special-needs children)
2. **Professional caregivers** (nurses, aides, respite workers)
3. **Extended family members** with viewer or caregiver roles
4. **Healthcare providers** receiving exported care summaries

### Core Problems Solved

```
Problem                              Solution
-----------------------------------------------------------------------------------------------------
Scattered medical records            Centralized child profile with all health data
Caregiver handoff gaps               Real-time shared access with role-based permissions
Emergency unpreparedness             Instant-access emergency protocols and contacts
Communication with providers         PDF/email export of medications and ID cards
Multi-child coordination             Separate profiles with individual access controls
Language barriers                    Trilingual interface (EN/FR/ES)
Offline access in care settings      PWA with IndexedDB offline storage
```

### Value Propositions

1. **Centralized Information Hub** - Everything in one place, accessible from any device
2. **Multi-Caregiver Collaboration** - Invite-based team access with real-time sync
3. **Emergency Preparedness** - Quick access to critical medical protocols
4. **Care Coordination** - Share medications with doctors, export for appointments
5. **Multi-Child Support** - Manage multiple children with separate profiles
6. **Mobility & Accessibility** - Mobile-responsive, offline-capable PWA

---

## 3. Technology Stack

### Frontend Core

| Layer | Technology | Version |
|-------|-----------|---------|
| Runtime | React + TypeScript | 18.3.1 / 5.5.3 |
| Build | Vite (SWC) | 5.4.1 |
| Routing | React Router DOM | 6.26.2 |
| UI Components | shadcn/ui (Radix UI) | Latest |
| Styling | Tailwind CSS | 3.4.11 |
| Icons | Lucide React | 462+ icons |
| State (Server) | @tanstack/react-query | 5.56.2 |
| Forms | react-hook-form + Zod | 7.53 / 3.23 |
| i18n | i18next + react-i18next | 24.2 / 15.4 |
| Charts | Recharts | - |

### Backend & Infrastructure

| Layer | Technology | Purpose |
|-------|-----------|---------|
| BaaS | Supabase | Database, Auth, Edge Functions, Storage |
| Database | PostgreSQL 14.1 | Primary data store |
| Auth | Supabase Auth (JWT) | Email + OAuth providers |
| Serverless | Edge Functions (Deno) | Email, exports, admin ops |
| Email | Resend API | Transactional emails |
| PWA | Workbox + vite-plugin-pwa | Offline caching |
| Offline DB | IndexedDB (idb) | Client-side persistence |

### Data & Export

| Library | Purpose |
|---------|---------|
| jspdf | PDF document generation |
| papaparse | CSV parsing and generation |
| ical-generator | iCalendar event export |
| date-fns | Date formatting and manipulation |

### Development & Testing

| Tool | Purpose |
|------|---------|
| Vitest 4.0.18 | Unit testing framework |
| React Testing Library | Component testing |
| ESLint 9.9.0 | Code linting |
| Lovable Tagger | Development plugin |

---

## 4. Application Architecture

### High-Level Architecture

```
+---------------------------------------------------+
|                  CLIENT (React SPA)                |
|                                                    |
|  +-----------+  +-----------+  +---------------+  |
|  | AuthCtx   |  | ChildCtx  |  | QueryClient   |  |
|  | (session) |  | (active   |  | (server state)|  |
|  |           |  |  child)   |  |               |  |
|  +-----------+  +-----------+  +---------------+  |
|        |              |               |            |
|  +-----v--------------v---------------v--------+  |
|  |            React Router DOM                  |  |
|  |  /login  /register  /dashboard/:section      |  |
|  +----------------------------------------------+  |
|        |                                           |
|  +-----v----------------------------------------+  |
|  |         Section Components (14)               |  |
|  |  KeyInfo | Meds | Contacts | Protocols | ...  |  |
|  +----------------------------------------------+  |
|        |                                           |
|  +-----v-----------+  +------------------------+  |
|  | react-hook-form  |  | IndexedDB (offline)    |  |
|  | + Zod validation |  | + Sync Queue           |  |
|  +------------------+  +------------------------+  |
+---------------------------------------------------+
           |                        |
           v                        v
+-------------------+    +---------------------+
|   Supabase        |    |  Supabase Edge Fns  |
|   - PostgreSQL    |    |  - send-medications  |
|   - Auth (JWT)    |    |  - export-meds       |
|   - Realtime      |    |  - send-emg-cards    |
|   - Storage       |    |  - export-emg-cards  |
|   - RLS Policies  |    |  - delete-user       |
+-------------------+    +---------------------+
                              |
                              v
                      +---------------+
                      | Resend API    |
                      | (Email)       |
                      +---------------+
```

### Directory Structure

```
src/
+-- App.tsx                          # Root: router + providers
+-- main.tsx                         # Entry point
+-- pages/                           # Route-level components
|   +-- Index.tsx                    # Landing page (public)
|   +-- Login.tsx                    # Authentication
|   +-- Register.tsx                 # New user signup
|   +-- Dashboard.tsx                # Main app shell
|   +-- Profile.tsx                  # User settings
|   +-- AdminPanel.tsx               # Admin-only panel
|   +-- AddChild.tsx                 # Add child flow
|   +-- NotFound.tsx                 # 404
|
+-- components/
|   +-- ui/                          # shadcn/ui primitives (30+)
|   +-- layout/                      # Dashboard, Navbar, Footer, Sidebar
|   +-- sections/                    # 14 feature section components
|   +-- auth/                        # AuthForm, ProtectedRoute, RedeemInvite
|   +-- dashboard/                   # Summary widgets
|   +-- search/                      # SearchBar
|   +-- CareTeamManager.tsx          # Multi-user access
|   +-- LanguageSwitcher.tsx         # i18n selector
|
+-- contexts/
|   +-- AuthContext.tsx               # Auth state & methods
|   +-- ChildContext.tsx              # Child management state
|
+-- hooks/                           # 10+ custom hooks
|   +-- useUserRole.tsx              # RBAC permissions
|   +-- useOfflineSync.tsx           # Offline data sync
|   +-- useRealtimeSync.ts           # Supabase realtime
|   +-- usePushNotifications.ts      # Web push
|   +-- useSessionValidator.tsx      # Session health
|   +-- useExportAndEmail.tsx        # Export utilities
|   +-- ...
|
+-- lib/                             # Utilities
|   +-- utils.ts                     # General helpers (cn)
|   +-- exporters.ts                 # PDF/CSV/JSON export
|   +-- offlineStorage.ts            # IndexedDB operations
|   +-- syncManager.ts               # Offline sync coordination
|   +-- search.ts                    # Full-text search engine
|   +-- calendar.ts                  # Calendar utilities
|
+-- integrations/supabase/           # Supabase client + types
+-- i18n/                            # i18next config + locale files
+-- types/                           # Global TypeScript types
+-- test/                            # Test setup + mocks
```

### Architectural Patterns

**Pattern 1: Context + Hooks for Global State**

```
AuthContext ──> provides user, session, auth methods
ChildContext ──> provides children[], activeChild, CRUD methods
useUserRole ──> derives permissions from context data
```

**Pattern 2: Section Component Data Lifecycle**

```
1. useQuery(key, () => supabase.from(table).select().eq('child_id', id))
2. useForm({ resolver: zodResolver(schema) })
3. useMutation(() => supabase.from(table).insert/update/delete)
4. onSuccess: queryClient.invalidateQueries(key)
5. Data transform: camelCase (form) <--> snake_case (DB)
```

**Pattern 3: Multi-Child Data Isolation**

Every data table includes a `child_id` foreign key. All queries filter by `activeChild.id`, ensuring complete data isolation between children even within the same user account.

---

## 5. Database Schema & Data Model

### Entity Relationship Overview

```
                    +---------------+
                    |  auth.users   |
                    +-------+-------+
                            |
                   +--------+--------+
                   |                 |
            +------v------+  +------v------+
            |  profiles   |  | user_roles  |
            +-------------+  +------+------+
                                    |
                            +-------v--------+
                            |    children    |
                            +-------+--------+
                                    |
                     +--------------+--------------+
                     |                             |
              +------v------+              +------v--------+
              | child_access |              | child_invites |
              | (M:M users)  |              | (pending)     |
              +------+------+              +---------------+
                     |
        +------------+------------+------------+-- ... --+
        |            |            |            |          |
  +-----v---+ +-----v----+ +----v-----+ +----v---+ +---v-----+
  | key_info | | meds     | | contacts | | emg    | | daily   |
  |          | |          | |          | | proto  | | logs    |
  +----------+ +----------+ +----------+ +--------+ +---------+
  | suppliers| | emg_cards| | home_    | | employ | | fin_    |
  |          | |          | | safety   | | ment   | | legal   |
  +----------+ +----------+ +----------+ +--------+ +---------+
  | end_of   | | celebra  | | celebra  | | docs   | | push    |
  | life     | | tions    | | tion_cat | | storage| | subs    |
  +----------+ +----------+ +----------+ +--------+ +---------+
```

### Core Tables

#### Identity & Access

| Table | Key Columns | Purpose |
|-------|------------|---------|
| `auth.users` | id, email, provider | Supabase managed auth |
| `profiles` | id (FK users), full_name, avatar_url | User profile data |
| `user_roles` | user_id, role, is_approved | Global roles (admin/caregiver/viewer) |
| `children` | id, user_id (owner), name, avatar_url | Child profiles |
| `child_access` | child_id, user_id, role | Per-child access grants |
| `child_invites` | child_id, invite_code, invited_email, role, status, expires_at | Pending invitations |

#### Medical & Health

| Table | Key Columns | Purpose |
|-------|------------|---------|
| `key_information` | child_id, full_name, birth_date, health_card_number, medical_conditions, allergies, likes, dislikes, do_nots | Core child profile |
| `key_information_secure` | (VIEW) auto-decrypts sensitive fields | Secure data access |
| `medications` | child_id, name, dosage, frequency, prescriber, purpose, start/end_date | Medication tracking |
| `medical_contacts` | child_id, name, specialty, type, phone, email, is_primary | Healthcare providers |
| `emergency_cards` | child_id, front_image, back_image, id_type, expiry_date | ID card images |
| `emergency_protocols` | child_id, title, severity, immediate_steps, when_to_call_911 | Emergency response |

#### Daily Life & Care

| Table | Key Columns | Purpose |
|-------|------------|---------|
| `daily_log_entries` | child_id, date, time, category, mood, title, description, priority | Activity log |
| `suppliers` | child_id, category, item_name, provider_name, inventory_threshold | Medical supplies |
| `home_safety_checks` | user_id, check_id, completed_at | Safety checklists |
| `saved_community_services` | user_id, service_id | Saved local services |

#### Legal & Administrative

| Table | Key Columns | Purpose |
|-------|------------|---------|
| `employment_agreements` | child_id, caregiver_name, employment_type, hourly_rate, responsibilities | Caregiver contracts |
| `financial_legal_docs` | child_id, doc_type, doc_title, description | Financial/legal records |
| `end_of_life_wishes` | child_id, wish_type, description | End-of-life preferences |

#### Celebrations & Documents

| Table | Key Columns | Purpose |
|-------|------------|---------|
| `celebrations` | child_id, title, date, category_id, photo_url, mood | Milestones |
| `celebration_categories` | child_id, name, color, icon, is_default | Custom categories |
| `documents_storage` | child_id, file_name, file_type, storage_path, uploaded_by | File storage |

#### System

| Table | Key Columns | Purpose |
|-------|------------|---------|
| `push_subscriptions` | user_id, subscription_json | PWA push tokens |

### Database Functions & Triggers

| Function | Purpose |
|----------|---------|
| `handle_new_user()` | Auto-creates profile row on user signup |
| `update_updated_at_column()` | Auto-updates timestamp on row modification |
| `redeem_invite()` | RPC function for invite code redemption |

---

## 6. Authentication & Security

### Authentication Flow

```
+------------------+     +------------------+     +------------------+
|  Landing Page    | --> |  Login/Register  | --> |  Dashboard       |
|  (/)             |     |  (/login)        |     |  (/dashboard)    |
+------------------+     +--------+---------+     +------------------+
                                  |
                    +-------------+-------------+
                    |             |             |
              +-----v---+  +----v----+  +-----v------+
              | Email/   |  | Google  |  | Twitter/   |
              | Password |  | OAuth   |  | Facebook   |
              +-----+----+  +----+----+  +-----+------+
                    |             |             |
                    +------+------+------+------+
                           |
                    +------v------+
                    |  Supabase   |
                    |  Auth (JWT) |
                    +------+------+
                           |
                    +------v------+
                    |  Session    |
                    |  Stored     |
                    +------+------+
                           |
              +------------+------------+
              |                         |
       +------v------+          +------v------+
       | AuthContext  |          | Session     |
       | (React)     |          | Validator   |
       | user, session|         | (5 min poll)|
       +--------------+         +-------------+
```

### Authentication Methods

1. **Email/Password** - Standard Supabase auth with email verification
2. **Google OAuth** - Social login via Google
3. **Twitter OAuth** - Social login via Twitter
4. **Facebook OAuth** - Social login via Facebook
5. **Review Mode** - Development-only demo mode (disabled in production)

### Session Management

- JWT tokens with automatic refresh
- Session validation polling every 5 minutes (`useSessionValidator`)
- Automatic redirect to login on session expiry
- localStorage persistence for session state

### Role-Based Access Control (RBAC)

**Global Roles** (via `user_roles` table):

| Role | Capabilities |
|------|-------------|
| `admin` | Full system access, admin panel, user management |
| `caregiver` | Standard app access, edit data |
| `viewer` | Read-only access |

**Child-Level Roles** (via `child_access` table):

| Role | View | Edit | Delete | Invite Others |
|------|------|------|--------|---------------|
| `owner` | Yes | Yes | Yes | Yes |
| `caregiver` | Yes | Yes | Yes | No |
| `viewer` | Yes | No | No | No |

### Security Measures

- **Row-Level Security (RLS)**: All database tables have RLS policies enabled
- **Child-scoped data isolation**: Queries always filter by `child_id`
- **Access verification**: `child_access` table checked on every data operation
- **Sensitive field encryption**: `key_information_secure` view for decrypted access
- **Rate limiting**: Edge functions limit to 5 emails per 5 minutes
- **Input validation**: Email, UUID, and string sanitization in Edge Functions
- **CORS headers**: API endpoints protected
- **VAPID key verification**: Push notification security

---

## 7. Routing & Navigation

### Route Map

```
PUBLIC ROUTES
=============
/                              Landing page (marketing)
/login                         Email/password + OAuth login
/register                      New user registration

PROTECTED ROUTES (requires authentication)
==========================================
/dashboard                     Dashboard overview with summary widgets
/dashboard/:section            Feature sections:
  +-- key-information          Child profile & vital info
  +-- emergency-cards          ID card photo uploads
  +-- medical-emergency-protocols  Emergency response guides
  +-- medications              Medication management
  +-- suppliers                Medical supply vendors
  +-- medical-contacts         Healthcare provider directory
  +-- home-safety              Home safety checklist
  +-- community-services       Local service directory
  +-- daily-log                Daily activity/mood log
  +-- employment               Caregiver employment agreements
  +-- financial-legal          Financial & legal documents
  +-- end-of-life              End-of-life planning
  +-- documents                File storage
  +-- celebrations             Milestones & celebrations

/dashboard/admin               Admin panel (admin-only)
/profile                       User profile settings
/add-child                     Add new child flow

CATCH-ALL
=========
*                              404 Not Found
```

### Navigation Structure

```
+----------------------------------------------------------+
|  Navbar                         [Search] [Lang] [Profile] |
+------+---------------------------------------------------+
|      |                                                    |
| Side | +------------------------------------------------+ |
| bar  | |                                                | |
|      | |           Active Section Content               | |
| [Child| |                                                | |
|  Sel] | |                                                | |
|      | |                                                | |
| Key  | |                                                | |
| Info | |                                                | |
| Emrg | |                                                | |
| Cards| |                                                | |
| Proto| |                                                | |
| Meds | |                                                | |
| Suplr| |                                                | |
| Cntct| |                                                | |
| Home | |                                                | |
| Commu| |                                                | |
| Daily| |                                                | |
| Emplo| |                                                | |
| Fin/L| |                                                | |
| EoL  | |                                                | |
| Docs | |                                                | |
| Celeb| |                                                | |
+------+-+------------------------------------------------+-+
```

### Protected Route Pattern

The `<ProtectedRoute>` component wraps authenticated pages:
- Checks `AuthContext` for valid session
- Redirects unauthenticated users to `/login`
- Redirects authenticated users away from `/login` to `/dashboard`
- Renders a loading spinner during auth state resolution

---

## 8. Feature Inventory

### Feature 1: Child Profile Management (Key Information)

**File:** `src/components/sections/KeyInformation.tsx` (~813 lines)

**Capabilities:**
- Complete child information: name, birth date, address, phone, email
- Health insurance: card number, provider, policy number
- Medical conditions and allergies (free text)
- Emergency contacts with phone numbers
- Personal preferences: likes, dislikes, do-nots
- Additional notes field
- Real-time updates via React Query

### Feature 2: Medication Management

**File:** `src/components/sections/MedicationsList.tsx` (~347 lines)

**Capabilities:**
- Add/edit/delete medications
- Fields: name, dosage, frequency, purpose, prescriber, instructions
- Start and end date tracking
- PDF export of full medication list
- Email medication summary to healthcare providers
- Form validation via Zod schema

### Feature 3: Emergency Cards (ID Cards)

**File:** `src/components/sections/EmergencyCards.tsx` (~452 lines)

**Capabilities:**
- Upload front/back photos of identification cards
- Supported types: insurance cards, disability IDs, etc.
- Track issue and expiry dates
- ID number storage
- PDF export for offline/print access
- Email cards to emergency contacts

### Feature 4: Emergency Protocols

**File:** `src/components/sections/MedicalEmergencyProtocols.tsx` (~289 lines)

**Capabilities:**
- Define emergency response procedures
- Severity levels: mild, moderate, severe
- Immediate action steps (ordered list)
- Emergency contact escalation chain
- "When to call 911" guidelines
- Additional notes and resources

### Feature 5: Medical Contacts

**File:** `src/components/sections/MedicalContacts.tsx` (~280 lines)

**Capabilities:**
- Store healthcare provider directory
- Contact types: doctor, therapist, nurse, specialist, etc.
- Phone, email, address, specialty fields
- Mark primary provider
- Search and filter contacts
- Quick-call/email actions

### Feature 6: Suppliers Management

**File:** `src/components/sections/SuppliersList.tsx` (~628 lines)

**Capabilities:**
- Medical supply and equipment vendor tracking
- Item details: name, dosage/size, brand/strength
- Provider contact information and website
- Ordering instructions
- Inventory threshold alerts
- Last order date tracking
- Category-based organization

### Feature 7: Home Safety Checklist

**File:** `src/components/sections/HomeSafety.tsx` (~395 lines)

**Capabilities:**
- Pre-defined safety check items
- Mark items as completed with timestamps
- Progress tracking across check categories
- Personalized to child's specific needs

### Feature 8: Community Services Directory

**File:** `src/components/sections/CommunityServices.tsx` (~392 lines)

**Capabilities:**
- Browse local community services and resources
- Filter by service category
- Save/bookmark favorite services
- Contact information and descriptions
- Location-aware resource discovery

### Feature 9: Daily Activity Log

**File:** `src/components/sections/DailyLog.tsx` (~502 lines)

**Capabilities:**
- Record daily activities and observations
- Mood tracking (emoji/scale)
- Categories: meals, medications, activities, sleep, behavior, etc.
- Timestamp with date and time
- Priority levels: low, medium, high
- Tags for organization
- Search and filter entries
- Timeline view
- Export to CSV/PDF

### Feature 10: Employment Agreements

**File:** `src/components/sections/EmploymentAgreement.tsx` (~571 lines)

**Capabilities:**
- Document caregiver employment terms
- Employment type and compensation (hourly rate)
- Responsibilities and duties
- Work schedule
- Start/end dates
- Agreement templates

### Feature 11: Financial & Legal Documents

**File:** `src/components/sections/FinancialLegal.tsx` (~301 lines)

**Capabilities:**
- Store financial planning documents
- Trust and estate documents
- Insurance policies
- Guardianship papers
- Document type categorization
- Description and notes

### Feature 12: End-of-Life Planning

**File:** `src/components/sections/EndOfLifeWishes.tsx` (~281 lines)

**Capabilities:**
- Document care preferences for future
- Healthcare directives
- Contact information for end-of-life decisions
- Organ donation preferences
- Wish type categorization

### Feature 13: Celebrations & Milestones

**File:** `src/components/sections/Celebrations.tsx` (~1181 lines - largest section)

**Capabilities:**
- Track birthdays, anniversaries, achievements
- Photo uploads for memories
- Custom categories with colors and icons
- Date-based organization
- Mood tagging
- Participant tracking
- Calendar integration (iCalendar export)
- Search and filter

### Feature 14: Document Storage

**File:** `src/components/sections/DocumentsSection.tsx`

**Capabilities:**
- General file upload and storage
- File metadata: name, size, type
- Upload tracking (who uploaded)
- Organized by child
- Supabase Storage integration

### Feature 15: Care Team Management

**File:** `src/components/CareTeamManager.tsx`

**Capabilities:**
- Invite caregivers via email or invite code
- Assign roles: caregiver or viewer
- View current team members and their roles
- Remove team member access
- Track pending invitations
- Invite expiration management

### Feature 16: Global Search

**File:** `src/lib/search.ts` (~255 lines) + `src/components/search/SearchBar.tsx`

**Capabilities:**
- Full-text search across all data types
- Score-based result ranking
- Parallel queries across all tables
- Type-specific filtering (medication, contact, protocol, etc.)
- Suggested searches
- Keyboard shortcut support

### Feature 17: Data Export & Email

**Files:** `src/lib/exporters.ts` + `src/hooks/useExportAndEmail.tsx`

**Capabilities:**
- Export formats: PDF, CSV, JSON
- Exportable sections: medications, contacts, protocols, daily logs, suppliers, all
- Email delivery via Supabase Edge Functions + Resend API
- Batch exports with date range selection
- Calendar export (iCalendar format)

---

## 9. Component Architecture

### Component Hierarchy

```
App
+-- QueryClientProvider
    +-- AuthProvider
        +-- ChildProvider
            +-- BrowserRouter
                +-- Routes
                    +-- / --> Index (landing)
                    +-- /login --> Login
                    |   +-- AuthForm
                    +-- /register --> Register
                    |   +-- AuthForm
                    +-- /dashboard --> ProtectedRoute
                    |   +-- Dashboard
                    |       +-- DashboardLayout
                    |           +-- Navbar
                    |           |   +-- SearchBar
                    |           |   +-- LanguageSwitcher
                    |           |   +-- UserMenu
                    |           +-- Sidebar
                    |           |   +-- SidebarChildSwitcher
                    |           |   +-- SectionNavLinks
                    |           +-- MainContent
                    |               +-- DashboardSummaryWidgets (overview)
                    |               +-- KeyInformation
                    |               +-- MedicationsList
                    |               +-- EmergencyCards
                    |               +-- MedicalContacts
                    |               +-- MedicalEmergencyProtocols
                    |               +-- SuppliersList
                    |               +-- HomeSafety
                    |               +-- CommunityServices
                    |               +-- DailyLog
                    |               +-- EmploymentAgreement
                    |               +-- FinancialLegal
                    |               +-- EndOfLifeWishes
                    |               +-- DocumentsSection
                    |               +-- Celebrations
                    +-- /profile --> ProtectedRoute
                    |   +-- Profile
                    +-- /add-child --> ProtectedRoute
                    |   +-- AddChild
                    +-- /dashboard/admin --> ProtectedRoute
                    |   +-- AdminPanel
                    +-- * --> NotFound
```

### UI Component Library (shadcn/ui)

30+ primitives available in `src/components/ui/`:

```
Layout:        Card, Separator, AspectRatio, ScrollArea
Forms:         Button, Input, Textarea, Select, Checkbox, RadioGroup, Switch, Slider, Form
Feedback:      Alert, Badge, Toast (Sonner), Progress, Skeleton
Overlay:       Dialog, Sheet, Popover, Tooltip, HoverCard, ContextMenu, DropdownMenu
Navigation:    Tabs, Accordion, Collapsible, Breadcrumb, Pagination, Sidebar
Data Display:  Table, Avatar, Calendar
Typography:    Label
```

---

## 10. State Management

### State Architecture

```
+---------------------------------------------------+
|              State Management Layers               |
+---------------------------------------------------+
|                                                    |
|  +--------------------------------------------+   |
|  |  React Context (Global UI State)            |   |
|  |  - AuthContext: user, session, auth methods  |   |
|  |  - ChildContext: children[], activeChild     |   |
|  +--------------------------------------------+   |
|                                                    |
|  +--------------------------------------------+   |
|  |  React Query (Server State)                 |   |
|  |  - Medications, Contacts, Protocols, etc.   |   |
|  |  - Auto-caching, refetching, invalidation   |   |
|  |  - Query keys: ['resource', childId]        |   |
|  +--------------------------------------------+   |
|                                                    |
|  +--------------------------------------------+   |
|  |  react-hook-form (Form State)               |   |
|  |  - Per-section form state                   |   |
|  |  - Zod validation schemas                   |   |
|  |  - Dirty tracking, submission handling       |   |
|  +--------------------------------------------+   |
|                                                    |
|  +--------------------------------------------+   |
|  |  Persistent Storage                         |   |
|  |  - localStorage: language, reviewMode       |   |
|  |  - IndexedDB: offline data cache            |   |
|  |  - Supabase: source of truth                |   |
|  +--------------------------------------------+   |
|                                                    |
+---------------------------------------------------+
```

### AuthContext API

```typescript
interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isReviewMode: boolean;
  signInWithEmail(email, password): Promise<void>;
  signInWithGoogle(): Promise<void>;
  signInWithTwitter(): Promise<void>;
  signInWithFacebook(): Promise<void>;
  signUp(email, password): Promise<void>;
  signOut(): Promise<void>;
  startReviewMode(): void;
  exitReviewMode(): void;
}
```

### ChildContext API

```typescript
interface ChildContextType {
  children: Child[];
  activeChild: Child | null;
  setActiveChildId(id: string): void;
  addChild(data: ChildInput): Promise<void>;
  updateChild(id: string, data: Partial<Child>): Promise<void>;
  deleteChild(id: string): Promise<void>;
  isOwner: boolean;
}
```

### Custom Hooks

| Hook | Purpose |
|------|---------|
| `useUserRole` | Checks global and child-level permissions |
| `useOfflineSync` | Manages IndexedDB sync queue |
| `useRealtimeSync` | Supabase real-time subscriptions |
| `usePushNotifications` | Web Push API management |
| `useSessionValidator` | Session health check polling |
| `useExportAndEmail` | Export/email utility methods |
| `useOnlineCaregivers` | Tracks online team members |
| `useReviewMode` | Demo mode state management |
| `useMockAuth` | Testing auth mock |

---

## 11. Backend Integration (Supabase)

### Supabase Client Configuration

**File:** `src/integrations/supabase/client.ts`

```
Environment Variables:
- VITE_SUPABASE_URL → Supabase project URL
- VITE_SUPABASE_ANON_KEY → Public anonymous key
```

### Edge Functions

Located in `/supabase/functions/`:

| Function | Endpoint | Purpose | Rate Limit |
|----------|----------|---------|------------|
| `send-medications` | POST | Email medication list to provider | 5/5min |
| `export-medications` | GET | Generate HTML medications table | - |
| `send-emergency-cards` | POST | Email emergency card PDFs | 5/5min |
| `export-emergency-cards` | GET | Generate emergency card PDF | - |
| `delete-user` | POST | Admin: cascade delete user | Admin only |

### Shared Edge Function Utilities

| Utility | Purpose |
|---------|---------|
| `validation.ts` | Email regex, UUID validation, string sanitization |
| `rateLimiter.ts` | In-memory rate limiting with configurable window |

### Data Access Pattern

```typescript
// Standard CRUD pattern used across all sections:

// READ
const { data } = await supabase
  .from('table_name')
  .select('*')
  .eq('child_id', activeChild.id)
  .order('created_at', { ascending: false });

// CREATE
await supabase.from('table_name').insert({
  child_id: activeChild.id,
  ...formData  // snake_case fields
});

// UPDATE
await supabase.from('table_name')
  .update({ ...changes })
  .eq('id', recordId);

// DELETE
await supabase.from('table_name')
  .delete()
  .eq('id', recordId);
```

### Real-Time Subscriptions

```typescript
// useRealtimeSync pattern:
supabase
  .channel('table-changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'table_name',
    filter: `child_id=eq.${childId}`
  }, (payload) => {
    queryClient.invalidateQueries(['table_name', childId]);
  })
  .subscribe();
```

---

## 12. Internationalization (i18n)

### Configuration

**File:** `src/i18n/i18n.ts`

- Framework: i18next + react-i18next
- Language detection: Browser language auto-detect
- Persistence: localStorage
- Fallback: English (en)

### Supported Languages

| Code | Language | Region |
|------|----------|--------|
| `en` | English | Canadian |
| `fr-CA` | French | Canadian |
| `es` | Spanish | General |

### Translation Files

```
src/i18n/locales/
+-- en/translation.json       # English (Canadian)
+-- fr-CA/translation.json    # French (Canadian)
+-- es/translation.json       # Spanish
```

### Coverage

All user-facing strings are translated:
- Navigation labels and sidebar items
- Form labels, placeholders, and validation messages
- Button text and action labels
- Error messages and toast notifications
- Page titles and section descriptions
- Dashboard summary widget text

### Usage Pattern

```typescript
const { t } = useTranslation();
// In JSX:
<h1>{t('dashboard.title')}</h1>
<Button>{t('common.save')}</Button>
```

---

## 13. Offline & PWA Capabilities

### Progressive Web App Configuration

**File:** `vite.config.ts` (PWA plugin)

```
PWA Features:
- Service Worker auto-registration
- App manifest with icons (8 sizes)
- Workbox caching strategies
- Background sync support
```

### Caching Strategies

| Resource Type | Strategy | Details |
|--------------|----------|---------|
| API responses | NetworkFirst | 24-hour cache fallback |
| Auth endpoints | NetworkOnly | Never cached (security) |
| Static assets | CacheFirst | Long-term cache |
| Fonts | CacheFirst | 1-year expiry |

### Offline Storage Architecture

**File:** `src/lib/offlineStorage.ts` (~333 lines)

```
IndexedDB Schema:
+-- offlineData store
|   +-- key: table_name + child_id
|   +-- value: cached query results
|
+-- syncQueue store
    +-- key: auto-increment
    +-- value: { operation, table, data, timestamp }
```

### Sync Flow

```
ONLINE MODE:
  User Action --> Supabase API --> Success --> Update UI
                                --> Fail --> Queue in IndexedDB

OFFLINE MODE:
  User Action --> IndexedDB Write --> Update UI (optimistic)
                                  --> Add to Sync Queue

RECONNECTION:
  Online Event --> Process Sync Queue --> Supabase API
                                     --> Clear processed items
                                     --> Refresh React Query cache
```

---

## 14. Data Export & Sharing

### Export Engine

**File:** `src/lib/exporters.ts`

### Supported Formats

| Format | Library | Use Case |
|--------|---------|----------|
| PDF | jspdf | Print-ready documents for providers |
| CSV | papaparse | Data transfer, spreadsheet import |
| JSON | Native | Backup and data portability |
| iCalendar | ical-generator | Calendar event import |
| HTML | Template literals | Email body content |

### Exportable Sections

```typescript
type ExportSection =
  | 'all'
  | 'keyInformation'
  | 'medications'
  | 'medicalContacts'
  | 'emergencyProtocols'
  | 'dailyLogs'
  | 'suppliers';
```

### Email Delivery Flow

```
User clicks "Email to Provider"
        |
        v
useExportAndEmail hook
        |
        v
Supabase Edge Function (send-medications / send-emergency-cards)
        |
        v
Rate limit check (5/5min)
        |
    [Pass]              [Fail]
        |                   |
        v                   v
  Resend API          429 Error + retry-after
        |
        v
  Email delivered
        |
        v
  Toast notification
```

---

## 15. Design System & Styling

### CSS Framework

**Tailwind CSS 3.4.11** with custom configuration

### Brand Color Palette

```
SPECIAL (Purple) - Primary brand color
  #f5f3ff ... #7C3AED ... #2e1065
  Used for: Primary actions, branding, headers

CAREGIVER (Blue) - Secondary brand color
  #f0f9ff ... #0280c0 ... #022d4a
  Used for: Caregiver-related UI, links, secondary actions

KIDS (Pink) - Accent color
  #fdf2f8 ... #db2777 ... #500724
  Used for: Child-related UI, celebrations, highlights
```

### Semantic Colors

```
foreground / background    - Base text and background
primary / secondary        - Primary and secondary actions
destructive                - Delete, danger actions
muted                      - Disabled, secondary text
accent                     - Hover states, highlights
border / input / ring      - Form elements, separators
card / popover             - Container backgrounds
```

### Custom Animations

```css
fadeIn        - Fade in from below (entrance)
slideInRight  - Slide in from right (panels)
pulse         - Gentle pulse (loading)
float         - Floating effect (decorative)
shimmer       - Skeleton loading
bounce        - Attention-drawing bounce
wiggle        - Playful wiggle (celebrations)
accordion-*   - Expand/collapse transitions
```

### Responsive Breakpoints

```
sm:   640px   - Small tablets
md:   768px   - Tablets
lg:   1024px  - Laptops
xl:   1280px  - Desktops
2xl:  1536px  - Large screens
```

### Design Principles

- **Mobile-first**: Base styles target mobile, breakpoints scale up
- **Consistent spacing**: Tailwind spacing scale (4px increments)
- **Accessible contrast**: WCAG-compliant color combinations
- **Touch-friendly**: Minimum 44px tap targets
- **Collapsible sidebar**: Maximizes content area on mobile

---

## 16. Testing Infrastructure

### Framework

| Tool | Version | Purpose |
|------|---------|---------|
| Vitest | 4.0.18 | Test runner |
| @testing-library/react | 16.3.2 | Component testing |
| @testing-library/jest-dom | - | DOM assertions |
| jsdom | - | Browser environment |

### Test Organization

```
src/test/
+-- setup.ts                    # Global test configuration
+-- mocks/
    +-- contexts.tsx             # Mock AuthContext & ChildContext
    +-- supabase.ts              # Mock Supabase client

src/components/sections/__tests__/
+-- [section].test.tsx           # Section component tests
```

### Mock Utilities

```typescript
// Mock Supabase client provides:
- from().select().eq().order() chain
- from().insert()
- from().update().eq()
- from().delete().eq()
- auth.getSession()
- auth.onAuthStateChange()

// Mock Contexts provide:
- Authenticated user state
- Active child with test data
- Role-based permission states
```

---

## 17. Build, Configuration & Deployment

### Build Commands

```bash
npm install          # Install dependencies
npm run dev          # Development server (port 8080)
npm run build        # Production build -> /dist/
npm run build:dev    # Development build
npm run preview      # Preview production build
npm run lint         # ESLint code linting
```

### Environment Variables

```env
VITE_SUPABASE_URL=https://[project-id].supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
VITE_SUPABASE_PROJECT_ID=[project-id]
VITE_VAPID_PUBLIC_KEY=[key]          # Optional: PWA push
```

### Build Configuration

**vite.config.ts:**
- Dev server: port 8080, host `::`
- Path alias: `@/` maps to `src/`
- PWA plugin with manifest and Workbox
- Lovable tagger plugin (dev only)
- SWC for fast TypeScript compilation

**tsconfig.json:**
- Strict mode enabled
- ES2020 target
- Path aliases configured
- DOM lib reference

### Deployment

- **Primary**: Lovable built-in deployment
- **Alternative**: Static hosting (Netlify, Vercel, Cloudflare Pages)
- **Output**: Static SPA in `/dist/` directory
- **Requirements**: Supabase project running with configured RLS

---

## 18. User Flows & Diagrams

### Flow 1: New User Registration & Onboarding

```
1. Visit landing page (/)
2. Click "Register" or "Get Started"
3. Enter email + password OR click OAuth provider
4. Email verification (if email signup)
5. Redirect to /dashboard (empty state)
6. Prompt: "Add your first child"
7. Navigate to /add-child
8. Fill child profile form (name, birth date)
9. Submit -> child created -> redirect to /dashboard
10. Sidebar populates with section navigation
11. Begin filling in child information sections
```

### Flow 2: Caregiver Invitation & Access

```
OWNER:
1. Navigate to Care Team section
2. Click "Invite Caregiver"
3. Enter email + select role (caregiver/viewer)
4. System generates invite code
5. Email sent to invitee (or share code manually)

INVITEE:
1. Receive email with invite link/code
2. Register or log in to Special Caring
3. Redeem invite code
4. child_access record created
5. Child appears in invitee's dashboard
6. Access level determined by assigned role
```

### Flow 3: Emergency Information Access

```
1. Caregiver opens app (or uses offline cache)
2. Select child from sidebar dropdown
3. Quick-access options:
   a. Emergency Protocols -> immediate steps by severity
   b. Emergency Cards -> ID cards with photos
   c. Medications -> current medication list
   d. Medical Contacts -> call/email providers directly
4. Export options:
   a. PDF for printing
   b. Email to hospital/provider
```

### Flow 4: Daily Log Entry

```
1. Navigate to Daily Log section
2. Click "Add Entry"
3. Select date/time (defaults to now)
4. Choose category (meals, meds, activity, sleep, etc.)
5. Set mood indicator
6. Enter title and description
7. Add tags and priority level
8. Save entry
9. Entry appears in timeline
10. Search/filter to find past entries
```

### Flow 5: Medication Management & Sharing

```
1. Navigate to Medications section
2. Add medication:
   a. Name, dosage, frequency
   b. Purpose, prescriber, instructions
   c. Start/end dates
3. View medication list
4. Export options:
   a. "Export PDF" -> generates printable document
   b. "Email to Provider" -> enter recipient email
      -> Edge Function generates HTML
      -> Resend API delivers email
      -> Rate limited (5/5min)
5. Edit/delete medications as needed
```

### Flow 6: Multi-Child Management

```
1. User has multiple children in system
2. Sidebar shows child switcher dropdown
3. Select different child
4. ChildContext updates activeChild
5. All section queries re-fetch with new child_id
6. UI updates with selected child's data
7. Each child has independent:
   - Profile information
   - Medications
   - Contacts
   - Protocols
   - Daily logs
   - etc.
```

### Flow 7: Offline Usage

```
GOING OFFLINE:
1. App detects network loss
2. Cached data served from IndexedDB
3. User continues viewing/editing
4. Changes queued in sync queue

COMING ONLINE:
1. App detects network restoration
2. Sync queue processed in order
3. Changes pushed to Supabase
4. React Query cache refreshed
5. UI reflects merged state
6. Conflicts resolved (last-write-wins)
```

---

## 19. Third-Party Integrations

### Supabase (Backend-as-a-Service)

| Feature | Usage |
|---------|-------|
| PostgreSQL | Primary data store with RLS |
| Authentication | Email/password + OAuth (Google, Twitter, Facebook) |
| Real-time | Live data subscriptions across tabs |
| Edge Functions | Serverless endpoints (Deno runtime) |
| Storage | File uploads (ID cards, documents, photos) |

### Resend (Email API)

| Feature | Usage |
|---------|-------|
| Transactional email | Send medication lists to providers |
| HTML email | Formatted emergency card exports |
| Rate limiting | 5 emails per 5 minutes per user |

### OAuth Providers

| Provider | Auth Method |
|----------|------------|
| Google | OAuth 2.0 via Supabase |
| Twitter | OAuth via Supabase |
| Facebook | OAuth via Supabase |

### Workbox (Service Worker)

| Feature | Usage |
|---------|-------|
| Runtime caching | NetworkFirst for API, CacheFirst for assets |
| Background sync | Queue failed requests for retry |
| Precaching | Critical assets cached on install |

---

## 20. Performance & Optimization

### Current Optimizations

| Area | Technique |
|------|-----------|
| Code splitting | Route-based lazy loading via `React.lazy` |
| Build | Vite + SWC for fast compilation and tree-shaking |
| Caching | React Query stale-time management |
| Rendering | Conditional rendering per active section |
| Network | Service Worker caching strategies |
| Database | Indexed columns (child_id, user_id, created_at) |
| Images | Lazy loading attribute (`loading="lazy"`) |
| CSS | Tailwind purge for minimal CSS bundle |

### Performance Monitoring Points

```
Core Web Vitals targets:
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

Key metrics to monitor:
- Time to first meaningful paint
- API response times (Supabase queries)
- Offline-to-online sync latency
- Bundle size (JS + CSS)
- IndexedDB read/write performance
```

---

## 21. Codebase Statistics

### Component Counts

| Category | Count |
|----------|-------|
| UI Primitives (shadcn/ui) | 30+ |
| Feature Sections | 14 |
| Layout Components | 4 |
| Auth Components | 3 |
| Custom Hooks | 10+ |
| Utility Modules | 6 |

### Lines of Code (Estimated)

| Area | LOC |
|------|-----|
| Section Components | ~6,500 |
| Contexts | ~530 |
| Custom Hooks | ~1,500 |
| Utilities | ~1,000 |
| Database Types | ~3,000+ |
| i18n Translations | ~3,000+ |
| **Total (approx)** | **~15,000+** |

### Dependencies

| Type | Count |
|------|-------|
| Direct | 42 |
| Peer | 2 |
| Dev | 18 |

### Database Tables

| Category | Count |
|----------|-------|
| Auth & Access | 6 |
| Medical & Health | 6 |
| Daily Life | 4 |
| Legal & Admin | 3 |
| Celebrations | 2 |
| System | 2 |
| **Total** | **23** |

---

## 22. Enhancement Opportunities

### High Priority

| Area | Enhancement | Impact |
|------|------------|--------|
| Security | Two-factor authentication (2FA) | High - protects sensitive medical data |
| Compliance | HIPAA/PIPEDA audit and compliance | High - regulatory requirement |
| Testing | Expand unit/integration test coverage | High - reliability |
| Monitoring | Error tracking (Sentry) + analytics | High - operational visibility |

### Medium Priority

| Area | Enhancement | Impact |
|------|------------|--------|
| Features | Appointment scheduling & reminders | Med - user convenience |
| Features | Communication templates (email/SMS) | Med - care coordination |
| Features | Bulk data operations | Med - admin efficiency |
| Performance | Virtual scrolling for large lists | Med - UX for power users |
| Performance | Image optimization pipeline | Med - load times |
| Security | Audit logging for all data changes | Med - accountability |

### Lower Priority

| Area | Enhancement | Impact |
|------|------------|--------|
| Features | Analytics dashboard (trends, patterns) | Low-Med - insights |
| Features | Document signing integration | Low - convenience |
| DevOps | CI/CD pipeline automation | Low-Med - developer productivity |
| Testing | E2E tests with Playwright | Low-Med - confidence |
| Accessibility | WCAG AAA compliance audit | Low-Med - inclusivity |

---

## Appendix A: Key File Reference

| File | Purpose | LOC |
|------|---------|-----|
| `src/App.tsx` | Root component, router setup | ~100 |
| `src/contexts/AuthContext.tsx` | Authentication state | ~312 |
| `src/contexts/ChildContext.tsx` | Multi-child management | ~219 |
| `src/components/layout/Dashboard.tsx` | Main layout shell | ~200 |
| `src/components/sections/KeyInformation.tsx` | Child profile | ~813 |
| `src/components/sections/Celebrations.tsx` | Milestones | ~1181 |
| `src/components/sections/SuppliersList.tsx` | Suppliers | ~628 |
| `src/components/sections/EmploymentAgreement.tsx` | Employment | ~571 |
| `src/components/sections/DailyLog.tsx` | Activity log | ~502 |
| `src/components/sections/EmergencyCards.tsx` | ID cards | ~452 |
| `src/lib/offlineStorage.ts` | IndexedDB operations | ~333 |
| `src/lib/search.ts` | Full-text search engine | ~255 |
| `src/lib/exporters.ts` | PDF/CSV/JSON export | ~200 |

## Appendix B: Environment Setup Checklist

```
[ ] Clone repository
[ ] npm install
[ ] Create .env with Supabase credentials:
    VITE_SUPABASE_URL=
    VITE_SUPABASE_ANON_KEY=
    VITE_SUPABASE_PROJECT_ID=
[ ] (Optional) Set VITE_VAPID_PUBLIC_KEY for push notifications
[ ] Verify Supabase project has:
    [ ] All tables created with RLS policies
    [ ] Auth providers configured (email + OAuth)
    [ ] Edge Functions deployed
    [ ] Storage buckets created
[ ] npm run dev (starts on port 8080)
[ ] Test authentication flow
[ ] Create first child profile
[ ] Verify section data CRUD operations
```

---

*This report provides a complete technical foundation for understanding, maintaining, and extending the Special Caring platform. For questions about specific implementation details, refer to the source files listed in Appendix A.*
