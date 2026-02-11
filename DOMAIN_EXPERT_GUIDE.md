# Special Caring - Domain Expert Guide

## A Comprehensive Technical and Functional Analysis

**Document Version:** 1.0
**Last Updated:** February 2026
**Classification:** Technical Reference Documentation

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Business Context & Target Users](#2-business-context--target-users)
3. [Complete Feature Set](#3-complete-feature-set)
4. [Architecture Deep Dive](#4-architecture-deep-dive)
5. [User Flows & Journeys](#5-user-flows--journeys)
6. [Security Model](#6-security-model)
7. [Database Schema](#7-database-schema)
8. [Technical Stack Analysis](#8-technical-stack-analysis)
9. [Internationalization](#9-internationalization)
10. [Serverless Functions](#10-serverless-functions)
11. [Opportunities & Recommendations](#11-opportunities--recommendations)
12. [Appendices](#12-appendices)

---

## 1. Executive Summary

### What is Special Caring?

Special Caring is a comprehensive **care management platform** designed specifically for families with special-needs children. It serves as a centralized digital hub to organize, store, and share essential care information including medical records, emergency protocols, medications, caregiver contacts, and daily care activities.

### Core Value Proposition

> "A central hub to organize all essential care information for your special-needs child, accessible exactly when you need it."

The platform addresses critical pain points faced by caregivers:
- **Fragmented Information:** Care data scattered across notebooks, apps, and memory
- **Communication Gaps:** Difficulty sharing information with therapists, doctors, and caregivers
- **Emergency Preparedness:** No quick access to critical information in urgent situations
- **Care Coordination:** Multiple caregivers needing consistent, up-to-date information

### Key Differentiators

1. **Multi-Caregiver Collaboration:** Invite-based system allowing multiple caregivers to access and update child information
2. **Multi-Child Support:** Families can manage multiple children from a single account
3. **Role-Based Access Control:** Granular permissions (Owner/Caregiver/Viewer)
4. **Mobile-First Design:** Responsive interface optimized for on-the-go access
5. **Export & Share:** Email medications lists and emergency cards to healthcare providers

---

## 2. Business Context & Target Users

### Primary Users

| User Type | Description | Key Needs |
|-----------|-------------|-----------|
| **Parents/Guardians** | Primary caregivers of special-needs children | Central information repository, care coordination, emergency preparedness |
| **Family Caregivers** | Grandparents, siblings, extended family members | Access to essential care information when caring for the child |
| **Professional Caregivers** | Hired caregivers, nannies, respite workers | Clear instructions, medication schedules, emergency protocols |
| **Healthcare Providers** | Therapists, doctors, nurses | Medical history, current medications, treatment notes |

### User Personas

**Persona 1: The Coordinating Parent**
- Maria, 42, mother of two children (one with autism spectrum disorder)
- Manages appointments with 5+ specialists
- Needs to share consistent information with school, therapists, and babysitters
- Values: Organization, accessibility, peace of mind

**Persona 2: The Respite Caregiver**
- David, 28, professional caregiver
- Works with multiple families
- Needs quick access to child-specific protocols and emergency information
- Values: Clear instructions, medication details, emergency contacts

**Persona 3: The Family Support Member**
- Carol, 65, grandmother
- Occasionally cares for grandchild with cerebral palsy
- Unfamiliar with complex medical equipment and medications
- Values: Simple interface, step-by-step guides, emergency resources

### Market Context

The platform addresses the caregiving needs of approximately:
- 6.5 million children with disabilities in the US
- Growing demand for care coordination tools
- Increasing complexity of medical care management
- Rising need for multi-caregiver household coordination

---

## 3. Complete Feature Set

### 3.1 Child Profile Management

**Key Information Section**
- Personal details: Name, birth date, address, contact information
- Health card and insurance information
- Medical conditions and diagnoses (text-based documentation)
- Allergies (food, environmental, medication)
- Preferences: Likes, dislikes, and critical "Do NOT Do" restrictions
- Emergency contact details
- Age auto-calculation from birth date

**Multi-Child Support**
- Create up to 10 children per account
- Color-coded child selector with avatars
- Quick switching between children
- Persistent active child selection

### 3.2 Medical Management

**Medications List**
| Feature | Description |
|---------|-------------|
| Medication tracking | Name, dosage, frequency, purpose |
| Healthcare provider info | Prescribing doctor, pharmacy |
| Schedule management | Start date, end date, refill dates |
| Refill alerts | 7-day warning badges |
| Special instructions | Administration notes, side effects |
| Export/Email | Share medication list with providers |

**Medical Contacts**
- Contact types: Primary Physician, Specialist, Pharmacy, Hospital, Emergency Contact
- Primary contact designation with visual indicator
- Full contact details: Phone, email, address, specialty
- Notes field for appointment history or special instructions

**Emergency Cards**
- Digital storage of ID cards (front and back images)
- Card metadata: ID type, number, issue/expiry dates
- Tab-based viewing interface
- Export and email capabilities

### 3.3 Emergency Preparedness

**Medical Emergency Protocols**
- Custom protocol creation per emergency type
- Severity levels: Critical (red), Urgent (orange), Moderate (yellow)
- Structured content:
  - Immediate steps to take
  - Emergency contacts for specific situation
  - When to call 911 criteria
  - Additional notes
- Color-coded display for quick identification

**Home Safety Checklist**
- 26 safety items across 4 categories:
  1. Emergency Preparedness (6 items)
  2. Medical Safety (6 items)
  3. Physical Environment (8 items)
  4. Monitoring & Supervision (6 items)
- Progress tracking with completion percentage
- Checkbox-based completion system
- Quick reference panels for emergency contacts and safety tips

### 3.4 Daily Care Management

**Daily Log**
- 8 activity categories: Medical, Medication, Meals, Sleep, Behavior, Therapy, Social, Milestone
- Mood tracking: Happy, Neutral, Sad with sentiment analysis
- Priority levels: Low, Medium, High
- Time-stamped entries with filtering (Today/Week/All)
- Daily summary dashboard with mood sentiment

**Suppliers & Providers**
- Track sources for medicines, supplements, and supplies
- Categories: Medicine, Supplement, Supply, Other
- Ordering information: Last order date, inventory threshold
- Contact details: Phone, address, website
- Search and filter functionality

### 3.5 Legal & Financial

**Employment Agreements**
- Caregiver contract management
- Employment details: Position, schedule, hourly rate, payment frequency
- Status tracking: Active, Draft, Terminated, Expired
- Terms documentation: Duties, confidentiality, termination, emergency procedures

**Financial & Legal Documents**
- Document types: Insurance, Trust, Guardianship, Power of Attorney, Disability Benefits, Tax, Bank
- Status tracking: Active, Pending, Expired, Archived
- Contact information for associated institutions
- Expiry date tracking

**End-of-Life Wishes**
- Advanced medical directives
- Preferred hospital and physician
- Organ donation preferences
- Funeral and religious/cultural wishes
- Legal guardian and Power of Attorney information

### 3.6 Community Resources

**Community Services Directory**
- 4 service categories: Education, Healthcare, Support, Recreation
- 12 pre-populated local services
- Service details: Ratings, contact, hours, address, website
- Bookmark/save functionality
- Category-based browsing with tabs

### 3.7 Care Team Collaboration

**Team Management**
- View all team members with roles
- Role-based badges: Owner (purple), Caregiver (blue), Viewer (gray)
- Member removal capability (owners only)
- Profile display with names

**Invitation System**
- Create invite codes (6-byte hex, auto-generated)
- Optional email association
- Role selection: Caregiver (read/write) or Viewer (read-only)
- 7-day expiration
- Copy-to-clipboard functionality
- Pending invites management
- Invite revocation

---

## 4. Architecture Deep Dive

### 4.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              React SPA (Vite + TypeScript)              │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌───────────┐  │   │
│  │  │ Pages   │  │ Layouts │  │Sections │  │ UI (shadcn)│  │   │
│  │  └────┬────┘  └────┬────┘  └────┬────┘  └─────┬─────┘  │   │
│  │       └────────────┴───────────┴──────────────┘        │   │
│  │                         │                               │   │
│  │  ┌─────────────────────┴─────────────────────────┐     │   │
│  │  │              State Management Layer            │     │   │
│  │  │  ┌──────────┐  ┌──────────┐  ┌────────────┐  │     │   │
│  │  │  │AuthContext│  │ChildContext│  │TanStack Query│  │     │   │
│  │  │  └──────────┘  └──────────┘  └────────────┘  │     │   │
│  │  └───────────────────────────────────────────────┘     │   │
│  └─────────────────────────────────────────────────────────┘   │
└───────────────────────────────┬─────────────────────────────────┘
                                │ HTTPS
┌───────────────────────────────┴─────────────────────────────────┐
│                     SUPABASE BACKEND-AS-A-SERVICE               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   Supabase Edge Functions               │   │
│  │  ┌──────────┐  ┌────────────────┐  ┌────────────────┐  │   │
│  │  │delete-user│  │send-medications│  │export-em-cards│  │   │
│  │  └──────────┘  └────────────────┘  └────────────────┘  │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Supabase Services                    │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │   │
│  │  │   Auth   │  │ Database │  │ Storage  │  │Realtime│ │   │
│  │  │(OAuth+JWT)│  │(PostgreSQL)│  │ (Files)  │  │  (WS) │ │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └────────┘ │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  Row-Level Security (RLS)               │   │
│  │     has_child_access()  │  is_child_owner()  │  has_role()  │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Component Architecture

```
src/
├── App.tsx                           # Root component with providers
│   ├── QueryClientProvider           # TanStack Query
│   ├── TooltipProvider               # Radix tooltips
│   ├── Toaster (x2)                  # Toast notifications
│   └── BrowserRouter                 # React Router
│       └── AppContent
│           ├── AuthProvider          # Authentication context
│           ├── ChildProvider         # Multi-child context
│           └── AuthNavigationHandler # Route guards
│
├── pages/
│   ├── Index.tsx                     # Landing page (public)
│   ├── Login.tsx                     # Authentication
│   ├── Register.tsx                  # User registration
│   ├── Dashboard.tsx                 # Main dashboard container
│   ├── AdminPanel.tsx                # Admin user management
│   ├── Profile.tsx                   # User profile
│   └── NotFound.tsx                  # 404 page
│
├── components/
│   ├── layout/
│   │   ├── Dashboard.tsx             # Main layout (sidebar + content)
│   │   ├── Navbar.tsx                # Public page navigation
│   │   └── Footer.tsx                # Public page footer
│   │
│   ├── sections/                     # Feature components (12 total)
│   │   ├── KeyInformation.tsx        # Child profile
│   │   ├── MedicationsList.tsx       # Medications management
│   │   ├── MedicalContacts.tsx       # Healthcare providers
│   │   ├── EmergencyCards.tsx        # ID card storage
│   │   ├── MedicalEmergencyProtocols.tsx # Emergency procedures
│   │   ├── HomeSafety.tsx            # Safety checklist
│   │   ├── DailyLog.tsx              # Activity logging
│   │   ├── SuppliersList.tsx         # Supplier management
│   │   ├── CommunityServices.tsx     # Local resources
│   │   ├── EmploymentAgreement.tsx   # Caregiver contracts
│   │   ├── FinancialLegal.tsx        # Legal documents
│   │   └── EndOfLifeWishes.tsx       # Advanced directives
│   │
│   ├── auth/
│   │   ├── AuthForm.tsx              # Login/Register form
│   │   ├── ProtectedRoute.tsx        # Route guard
│   │   ├── PendingApproval.tsx       # Approval waiting screen
│   │   ├── MockAuthToggle.tsx        # Dev testing
│   │   └── ReviewModeToggle.tsx      # Demo mode
│   │
│   ├── ChildSelector.tsx             # Multi-child switcher
│   ├── CareTeamManager.tsx           # Team & invitations
│   ├── RedeemInvite.tsx              # Invite code entry
│   ├── LanguageSwitcher.tsx          # i18n selector
│   └── ui/                           # shadcn/ui components (50+)
│
├── contexts/
│   ├── AuthContext.tsx               # Authentication state
│   └── ChildContext.tsx              # Child selection state
│
├── hooks/
│   ├── useUserRole.tsx               # Role & permissions
│   ├── useMedications.tsx            # Medications CRUD
│   ├── useMedicalContacts.tsx        # Contacts CRUD
│   ├── useExportAndEmail.tsx         # Export functionality
│   ├── useSessionValidator.tsx       # Session validation
│   ├── useReviewMode.tsx             # Demo mode
│   ├── useMockAuth.tsx               # Test auth
│   ├── use-mobile.tsx                # Responsive detection
│   └── use-toast.ts                  # Toast notifications
│
├── integrations/supabase/
│   ├── client.ts                     # Supabase client instance
│   └── types.ts                      # Auto-generated DB types
│
├── i18n/
│   ├── i18n.ts                       # i18next configuration
│   └── locales/
│       ├── en/translation.json
│       ├── es/translation.json
│       └── fr-CA/translation.json
│
└── lib/
    └── utils.ts                      # Utility functions (cn, etc.)
```

### 4.3 State Management Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    STATE MANAGEMENT LAYERS                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              GLOBAL STATE (React Context)            │   │
│  │                                                       │   │
│  │  AuthContext                   ChildContext          │   │
│  │  ├── user: User | null         ├── children: Child[] │   │
│  │  ├── session: Session | null   ├── activeChild: Child│   │
│  │  ├── isLoading: boolean        ├── isLoading: boolean│   │
│  │  ├── isReviewMode: boolean     └── Methods:          │   │
│  │  └── Methods:                      ├── setActiveChildId│
│  │      ├── signInWithEmail           ├── addChild       │   │
│  │      ├── signInWithGoogle          ├── updateChild    │   │
│  │      ├── signUp                    ├── deleteChild    │   │
│  │      ├── signOut                   └── isOwner        │   │
│  │      ├── startReviewMode                              │   │
│  │      └── exitReviewMode                               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │            SERVER STATE (TanStack Query)             │   │
│  │                                                       │   │
│  │  Query Keys Pattern:                                 │   │
│  │  ['tableName', activeChild?.id]                      │   │
│  │                                                       │   │
│  │  Examples:                                           │   │
│  │  ├── ['keyInformation', 'uuid-123']                  │   │
│  │  ├── ['medications', 'uuid-123']                     │   │
│  │  ├── ['medicalContacts', 'uuid-123']                 │   │
│  │  └── ['emergencyProtocols', 'uuid-123']              │   │
│  │                                                       │   │
│  │  Features:                                           │   │
│  │  ├── Automatic caching                               │   │
│  │  ├── Background refetching                           │   │
│  │  ├── Optimistic updates                              │   │
│  │  └── Query invalidation on mutations                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              LOCAL STATE (useState/useForm)          │   │
│  │                                                       │   │
│  │  Component-level state for:                          │   │
│  │  ├── Form data (React Hook Form)                     │   │
│  │  ├── UI state (modals, tabs, sidebar)               │   │
│  │  ├── Loading states                                  │   │
│  │  └── Editing modes                                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.4 Data Flow Pattern

```
┌──────────────────────────────────────────────────────────────┐
│                    STANDARD SECTION DATA FLOW                │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  1. FETCH DATA                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  const { data, isLoading } = useQuery({                │ │
│  │    queryKey: ['medications', activeChild?.id],         │ │
│  │    queryFn: async () => {                              │ │
│  │      const { data, error } = await supabase            │ │
│  │        .from('medications')                            │ │
│  │        .select('*')                                    │ │
│  │        .eq('child_id', activeChild.id);                │ │
│  │      return data;                                      │ │
│  │    },                                                  │ │
│  │    enabled: !!user && !!activeChild,                   │ │
│  │  });                                                   │ │
│  └────────────────────────────────────────────────────────┘ │
│                           │                                  │
│                           ▼                                  │
│  2. DISPLAY DATA                                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  {isLoading ? <Spinner /> : <DataDisplay data={data} />│ │
│  └────────────────────────────────────────────────────────┘ │
│                           │                                  │
│                           ▼                                  │
│  3. MUTATE DATA                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  const mutation = useMutation({                        │ │
│  │    mutationFn: async (values) => {                     │ │
│  │      await supabase.from('medications').insert([...]);  │ │
│  │    },                                                  │ │
│  │    onSuccess: () => {                                  │ │
│  │      queryClient.invalidateQueries({                   │ │
│  │        queryKey: ['medications', activeChild?.id]      │ │
│  │      });                                               │ │
│  │      toast({ title: "Success!" });                     │ │
│  │    },                                                  │ │
│  │  });                                                   │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 5. User Flows & Journeys

### 5.1 New User Registration Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER REGISTRATION FLOW                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────┐    ┌──────────┐    ┌───────────────┐    ┌────────────┐
│ Landing │───▶│ Register │───▶│ Email Confirm │───▶│   Login    │
│  Page   │    │   Form   │    │   (Supabase)  │    │            │
└─────────┘    └──────────┘    └───────────────┘    └────────────┘
                    │                                      │
                    │ Creates:                             │
                    │ - auth.users record                  │
                    │ - profiles record (trigger)          │
                    │ - user_roles (is_approved: false)    │
                    │                                      │
                    ▼                                      ▼
              ┌──────────────────────────────────────────────────┐
              │              APPROVAL CHECK                      │
              │                                                  │
              │  if (role === 'admin') {                         │
              │    // Bypass approval                            │
              │    redirect('/dashboard');                       │
              │  } else if (!isApproved) {                       │
              │    // Show pending screen                        │
              │    render(<PendingApproval />);                  │
              │  } else {                                        │
              │    redirect('/dashboard');                       │
              │  }                                               │
              └──────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
            ┌──────────────┐               ┌──────────────┐
            │   Pending    │               │   Dashboard  │
            │   Approval   │               │    Access    │
            │    Screen    │               │   Granted    │
            └──────────────┘               └──────────────┘
                    │                               │
                    │ (Admin approves)              │
                    └───────────────────────────────┘
```

### 5.2 Child Creation & First-Time Setup

```
┌─────────────────────────────────────────────────────────────────┐
│                   FIRST-TIME CHILD SETUP                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────┐
│  Dashboard  │
│  (No Child) │
└──────┬──────┘
       │ Click "Add Child"
       ▼
┌─────────────────┐
│  Enter Child    │
│     Name        │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE OPERATIONS                      │
│                                                             │
│  1. INSERT INTO children (user_id, name)                    │
│                    │                                        │
│                    ▼                                        │
│  2. TRIGGER: handle_new_child_access()                      │
│     INSERT INTO child_access (child_id, user_id, role='owner')│
│                    │                                        │
│                    ▼                                        │
│  3. ChildContext.refetch()                                  │
│     setActiveChildId(newChild.id)                           │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Child Profile  │───▶│   Medications   │───▶│   Emergency     │
│     Setup       │    │     Setup       │    │    Protocols    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│                    READY FOR USE                            │
│  - Dashboard overview with all sections                     │
│  - Care Team shows user as "Owner"                          │
│  - Invite button available for sharing                      │
└─────────────────────────────────────────────────────────────┘
```

### 5.3 Care Team Invitation Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    INVITATION FLOW                              │
└─────────────────────────────────────────────────────────────────┘

OWNER (Inviter)                           CAREGIVER (Invitee)
─────────────────                         ────────────────────

┌─────────────────┐
│ Click "Invite"  │
│ in Care Team    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Select Role:    │
│ □ Caregiver     │
│ □ Viewer        │
│                 │
│ Email: (opt)    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ INSERT INTO child_invites:              │
│ - invite_code: 'a1b2c3d4e5f6'           │
│ - role: 'caregiver'                     │
│ - status: 'pending'                     │
│ - expires_at: now() + 7 days            │
└────────────────────┬────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│ Display Generated Code:                 │
│ ┌─────────────────────────────────────┐ │
│ │         a1b2c3d4e5f6                │ │
│ └─────────────────────────────────────┘ │
│         [Copy to Clipboard]             │
└────────────────────┬────────────────────┘
                     │
                     │ Share via email/text/etc.
                     │
                     ▼ ─────────────────────────▶ ┌─────────────────┐
                                                  │ Receive Code    │
                                                  │ from Owner      │
                                                  └────────┬────────┘
                                                           │
                                                           ▼
                                                  ┌─────────────────┐
                                                  │ Click "Join"    │
                                                  │ Enter Code      │
                                                  └────────┬────────┘
                                                           │
                                                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    redeem_invite() RPC                          │
│                                                                 │
│ 1. Validate: code exists, status='pending', not expired         │
│ 2. Check: user doesn't already have access                      │
│ 3. INSERT INTO child_access (child_id, user_id, role)           │
│ 4. UPDATE child_invites SET status = 'accepted'                 │
└─────────────────────────────────────────────────────────────────┘
                                                           │
                                                           ▼
                                                  ┌─────────────────┐
                                                  │ Child appears   │
                                                  │ in Child        │
                                                  │ Selector!       │
                                                  └─────────────────┘
```

### 5.4 Dashboard Navigation Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    DASHBOARD NAVIGATION                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ ┌─────────────┐  ┌────────────────────────────────────────────┐ │
│ │             │  │              HEADER                        │ │
│ │             │  │  [Home] [Language] [User Menu ▼]           │ │
│ │   SIDEBAR   │  ├────────────────────────────────────────────┤ │
│ │             │  │                                            │ │
│ │ ○ Dashboard │  │  ┌─────────────────────────────────────┐   │ │
│ │ ○ Admin*    │  │  │         CHILD SELECTOR              │   │ │
│ │ ○ Profile   │  │  │  [Emma ●] [Lucas] [Sophie] [+Add]   │   │ │
│ │ ○ Emergency │  │  └─────────────────────────────────────┘   │ │
│ │ ○ Protocols │  │                                            │ │
│ │ ○ Medical   │  │  ┌──────────────────┐  ┌──────────────┐   │ │
│ │ ○ Medications│  │  │                  │  │  CARE TEAM   │   │ │
│ │ ○ Suppliers*│  │  │   MAIN CONTENT   │  │              │   │ │
│ │ ○ Contacts  │  │  │                  │  │ • You (Owner)│   │ │
│ │ ○ Safety    │  │  │  (Section comp)  │  │ • John (Care)│   │ │
│ │ ○ Community │  │  │                  │  │              │   │ │
│ │ ○ Employment*│ │  │                  │  │ [Invite]     │   │ │
│ │ ○ Daily Log*│  │  │                  │  │              │   │ │
│ │ ○ Financial*│  │  │                  │  │ Pending:     │   │ │
│ │ ○ End-of-Life*│ │  │                  │  │ code123...   │   │ │
│ │             │  │  │                  │  │              │   │ │
│ │  [Collapse] │  │  └──────────────────┘  └──────────────┘   │ │
│ └─────────────┘  │                                            │ │
│                  │  * = Role-restricted (admin/caregiver)     │ │
└─────────────────────────────────────────────────────────────────┘

Route Structure:
/dashboard                    → Dashboard Overview
/dashboard/key-information    → Child Profile
/dashboard/emergency-cards    → Emergency Cards
/dashboard/medical-emergency-protocols → Protocols
/dashboard/medications        → Medications List
/dashboard/suppliers          → Suppliers (role-restricted)
/dashboard/medical-contacts   → Medical Contacts
/dashboard/home-safety        → Home Safety
/dashboard/community-services → Community Services
/dashboard/employment         → Employment (role-restricted)
/dashboard/daily-log          → Daily Log (role-restricted)
/dashboard/financial-legal    → Financial/Legal (role-restricted)
/dashboard/end-of-life        → End-of-Life (role-restricted)
/dashboard/admin              → Admin Panel (admin only)
```

### 5.5 Admin User Management Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    ADMIN USER MANAGEMENT                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      ADMIN PANEL                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Stats: [Total: 15] [Pending: 3] [Approved: 12]                │
│                                                                 │
│  ┌──────────────────────┐  ┌──────────────────────┐            │
│  │ Pending Approvals    │  │ All Users            │            │
│  └──────────────────────┘  └──────────────────────┘            │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Name         │ Role       │ Date      │ Actions         │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │ John Smith   │ [Viewer ▼] │ Jan 15    │ [Approve] [🗑️]  │   │
│  │ Jane Doe     │ [Caregiver▼]│ Jan 14    │ [Approve] [🗑️]  │   │
│  │ Bob Wilson   │ [Viewer ▼] │ Jan 13    │ [Approve] [🗑️]  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

Actions:
┌──────────────┐     ┌─────────────────────────────────────────┐
│   Approve    │────▶│ UPDATE user_roles                       │
│              │     │ SET is_approved = true                  │
└──────────────┘     │ WHERE user_id = ?                       │
                     └─────────────────────────────────────────┘

┌──────────────┐     ┌─────────────────────────────────────────┐
│ Change Role  │────▶│ UPDATE user_roles                       │
│              │     │ SET role = ?                            │
└──────────────┘     │ WHERE user_id = ?                       │
                     └─────────────────────────────────────────┘

┌──────────────┐     ┌─────────────────────────────────────────┐
│   Delete     │────▶│ Edge Function: delete-user              │
│   User       │     │ 1. Verify caller is admin               │
└──────────────┘     │ 2. Prevent self-deletion                │
      │              │ 3. adminClient.auth.admin.deleteUser()  │
      ▼              └─────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│              CONFIRMATION DIALOG                            │
│                                                             │
│  "Are you sure you want to permanently delete this user?    │
│   This will remove all their data."                         │
│                                                             │
│              [Cancel]  [Delete]                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Security Model

### 6.1 Authentication Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION LAYERS                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Layer 1: SUPABASE AUTH                                          │
│                                                                 │
│ Methods:                                                        │
│ ├── Email/Password (signInWithPassword)                         │
│ ├── Google OAuth (signInWithOAuth)                              │
│ ├── Twitter OAuth (signInWithOAuth)                             │
│ └── Facebook OAuth (signInWithOAuth)                            │
│                                                                 │
│ Session Management:                                             │
│ ├── JWT tokens with auto-refresh                                │
│ ├── localStorage persistence                                    │
│ └── 5-minute validation interval                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ Layer 2: APPROVAL WORKFLOW                                      │
│                                                                 │
│ user_roles table:                                               │
│ ├── role: 'admin' | 'caregiver' | 'viewer'                      │
│ └── is_approved: boolean                                        │
│                                                                 │
│ Flow:                                                           │
│ ├── New users: is_approved = false (default)                    │
│ ├── Admin approves via Admin Panel                              │
│ └── Admin role bypasses approval check                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ Layer 3: ROUTE PROTECTION                                       │
│                                                                 │
│ ProtectedRoute component:                                       │
│ ├── Checks user exists (redirect to /login if not)              │
│ ├── Checks isApproved OR isAdmin                                │
│ └── Renders PendingApproval screen if not approved              │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Authorization Model

```
┌─────────────────────────────────────────────────────────────────┐
│                    THREE-TIER ROLE SYSTEM                       │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                        APP ROLES                             │
│              (user_roles table - app-level)                  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   ADMIN     │  │  CAREGIVER  │  │   VIEWER    │          │
│  ├─────────────┤  ├─────────────┤  ├─────────────┤          │
│  │ • Admin     │  │ • Dashboard │  │ • Dashboard │          │
│  │   Panel     │  │   access    │  │   access    │          │
│  │ • Approve   │  │ • All sect- │  │ • Limited   │          │
│  │   users     │  │   ions      │  │   sections  │          │
│  │ • Delete    │  │ • canEdit   │  │ • Read-only │          │
│  │   users     │  │   = true    │  │ • canEdit   │          │
│  │ • Change    │  │             │  │   = false   │          │
│  │   roles     │  │             │  │             │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
│                                                              │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    CHILD ACCESS ROLES                        │
│            (child_access table - per-child)                  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   OWNER     │  │  CAREGIVER  │  │   VIEWER    │          │
│  ├─────────────┤  ├─────────────┤  ├─────────────┤          │
│  │ • Full CRUD │  │ • Read/     │  │ • Read-only │          │
│  │ • Manage    │  │   Write     │  │   access    │          │
│  │   team      │  │   access    │  │ • Cannot    │          │
│  │ • Create    │  │ • Cannot    │  │   modify    │          │
│  │   invites   │  │   invite    │  │   anything  │          │
│  │ • Remove    │  │ • Cannot    │  │             │          │
│  │   members   │  │   remove    │  │             │          │
│  │ • Delete    │  │   members   │  │             │          │
│  │   child     │  │             │  │             │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 6.3 Row-Level Security (RLS)

```sql
-- Core Security Functions (SECURITY DEFINER)

-- Check if user has ANY access to a child
CREATE FUNCTION has_child_access(_user_id uuid, _child_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM child_access
    WHERE user_id = _user_id AND child_id = _child_id
  )
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Check if user is OWNER of a child
CREATE FUNCTION is_child_owner(_user_id uuid, _child_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM child_access
    WHERE user_id = _user_id AND child_id = _child_id AND role = 'owner'
  )
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- RLS Policy Pattern (applied to ALL data tables)
-- Example: medications table

-- SELECT: Users can view data for children they have access to
CREATE POLICY "view_medications" ON medications FOR SELECT
  USING (has_child_access(auth.uid(), child_id));

-- INSERT: Users can insert data for children they have access to
CREATE POLICY "insert_medications" ON medications FOR INSERT
  WITH CHECK (has_child_access(auth.uid(), child_id));

-- UPDATE: Users can update data for children they have access to
CREATE POLICY "update_medications" ON medications FOR UPDATE
  USING (has_child_access(auth.uid(), child_id));

-- DELETE: Users can delete data for children they have access to
CREATE POLICY "delete_medications" ON medications FOR DELETE
  USING (has_child_access(auth.uid(), child_id));
```

### 6.4 Tables Protected by RLS

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| children | has_child_access | user_id = auth.uid() | is_child_owner | is_child_owner |
| child_access | has_child_access | is_child_owner | is_child_owner | is_child_owner (not self) |
| child_invites | is_child_owner | is_child_owner | is_child_owner | is_child_owner |
| key_information | has_child_access | has_child_access | has_child_access | has_child_access |
| medications | has_child_access | has_child_access | has_child_access | has_child_access |
| medical_contacts | has_child_access | has_child_access | has_child_access | has_child_access |
| emergency_cards | has_child_access | has_child_access | has_child_access | has_child_access |
| emergency_protocols | has_child_access | has_child_access | has_child_access | has_child_access |
| daily_log_entries | has_child_access | has_child_access | has_child_access | has_child_access |
| suppliers | has_child_access | has_child_access | has_child_access | has_child_access |
| home_safety_checks | has_child_access | has_child_access | - | has_child_access |
| employment_agreements | has_child_access | has_child_access | has_child_access | has_child_access |
| financial_legal_docs | has_child_access | has_child_access | has_child_access | has_child_access |
| end_of_life_wishes | has_child_access | has_child_access | has_child_access | has_child_access |
| saved_community_services | has_child_access | has_child_access | - | has_child_access |

---

## 7. Database Schema

### 7.1 Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE SCHEMA (PostgreSQL)                 │
└─────────────────────────────────────────────────────────────────┘

                         ┌──────────────┐
                         │  auth.users  │
                         │  (Supabase)  │
                         └──────┬───────┘
                                │
           ┌────────────────────┼────────────────────┐
           │                    │                    │
           ▼                    ▼                    ▼
   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
   │   profiles   │    │  user_roles  │    │   children   │
   │              │    │              │    │              │
   │ id (FK)      │    │ user_id (FK) │    │ user_id (FK) │
   │ full_name    │    │ role         │    │ name         │
   │ avatar_url   │    │ is_approved  │    │ avatar_url   │
   └──────────────┘    └──────────────┘    └──────┬───────┘
                                                  │
                              ┌────────────────────┼────────────────────┐
                              │                    │                    │
                              ▼                    ▼                    ▼
                     ┌──────────────┐     ┌──────────────┐    ┌──────────────┐
                     │ child_access │     │child_invites │    │  [All Data   │
                     │              │     │              │    │   Tables]    │
                     │ child_id(FK) │     │ child_id(FK) │    │              │
                     │ user_id(FK)  │     │ invited_by   │    │ child_id(FK) │
                     │ role         │     │ invite_code  │    │ user_id(FK)  │
                     └──────────────┘     │ role         │    │ ...data...   │
                                          │ status       │    └──────────────┘
                                          │ expires_at   │
                                          └──────────────┘

Data Tables (all have child_id FK):
├── key_information
├── medications
├── medical_contacts
├── emergency_cards
├── emergency_protocols
├── daily_log_entries
├── suppliers
├── home_safety_checks
├── employment_agreements
├── financial_legal_docs
├── end_of_life_wishes
└── saved_community_services
```

### 7.2 Core Tables

**profiles**
```sql
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**user_roles**
```sql
CREATE TABLE user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,  -- 'admin' | 'caregiver' | 'viewer'
  is_approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
```

**children**
```sql
CREATE TABLE children (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**child_access**
```sql
CREATE TABLE child_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role child_access_role NOT NULL DEFAULT 'caregiver',  -- 'owner' | 'caregiver' | 'viewer'
  created_at timestamptz DEFAULT now(),
  UNIQUE(child_id, user_id)
);
```

**child_invites**
```sql
CREATE TABLE child_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  invited_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invite_code text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
  invited_email text,
  role child_access_role NOT NULL DEFAULT 'caregiver',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  created_at timestamptz DEFAULT now()
);
```

### 7.3 Data Tables Summary

| Table | Key Fields | Notes |
|-------|------------|-------|
| key_information | full_name, birth_date, medical_conditions, allergies, likes, dislikes, do_nots, emergency_contact | One record per child |
| medications | name, dosage, frequency, purpose, prescriber, pharmacy, start_date, end_date, refill_date, instructions, side_effects | Multiple per child |
| medical_contacts | name, type, specialty, phone_number, email, address, is_primary, notes | Multiple per child |
| emergency_cards | id_type, id_number, front_image, back_image, issue_date, expiry_date | Multiple per child |
| emergency_protocols | title, severity, immediate_steps, emergency_contacts, when_to_call_911, additional_notes | Multiple per child |
| daily_log_entries | date, time, category, mood, title, description, priority, tags | Multiple per child |
| suppliers | category, item_name, dosage_or_size, provider_name, contact_phone, address, website, last_order_date, inventory_threshold | Multiple per child |
| home_safety_checks | check_id, completed_at | Multiple per child (checkbox tracking) |
| employment_agreements | caregiver_name, position_title, status, work_schedule, hourly_rate, duties, emergency_procedures, confidentiality_terms | Multiple per child |
| financial_legal_docs | doc_type, title, institution, account_number, contact_name, contact_phone, status, expiry_date | Multiple per child |
| end_of_life_wishes | medical_directives, preferred_hospital, organ_donation, funeral_preferences, legal_guardian, power_of_attorney | One record per child |
| saved_community_services | service_id | Many-to-many (child → service) |

---

## 8. Technical Stack Analysis

### 8.1 Frontend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.3.1 | UI component framework |
| **TypeScript** | 5.5.3 | Type safety |
| **Vite** | 5.4.1 | Build tool & dev server |
| **React Router DOM** | 6.26.2 | Client-side routing |
| **TanStack Query** | 5.56.2 | Server state management |
| **React Hook Form** | 7.53.0 | Form state management |
| **Zod** | 3.23.8 | Schema validation |

### 8.2 UI Component Library

| Technology | Version | Purpose |
|------------|---------|---------|
| **Tailwind CSS** | 3.4.11 | Utility-first styling |
| **shadcn/ui** | - | Pre-built component system |
| **Radix UI** | Various | Headless accessible primitives |
| **Lucide React** | 0.462.0 | Icon library |
| **class-variance-authority** | 0.7.1 | Component variants |
| **tailwind-merge** | 2.5.2 | Class merging |

### 8.3 Backend Stack

| Technology | Purpose |
|------------|---------|
| **Supabase** | Backend-as-a-Service |
| **PostgreSQL** | Primary database |
| **Supabase Auth** | Authentication (JWT + OAuth) |
| **Supabase Edge Functions** | Serverless functions (Deno) |
| **Supabase Realtime** | WebSocket subscriptions |

### 8.4 Additional Libraries

| Library | Purpose |
|---------|---------|
| **i18next** | Internationalization framework |
| **react-i18next** | React i18n integration |
| **date-fns** | Date manipulation |
| **recharts** | Data visualization |
| **sonner** | Toast notifications |
| **embla-carousel-react** | Carousel component |
| **react-day-picker** | Date picker |
| **vaul** | Drawer component |

### 8.5 Build & Development

| Tool | Purpose |
|------|---------|
| **Vite** | Development server (port 8080) |
| **@vitejs/plugin-react-swc** | Fast React compilation |
| **ESLint** | Code linting |
| **TypeScript** | Type checking |
| **lovable-tagger** | Development tooling |

---

## 9. Internationalization

### 9.1 Supported Languages

| Locale | Language | Status |
|--------|----------|--------|
| `en-CA` | English (Canada) | Default, complete |
| `fr-CA` | French (Canada) | Complete |
| `es` | Spanish | Complete |

### 9.2 Implementation

```typescript
// src/i18n/i18n.ts
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en-CA',
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

// Usage in components
const { t } = useTranslation();
<h1>{t('home.hero.title')}</h1>
```

### 9.3 Translation Coverage

Currently translated content:
- Landing page (hero, features, CTA, testimonial)
- Navigation elements
- Footer content
- Language names

**Not yet translated:**
- Dashboard section labels
- Form labels and placeholders
- Error messages
- Toast notifications
- Admin panel

---

## 10. Serverless Functions

### 10.1 Edge Functions Overview

Located in `supabase/functions/`:

| Function | Purpose | Auth Required |
|----------|---------|---------------|
| `delete-user` | Admin user deletion | Admin role |
| `send-medications` | Email medications list | User JWT |
| `export-medications` | Generate medications HTML | User JWT |
| `send-emergency-cards` | Email emergency cards | User JWT |
| `export-emergency-cards` | Generate cards HTML | User JWT |

### 10.2 delete-user Function

**Security Flow:**
1. Verify Bearer token exists
2. Extract caller ID from JWT claims
3. Check caller has admin role via `has_role()` RPC
4. Validate user_id provided in body
5. Prevent self-deletion
6. Use service role key to delete via Admin API

```typescript
// Security validation
const { data: isAdmin } = await userClient.rpc("has_role", {
  _user_id: callerId,
  _role: "admin",
});

if (!isAdmin) {
  return Response({ error: "Forbidden: admin role required" }, 403);
}

// Deletion using admin privileges
const adminClient = createClient(supabaseUrl, supabaseServiceKey);
await adminClient.auth.admin.deleteUser(user_id);
```

### 10.3 Email Functions

**send-medications Flow:**
1. Validate RESEND_API_KEY environment variable
2. Authenticate user via Bearer token
3. Call export-medications to generate HTML content
4. Fetch patient name from key_information
5. Send email via Resend API with styled template

**Email Provider:** Resend (npm:resend@2.0.0)

---

## 11. Opportunities & Recommendations

### 11.1 Critical Security Improvements

| Issue                       | Risk   | Recommendation                                                                          |
| --------------------------- | ------ | --------------------------------------------------------------------------------------- |
| **Hardcoded Supabase Keys** | Medium | Move to environment variables; already public anon key but should follow best practices |
| **Demo Mode in Production** | Low    | Remove review mode toggle from production builds                                        |
| **No Rate Limiting UI**     | Medium | Implement client-side request throttling                                                |
| **Default Viewer Fallback** | Low    | Consider denying access instead of defaulting to viewer on role fetch errors            |

### 11.2 Feature Enhancements

**High Priority:**

1. **Offline Support**
   - Implement service worker for PWA functionality
   - Local storage caching with background sync
   - Critical for caregivers with unreliable connectivity

2. **Push Notifications**
   - Medication reminders
   - Refill alerts
   - Care team updates

3. **Document Upload**
   - PDF storage for medical records
   - Image attachments for daily logs
   - Prescription photo storage

4. **Complete i18n Coverage**
   - Translate dashboard sections
   - Form labels and error messages
   - Toast notifications

**Medium Priority:**

5. **Data Export**
   - Full child profile PDF export
   - CSV export for medical records
   - Backup/restore functionality

6. **Calendar Integration**
   - Appointment scheduling
   - Medication schedule view
   - Therapy session tracking

7. **Real-time Collaboration**
   - Live updates when team members make changes
   - Activity feed for recent modifications
   - @mentions for team members

8. **Advanced Search**
   - Global search across all sections
   - Filter by date ranges
   - Search within notes/descriptions

**Future Considerations:**

9. **Mobile App**
   - React Native or Flutter implementation
   - Biometric authentication
   - Widget support for quick access

10. **API Integrations**
    - Healthcare provider systems (FHIR)
    - Pharmacy systems for refill tracking
    - Insurance verification

11. **AI Features**
    - Medication interaction warnings
    - Care recommendation engine
    - Natural language daily log entry

### 11.3 Performance Optimizations

| Area | Current State | Recommendation |
|------|---------------|----------------|
| **Code Splitting** | Single bundle | Implement route-based lazy loading |
| **Image Optimization** | Direct upload | Add image compression and WebP conversion |
| **Bundle Size** | ~500KB+ | Audit dependencies, tree-shake unused code |
| **Caching** | TanStack Query only | Add service worker cache layer |

### 11.4 Technical Debt

1. **Large Components**
   - KeyInformation.tsx: 772 lines
   - Dashboard.tsx: 366 lines
   - CareTeamManager.tsx: 332 lines
   - Recommendation: Split into smaller, focused components

2. **Inconsistent Data Patterns**
   - Some sections use custom hooks (useMedications, useMedicalContacts)
   - Others use inline useQuery
   - Recommendation: Standardize on custom hooks for all data operations

3. **Missing Error Boundaries**
   - No React error boundaries implemented
   - Failed components crash entire app
   - Recommendation: Add error boundaries per section

4. **Test Coverage**
   - No visible test files
   - Recommendation: Add unit tests for hooks, integration tests for flows

### 11.5 Scalability Considerations

| Scale | Users | Recommendations |
|-------|-------|-----------------|
| **Current** | 0-1K | Current architecture sufficient |
| **Growth** | 1K-10K | Add CDN, optimize queries, implement connection pooling |
| **Enterprise** | 10K+ | Consider read replicas, caching layer (Redis), horizontal scaling |

### 11.6 Compliance Considerations

For healthcare-adjacent applications:

1. **HIPAA Considerations**
   - Audit logging for data access
   - Encryption at rest (Supabase provides)
   - BAA with Supabase (Business Associate Agreement)

2. **Data Retention**
   - Define retention policies
   - Implement soft delete with purge schedules
   - User data export (GDPR compliance)

3. **Access Logging**
   - Track who accessed what data when
   - Implement audit trail table
   - Regular access reviews

---

## 12. Appendices

### 12.1 Environment Variables

```env
# Supabase (auto-configured in Supabase Edge Functions)
SUPABASE_URL=https://ogkieklnxxmvjgikyzog.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

# Email (Edge Functions)
RESEND_API_KEY=<resend-api-key>
```

### 12.2 Development Commands

```bash
# Install dependencies
npm install

# Start development server (port 8080)
npm run dev

# Production build
npm run build

# Development build
npm run build:dev

# Run linting
npm run lint

# Preview production build
npm run preview
```

### 12.3 Route Reference

| Route | Component | Auth | Role |
|-------|-----------|------|------|
| `/` | Index | Public | - |
| `/login` | Login | Public | - |
| `/register` | Register | Public | - |
| `/dashboard` | Dashboard | Protected | All approved |
| `/dashboard/:section` | Dashboard | Protected | Varies by section |
| `/dashboard/admin` | AdminPanel | Protected | Admin only |
| `/profile` | Profile | Protected | All approved |
| `*` | NotFound | Public | - |

### 12.4 Sidebar Sections by Role

| Section | Admin | Caregiver | Viewer |
|---------|-------|-----------|--------|
| Dashboard | ✓ | ✓ | ✓ |
| Admin Panel | ✓ | - | - |
| Child Profile | ✓ | ✓ | ✓ |
| Emergency Cards | ✓ | ✓ | ✓ |
| Emergency Protocols | ✓ | ✓ | ✓ |
| Medical Information | ✓ | ✓ | ✓ |
| Medications | ✓ | ✓ | ✓ |
| Suppliers & Providers | ✓ | ✓ | - |
| Medical Contacts & Log | ✓ | ✓ | ✓ |
| Home Safety | ✓ | ✓ | ✓ |
| Community Services | ✓ | ✓ | ✓ |
| Employment Agreement | ✓ | ✓ | - |
| Daily Log | ✓ | ✓ | - |
| Financial & Legal | ✓ | ✓ | - |
| End-of-Life Wishes | ✓ | ✓ | - |

### 12.5 Database Functions

| Function | Purpose | Parameters | Returns |
|----------|---------|------------|---------|
| `has_child_access` | Check user access to child | `_user_id`, `_child_id` | `boolean` |
| `is_child_owner` | Check user owns child | `_user_id`, `_child_id` | `boolean` |
| `has_role` | Check user has app role | `_user_id`, `_role` | `boolean` |
| `redeem_invite` | Process invitation code | `_invite_code`, `_user_id` | `json` |

---

## Document Metadata

**Author:** Generated from codebase analysis
**Version:** 1.0
**Date:** February 2026
**Scope:** Complete technical and functional documentation
**Audience:** Domain experts, developers, architects, product managers

---

*This document was generated through comprehensive static analysis of the Special Caring codebase. For the most current implementation details, always refer to the source code.*
