# Special Caring - Domain Model Reference

> **Domain-Driven Design Analysis**
> Generated: 2026-02-23

---

## Table of Contents

1. [Domain Overview](#1-domain-overview)
2. [Bounded Contexts](#2-bounded-contexts)
3. [Aggregate Roots & Entities](#3-aggregate-roots--entities)
4. [Value Objects & Enumerations](#4-value-objects--enumerations)
5. [Entity Relationship Diagram](#5-entity-relationship-diagram)
6. [Access Control Domain](#6-access-control-domain)
7. [Entity Specifications](#7-entity-specifications)
8. [Business Rules & Invariants](#8-business-rules--invariants)
9. [Computed & Derived Properties](#9-computed--derived-properties)
10. [Domain Events & Side Effects](#10-domain-events--side-effects)
11. [Cross-Cutting Concerns](#11-cross-cutting-concerns)

---

## 1. Domain Overview

Special Caring operates in the **care coordination** domain, specifically managing information for special-needs children across multiple caregivers. The domain model follows a **hub-and-spoke** pattern where the **Child** entity is the central aggregate root from which all other domain entities radiate.

### Core Domain Problem

> Multiple caregivers need consistent, real-time access to a special-needs child's medical records, emergency protocols, daily activities, and care team information — from any device, even offline.

### Strategic Domain Decomposition

```
CORE DOMAIN          SUPPORTING DOMAINS         GENERIC DOMAINS
--------------       ---------------------       -----------------
Child Care Profile   Access Control              Authentication
Medical Management   Data Export/Sharing         File Storage
Emergency Response   Offline Synchronization     Push Notifications
Daily Activity Log   Search & Discovery          Email Delivery
                     Internationalization        PDF Generation
```

---

## 2. Bounded Contexts

### Context Map

```
+------------------------------------------------------------------+
|                                                                    |
|  +---------------------------+   +----------------------------+   |
|  |   IDENTITY & ACCESS       |   |   CHILD CARE PROFILE       |   |
|  |   CONTEXT                 |   |   CONTEXT                  |   |
|  |                           |   |                            |   |
|  |  - User                   |-->|  - Child (Aggregate Root)  |   |
|  |  - Profile                |   |  - KeyInformation          |   |
|  |  - UserRole               |   |  - Likes/Dislikes/DoNots  |   |
|  |  - ChildAccess            |   |  - Avatar                  |   |
|  |  - ChildInvite            |   |                            |   |
|  |  - NotificationPrefs      |   +----------------------------+   |
|  +---------------------------+            |                       |
|             |                             |                       |
|             v                             v                       |
|  +---------------------------+   +----------------------------+   |
|  |   MEDICAL MANAGEMENT      |   |   DAILY LIFE               |   |
|  |   CONTEXT                 |   |   CONTEXT                  |   |
|  |                           |   |                            |   |
|  |  - Medication             |   |  - DailyLogEntry           |   |
|  |  - MedicalContact         |   |  - HomeSafetyCheck         |   |
|  |  - EmergencyProtocol      |   |  - CommunityService        |   |
|  |  - EmergencyCard          |   |  - Supplier                |   |
|  |  - Supplier               |   |                            |   |
|  +---------------------------+   +----------------------------+   |
|             |                             |                       |
|             v                             v                       |
|  +---------------------------+   +----------------------------+   |
|  |   LEGAL & ADMIN           |   |   CELEBRATIONS             |   |
|  |   CONTEXT                 |   |   CONTEXT                  |   |
|  |                           |   |                            |   |
|  |  - EmploymentAgreement    |   |  - CelebrationCategory     |   |
|  |  - FinancialLegalDoc      |   |  - Journey                 |   |
|  |  - EndOfLifeWishes        |   |  - JourneyMoment           |   |
|  +---------------------------+   +----------------------------+   |
|                                                                    |
|  +-------------------------------------------------------------+  |
|  |   CROSS-CUTTING: Export | Search | Offline | Audit          |  |
|  +-------------------------------------------------------------+  |
+------------------------------------------------------------------+
```

### Context Relationships

| Upstream Context | Downstream Context | Relationship |
|-----------------|-------------------|--------------|
| Identity & Access | All other contexts | **Conformist** — all contexts depend on `child_id` and `user_id` |
| Child Care Profile | Medical Management | **Shared Kernel** — `child_id` as partition key |
| Child Care Profile | Daily Life | **Shared Kernel** — `child_id` as partition key |
| Child Care Profile | Legal & Admin | **Shared Kernel** — `child_id` as partition key |
| Child Care Profile | Celebrations | **Shared Kernel** — `child_id` as partition key |
| All Contexts | Export/Search | **Open Host Service** — read-only aggregation |

---

## 3. Aggregate Roots & Entities

### Aggregate Map

```
CHILD (Aggregate Root)
|
+-- KeyInformation          (1:1, required)
+-- Medication[]            (1:N)
+-- MedicalContact[]        (1:N)
+-- EmergencyProtocol[]     (1:N)
+-- EmergencyCard[]         (1:N)
+-- Supplier[]              (1:N)
+-- DailyLogEntry[]         (1:N)
+-- HomeSafetyCheck[]       (1:N)
+-- EmploymentAgreement[]   (1:N)
+-- FinancialLegalDoc[]     (1:N)
+-- EndOfLifeWishes         (1:1)
+-- CelebrationCategory[]   (1:N)
|   +-- Journey[]           (1:N)
|       +-- JourneyMoment[] (1:N)
+-- ChildAccess[]           (1:N)  <-- Access Control
+-- ChildInvite[]           (1:N)  <-- Pending Invitations

USER (Aggregate Root)
|
+-- Profile                 (1:1)
+-- UserRole[]              (1:N)
+-- NotificationPreferences (1:1)
+-- PushSubscription[]      (1:N)
```

### Aggregate Boundaries

The **Child** is the primary aggregate root. All child-scoped data is:
- **Created** with a `child_id` foreign key
- **Queried** by filtering `child_id = activeChild.id`
- **Isolated** — no data leaks between children, even for the same user
- **Access-controlled** — checked against `child_access` for every operation

---

## 4. Value Objects & Enumerations

### Access Roles

```
ChildAccessRole (per-child authorization)
+-- "owner"       Full control: CRUD + invite + delete child
+-- "caregiver"   Read + write: CRUD on all child data
+-- "viewer"      Read only: view all child data

AppRole (application-wide authorization)
+-- "admin"       System administration, user management
+-- "caregiver"   Standard authenticated user
+-- "viewer"      Restricted access
```

### Medical Domain Enums

```
MedicationFrequency
+-- "once_daily"
+-- "twice_daily"
+-- "three_times_daily"
+-- "four_times_daily"
+-- "every_morning"
+-- "every_night"
+-- "as_needed"
+-- "weekly"
+-- "monthly"
+-- "other"

MedicalContactType
+-- "primary_physician"
+-- "specialist"
+-- "pharmacy"
+-- "hospital"
+-- "emergency"
+-- "other"

EmergencyProtocolSeverity
+-- "critical"     Red — life-threatening
+-- "urgent"       Orange — serious, needs immediate attention
+-- "moderate"     Yellow — concerning, monitor closely
```

### Daily Life Enums

```
DailyLogCategory
+-- "medical"
+-- "medication"
+-- "meals"
+-- "sleep"
+-- "behavior"
+-- "therapy"
+-- "social"
+-- "milestone"

DailyLogMood
+-- "happy"    (+1 score)
+-- "neutral"  ( 0 score)
+-- "sad"      (-1 score)

DailyLogPriority
+-- "low"
+-- "medium"
+-- "high"
```

### Administrative Enums

```
SupplierCategory
+-- "Medicine"
+-- "Supplement"
+-- "Supply"
+-- "Other"

EmploymentStatus
+-- "active"
+-- "draft"
+-- "terminated"

FinancialLegalDocType
+-- "insurance"
+-- "trust"
+-- "guardianship"
+-- "power_of_attorney"
+-- "disability_benefits"
+-- "tax"
+-- "bank"
+-- "other"

DocumentStatus
+-- "active"
+-- "pending"
+-- "expired"
+-- "archived"

InviteStatus
+-- "pending"
+-- "accepted"
+-- "expired"
```

### Export & Search Value Objects

```
ExportFormat
+-- "pdf"     Print-ready documents
+-- "csv"     Spreadsheet-compatible
+-- "json"    Machine-readable backup

ExportSection
+-- "all"
+-- "keyInformation"
+-- "medications"
+-- "medicalContacts"
+-- "emergencyProtocols"
+-- "dailyLogs"
+-- "suppliers"

SearchResultType
+-- "medication"
+-- "contact"
+-- "protocol"
+-- "log"
+-- "supplier"
+-- "info"
```

---

## 5. Entity Relationship Diagram

### Full ERD (ASCII)

```
                           +==============+
                           |  auth.users  |
                           |  (Supabase)  |
                           +======+=======+
                                  |
                    +-------------+-------------+
                    |             |             |
             +------v------+ +---v---+  +------v--------+
             |  profiles   | | user_ |  | notification_ |
             |             | | roles |  | preferences   |
             |  full_name  | |       |  |               |
             |  avatar_url | | role  |  | med_reminders |
             +-------------+ | aprvd |  | emrg_alerts   |
                              +---+---+  +---------------+
                                  |
                                  |  owns / has access to
                                  |
                           +======v=======+
                           ||  children  ||     <<< AGGREGATE ROOT
                           ||            ||
                           ||  name      ||
                           ||  avatar    ||
                           +==+====+===+=+
                              |    |   |
              +---------------+    |   +-----------------+
              |                    |                     |
       +------v------+     +------v------+       +------v--------+
       | child_access |     | child_      |       | key_          |
       | (M:M pivot)  |     | invites     |       | information   |
       |              |     |             |       |               |
       | user_id      |     | invite_code |       | full_name     |
       | role:        |     | email       |       | birth_date    |
       |  owner       |     | role        |       | health_card*  |
       |  caregiver   |     | status      |       | insurance*    |
       |  viewer      |     | expires_at  |       | med_conditions|
       +--------------+     +-------------+       | allergies     |
                                                  | emergency_ctc |
              MEDICAL CONTEXT                     | likes/dislikes|
              ===============                     +---------------+
       +------v------+  +------v---------+
       | medications |  | medical_       |     DAILY LIFE CONTEXT
       |             |  | contacts       |     ===================
       | name        |  |                |  +------v--------+ +------v---------+
       | dosage      |  | name           |  | daily_log_    | | suppliers      |
       | frequency   |  | type:          |  | entries       | |                |
       | purpose     |  |  physician     |  |               | | category:      |
       | prescriber  |  |  specialist    |  | category      | |  Medicine      |
       | pharmacy    |  |  pharmacy      |  | mood          | |  Supplement    |
       | refill_date |  |  hospital      |  | title         | |  Supply        |
       | side_effects|  |  emergency     |  | priority      | |  Other         |
       +-------------+  | is_primary     |  | tags[]        | | inv_threshold  |
                         +----------------+  +---------------+ +----------------+
       +------v---------+  +------v--------+
       | emergency_     |  | emergency_    |     LEGAL/ADMIN CONTEXT
       | protocols      |  | cards         |     ===================
       |                |  |               |  +------v---------+ +------v---------+
       | title          |  | id_type       |  | employment_    | | financial_     |
       | severity:      |  | id_number*    |  | agreements     | | legal_docs     |
       |  critical      |  | front_image   |  |                | |                |
       |  urgent        |  | back_image    |  | caregiver_name | | doc_type       |
       |  moderate      |  | issue_date    |  | position       | | title          |
       | immed_steps    |  | expiry_date   |  | hourly_rate    | | institution    |
       | when_call_911  |  +---------------+  | duties         | | account_num*   |
       +----------------+                     | status:        | | status:        |
                                              |  active        | |  active        |
                                              |  draft         | |  pending       |
              CELEBRATIONS CONTEXT            |  terminated    | |  expired       |
              ====================            +----------------+ |  archived      |
       +------v-----------+                                      +----------------+
       | celebration_     |  +------v---------+
       | categories       |  | end_of_life_   |
       |                  |  | wishes         |     * = encrypted field
       | name             |  |                |
       | color            |  | legal_guardian  |
       | icon             |  | med_directives |
       | is_default       |  | organ_donation |
       +--------+---------+  | funeral_prefs  |
                |             +----------------+
         +------v------+
         | journeys    |      SYSTEM TABLES
         |             |      =============
         | title       |  +------v--------+ +------v---------+
         | stage       |  | home_safety_  | | push_          |
         | is_starred  |  | checks        | | subscriptions  |
         +------+------+  +---------------+ +----------------+
                |          +------v---------+
         +------v--------+ | security_     |
         | journey_      | | audit_log     |
         | moments       | +----------------+
         |               |
         | title         |
         | moment_date   |
         | photo_url     |
         +---------------+
```

### Relationship Cardinalities

| Parent | Child | Cardinality | Delete Behavior |
|--------|-------|-------------|----------------|
| `auth.users` | `profiles` | 1:1 | CASCADE |
| `auth.users` | `user_roles` | 1:N | CASCADE |
| `auth.users` | `children` | 1:N (ownership) | CASCADE |
| `children` | `child_access` | 1:N | CASCADE |
| `children` | `child_invites` | 1:N | CASCADE |
| `children` | `key_information` | 1:1 | CASCADE |
| `children` | `medications` | 1:N | CASCADE |
| `children` | `medical_contacts` | 1:N | CASCADE |
| `children` | `emergency_protocols` | 1:N | CASCADE |
| `children` | `emergency_cards` | 1:N | CASCADE |
| `children` | `suppliers` | 1:N | CASCADE |
| `children` | `daily_log_entries` | 1:N | CASCADE |
| `children` | `home_safety_checks` | 1:N | CASCADE |
| `children` | `employment_agreements` | 1:N | CASCADE |
| `children` | `financial_legal_docs` | 1:N | CASCADE |
| `children` | `end_of_life_wishes` | 1:1 | CASCADE |
| `children` | `celebration_categories` | 1:N | CASCADE |
| `celebration_categories` | `journeys` | 1:N | SET NULL |
| `journeys` | `journey_moments` | 1:N | CASCADE |

---

## 6. Access Control Domain

### Dual-Axis Authorization Model

The system implements a **two-layer access control** model:

```
LAYER 1: Application-Wide Roles (user_roles)
=============================================
Determines WHAT the user can access in the app itself.

  admin     ──> Full system access, admin panel, user management
  caregiver ──> Standard authenticated user
  viewer    ──> Restricted application features

LAYER 2: Per-Child Roles (child_access)
=======================================
Determines WHAT the user can do with a specific child's data.

  owner     ──> Full control over child profile + data + team
  caregiver ──> Read + write all child data
  viewer    ──> Read-only access to child data
```

### Permission Matrix

```
                    | View Data | Edit Data | Delete Data | Invite Team | Manage Child |
--------------------|-----------|-----------|-------------|-------------|--------------|
owner               |     Y     |     Y     |      Y      |      Y      |      Y       |
caregiver           |     Y     |     Y     |      Y      |      N      |      N       |
viewer              |     Y     |     N     |      N      |      N      |      N       |
```

### Invitation Flow (State Machine)

```
                  +----------+
  Owner creates   |          |
  invite -------->| PENDING  |
                  |          |
                  +----+-----+
                       |
          +------------+------------+
          |                         |
    Invitee redeems           Time expires
    invite code               (48 hours)
          |                         |
    +-----v-----+            +-----v-----+
    |           |            |           |
    | ACCEPTED  |            |  EXPIRED  |
    |           |            |           |
    +-----------+            +-----------+
          |
          v
    child_access record
    created with role
```

### Row-Level Security (RLS) Pattern

Every data table enforces access through this SQL pattern:

```sql
-- SELECT policy: User can view if they have ANY access to the child
CREATE POLICY "select_policy" ON table_name
  FOR SELECT USING (
    child_id IN (
      SELECT child_id FROM child_access
      WHERE user_id = auth.uid()
    )
  );

-- INSERT/UPDATE policy: User must be owner or caregiver
CREATE POLICY "modify_policy" ON table_name
  FOR INSERT WITH CHECK (
    child_id IN (
      SELECT child_id FROM child_access
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'caregiver')
    )
  );
```

---

## 7. Entity Specifications

### Child (Aggregate Root)

```typescript
// Database entity
interface Child {
  id: string;             // UUID, primary key
  user_id: string;        // FK to auth.users (the owner)
  name: string;           // Display name
  avatar_url: string | null;
  created_at: string;     // ISO timestamp
  updated_at: string;     // ISO timestamp
}

// Extended with access info (client-side)
interface ChildWithAccess extends Child {
  accessRole: "owner" | "caregiver" | "viewer";
}
```

### Key Information (1:1 with Child)

```typescript
interface KeyInformation {
  id: string;
  child_id: string;
  user_id: string;
  full_name: string;              // min 2 chars
  birth_date: string | null;
  address: string | null;
  phone_number: string | null;
  email: string | null;           // valid email or empty
  health_card_number: string | null;  // ENCRYPTED
  insurance_provider: string | null;  // ENCRYPTED
  insurance_number: string | null;    // ENCRYPTED
  emergency_contact: string | null;
  emergency_phone: string | null;
  medical_conditions: string | null;  // free text
  allergies: string | null;           // free text
  likes: string | null;              // child's preferences
  dislikes: string | null;
  do_nots: string | null;            // things to never do
  additional_notes: string | null;
  created_at: string;
  updated_at: string;
}
```

### Medication

```typescript
interface Medication {
  id: string;
  child_id: string;
  user_id: string;
  name: string;                    // required, min 1 char
  dosage: string;                  // required, e.g. "5mg"
  frequency: MedicationFrequency; // required
  purpose: string | null;
  prescriber: string | null;       // prescribing doctor
  pharmacy: string | null;
  start_date: string | null;
  end_date: string | null;
  refill_date: string | null;      // triggers "Refill Soon" alert
  instructions: string | null;
  side_effects: string | null;
  created_at: string;
  updated_at: string;
}
```

### Medical Contact

```typescript
interface MedicalContact {
  id: string;
  child_id: string;
  user_id: string;
  name: string;                    // min 2 chars
  type: MedicalContactType;       // required
  specialty: string | null;
  phone_number: string;            // required
  email: string | null;            // valid email or empty
  address: string | null;
  notes: string | null;
  is_primary: boolean;             // default false
  created_at: string;
  updated_at: string;
}
```

### Emergency Protocol

```typescript
interface EmergencyProtocol {
  id: string;
  child_id: string;
  user_id: string;
  title: string;                   // required
  severity: "critical" | "urgent" | "moderate";
  emergency_contacts: string;      // required, text block
  immediate_steps: string;         // required, ordered steps
  when_to_call_911: string | null; // guidance text
  additional_notes: string | null;
  created_at: string;
  updated_at: string;
}
```

### Emergency Card

```typescript
interface EmergencyCard {
  id: string;
  child_id: string;
  user_id: string;
  id_type: string;                 // e.g. "health_card", "disability_id"
  id_number: string;               // display value
  id_number_encrypted: string | null; // ENCRYPTED storage
  front_image: string | null;      // Supabase Storage URL
  back_image: string | null;       // Supabase Storage URL
  issue_date: string | null;
  expiry_date: string | null;
  created_at: string;
  updated_at: string;
}
```

### Daily Log Entry

```typescript
interface DailyLogEntry {
  id: string;
  child_id: string;
  user_id: string;
  date: string;                    // ISO date
  time: string;                    // HH:MM format
  category: DailyLogCategory;     // required
  mood: "happy" | "neutral" | "sad"; // required
  title: string;                   // required
  description: string | null;
  priority: "low" | "medium" | "high"; // required
  tags: string[] | null;           // flexible classification
  created_at: string;
  updated_at: string;
}
```

### Supplier

```typescript
interface Supplier {
  id: string;
  child_id: string;
  user_id: string;
  category: "Medicine" | "Supplement" | "Supply" | "Other";
  item_name: string;              // required
  dosage_or_size: string;         // required
  brand_or_strength: string | null;
  provider_name: string;          // required
  contact_phone: string;          // required
  address: string | null;
  website: string | null;
  ordering_instructions: string | null;
  notes: string | null;
  inventory_threshold: number | null; // triggers low-stock alert
  last_order_date: string | null;
  created_at: string;
  updated_at: string;
}
```

### Employment Agreement

```typescript
interface EmploymentAgreement {
  id: string;
  child_id: string;
  user_id: string;
  caregiver_name: string;         // required
  position_title: string | null;
  start_date: string | null;
  end_date: string | null;
  work_schedule: string | null;
  hourly_rate: string | null;
  payment_frequency: string | null;
  duties: string | null;
  emergency_procedures: string | null;
  confidentiality_terms: string | null;
  termination_terms: string | null;
  additional_terms: string | null;
  status: "active" | "draft" | "terminated";
  created_at: string;
  updated_at: string;
}
```

### Financial/Legal Document

```typescript
interface FinancialLegalDoc {
  id: string;
  child_id: string;
  user_id: string;
  doc_type: FinancialLegalDocType; // required
  title: string;                   // required
  description: string | null;
  institution: string | null;
  account_number: string | null;   // ENCRYPTED
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;    // valid email or empty
  expiry_date: string | null;
  notes: string | null;
  status: "active" | "pending" | "expired" | "archived";
  created_at: string;
  updated_at: string;
}
```

### End-of-Life Wishes (1:1 with Child)

```typescript
interface EndOfLifeWishes {
  id: string;
  child_id: string;
  user_id: string;
  legal_guardian: string | null;
  medical_directives: string | null;
  organ_donation: string | null;
  power_of_attorney: string | null;
  preferred_hospital: string | null;
  preferred_physician: string | null;
  religious_cultural_wishes: string | null;
  special_instructions: string | null;
  funeral_preferences: string | null;
  additional_notes: string | null;
  created_at: string;
  updated_at: string;
}
// Note: ALL fields optional — deeply personal decisions
```

### Celebration Category

```typescript
interface CelebrationCategory {
  id: string;
  child_id: string;
  name: string;
  color: string;                  // CSS color value
  icon: string;                   // Lucide icon name
  is_default: boolean | null;
  sort_order: number | null;
  created_at: string;
}
```

### Journey (Milestone Tracking)

```typescript
interface Journey {
  id: string;
  child_id: string;
  category_id: string | null;     // FK to celebration_categories
  title: string | null;
  description: string | null;
  stage: string | null;
  started_at: string | null;
  is_starred: boolean | null;
  created_at: string;
  updated_at: string;
}
```

### Journey Moment

```typescript
interface JourneyMoment {
  id: string;
  child_id: string;
  journey_id: string;             // FK to journeys
  title: string;
  moment_date: string;
  how_we_celebrated: string | null;
  notes: string | null;
  photo_url: string | null;       // Supabase Storage URL
  created_at: string;
}
```

---

## 8. Business Rules & Invariants

### Child Profile Invariants

| Rule | Enforcement |
|------|-------------|
| Every child has exactly ONE owner | `child_access` table constraint |
| A child must have a name | Zod schema: `z.string().min(1)` |
| `key_information.full_name` minimum 2 characters | Zod schema validation |
| Email fields must be valid email or empty | Zod: `z.string().email().optional().or(z.literal(""))` |
| Health card, insurance numbers are encrypted at rest | Database-level encryption functions |

### Medication Rules

| Rule | Enforcement |
|------|-------------|
| Name, dosage, frequency are required | Zod schema: `.min(1)` |
| Refill alert when `refill_date < now + 7 days` | Computed in component render |
| Medication can have start/end date range | Optional fields, validated as dates |
| Frequency must be from defined enum | Zod enum validation |

### Emergency Protocol Rules

| Rule | Enforcement |
|------|-------------|
| Title and immediate steps are required | Zod schema: `.min(1)` |
| Severity is strictly `critical/urgent/moderate` | Zod enum |
| Severity determines visual color coding | Component rendering logic |
| Emergency contacts text is required | Zod schema: `.min(1)` |

### Daily Log Rules

| Rule | Enforcement |
|------|-------------|
| Category, mood, title, priority are required | Zod schema |
| Mood must be `happy/neutral/sad` | Zod enum |
| Priority must be `low/medium/high` | Zod enum |
| Tags are an optional string array | `z.array(z.string()).optional()` |
| Entries are ordered by date DESC, then time | Query `ORDER BY` |

### Access Control Rules

| Rule | Enforcement |
|------|-------------|
| Only owners can invite new team members | `useUserRole` hook check |
| Viewers cannot create, update, or delete data | RLS policies + UI guards |
| Invite codes expire after set period | `expires_at` timestamp check |
| An invite can only be redeemed once | Status transition: pending -> accepted |
| A user cannot have multiple access records for same child | Database unique constraint |

### Financial Document Rules

| Rule | Enforcement |
|------|-------------|
| Account numbers are encrypted | Database encryption functions |
| Status must be from defined enum | Zod enum validation |
| Doc type must be from defined enum | Zod enum validation |

### End-of-Life Wishes Rules

| Rule | Enforcement |
|------|-------------|
| ALL fields are optional | Zod `.optional()` on every field |
| Only one record per child | 1:1 relationship constraint |

---

## 9. Computed & Derived Properties

### Child Age

```
Source:    key_information.birth_date
Formula:  currentYear - birthYear
Display:  "{age} years old"
Location: KeyInformation section header
```

### Daily Mood Summary

```
Source:    daily_log_entries WHERE date = today
Formula:
  happy_count  = entries.filter(mood === 'happy').length
  sad_count    = entries.filter(mood === 'sad').length
  score        = happy_count - sad_count

  score > 0  → "Positive day"
  score < 0  → "Challenging day"
  score === 0 → "Stable day"

Location: Dashboard summary widget
```

### Medication Refill Alert

```
Source:    medication.refill_date
Formula:  refill_date - today < 7 days
Display:  "Refill Soon" badge (warning color)
Location: MedicationsList item
```

### Search Relevance Score

```
Source:    query string vs. entity fields
Formula:
  Exact match          → 100 points
  Starts with query    → 80 points
  Contains query       → 60 points
  Word starts with     → 40 points
  No match             → 0 points

Result:   Sorted by score DESC
Location: SearchBar results dropdown
```

### Dashboard Summary Widgets

```
Computed metrics displayed on dashboard overview:
- Total medications count
- Active emergency protocols count
- Today's daily log entries count
- Upcoming refill alerts
- Team member count
```

---

## 10. Domain Events & Side Effects

### Event Flow Map

```
USER ACTION                  DOMAIN EVENT                  SIDE EFFECT
===========                  ============                  ===========

User signs up            --> new_user_created           --> Auto-create profile
                                                        --> Trigger handle_new_user()

Owner invites caregiver  --> invite_created             --> Generate invite_code
                                                        --> Set expires_at

Caregiver redeems invite --> invite_redeemed            --> Create child_access record
                                                        --> Update invite status

Any data modified        --> record_updated             --> update_updated_at_column()
                                                        --> Realtime broadcast
                                                        --> Invalidate React Query cache

Medication emailed       --> medication_export_sent     --> Rate limit check
                                                        --> Generate HTML
                                                        --> Send via Resend API

User goes offline        --> connectivity_lost          --> Switch to IndexedDB reads
                                                        --> Queue writes to sync queue

User comes online        --> connectivity_restored      --> Process sync queue
                                                        --> Push pending changes
                                                        --> Refresh query cache

Data changes (realtime)  --> postgres_changes           --> Supabase channel broadcast
                                                        --> React Query invalidation
                                                        --> UI re-render
```

### Audit Trail

```typescript
interface SecurityAuditLog {
  id: string;
  table_name: string;     // which entity was accessed
  action: string;         // read, create, update, delete
  user_id: string | null;
  child_id: string | null;
  record_id: string | null;
  accessed_at: string;
  ip_address: string | null;
  user_agent: string | null;
  details: Json | null;   // additional context
}
```

---

## 11. Cross-Cutting Concerns

### Data Encryption

```
Encrypted at rest:
  - key_information.health_card_number
  - key_information.insurance_provider
  - key_information.insurance_number
  - emergency_cards.id_number_encrypted
  - financial_legal_docs.account_number

Decrypted via views:
  - key_information_secure
  - financial_legal_docs_secure

Functions:
  - encrypt_sensitive(text) → encrypted text
  - decrypt_sensitive(encrypted) → plain text
```

### Offline Data Model

```
IndexedDB Stores:
+-- offlineData
|   Key:   "{table_name}:{child_id}"
|   Value: JSON array of cached records
|
+-- syncQueue
    Key:   auto-increment
    Value: {
      id: string,
      operation: "insert" | "update" | "delete",
      table: string,
      data: Record<string, unknown>,
      created_at: string,
      retryCount: number
    }
```

### Searchable Entity Index

```
Searchable entities and their indexed fields:
  medications    → name, dosage, purpose, prescriber
  contacts       → name, specialty, type, phone
  protocols      → title, severity, immediate_steps
  daily_logs     → title, description, category, mood
  suppliers      → item_name, provider_name, category
  key_info       → full_name, medical_conditions, allergies
```

### Internationalization Keys

All domain entities have corresponding i18n keys for:
- Field labels (`medications.name`, `medications.dosage`)
- Enum display values (`severity.critical`, `mood.happy`)
- Validation messages (`validation.required`, `validation.email`)
- Action labels (`actions.save`, `actions.delete`, `actions.export`)

Supported locales: `en` (English-CA), `fr-CA` (French-CA), `es` (Spanish)

---

## Summary

The Special Caring domain model is a **child-centric, hub-and-spoke** architecture where:

1. **Child** is the aggregate root — all data radiates from it
2. **Dual-axis RBAC** provides both app-level and child-level authorization
3. **14 domain entities** cover medical, daily life, legal, and celebration contexts
4. **Encrypted sensitive fields** protect health card and financial data
5. **Offline-first design** ensures availability in any network condition
6. **Real-time sync** keeps all caregivers on the same page
7. **Export capabilities** bridge the digital-physical gap for medical appointments

The model prioritizes **data isolation** (per-child), **access control** (per-role), and **caregiver coordination** (real-time + offline) — the three pillars that make care management for special-needs families effective.
