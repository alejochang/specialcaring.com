## Dashboard Welcome Experience Redesign

### Current state

The dashboard is a flat list: a generic "Welcome to your caregiver organizer dashboard" heading, 4 summary widgets, then 10 identical-looking navigation cards, and a static "Getting Started" box. It feels like a directory, not a warm landing page.

### Proposed new layout (top to bottom)

**1. Personalized hero greeting**
A warm banner with a time-of-day greeting ("Good morning, Sarah"), the active child's name and avatar, and a subtle gradient background using the purple/pink brand palette. Compact -- not a full hero, just a welcoming header strip.

**2. Today's Snapshot card**
A single prominent card showing:

- Today's medications (names + times) pulled from the existing medications query as a checklist to keep track if they were given. 
- Next upcoming refill or appointment date
- Latest daily log mood indicator
- This replaces the current 4 summary widgets with a single, focused "today" view

**3. Quick Actions row**
A horizontal row of 3-4 small pill-shaped buttons (not cards) for the most common tasks:

- Add Daily Log
- Add Medication
- View Emergency Card
- Export Data (existing)

Subtle, secondary styling so they don't dominate but are always handy.

**4. Categorized section navigation**
Replace the 10 identical flat cards with grouped sections, each with a section header:

- **Medical & Emergency** -- Child Profile, Emergency Cards, Emergency Protocols, Medications, Medical Contacts, Suppliers
- **Daily Life & Safety** -- Daily Log, Home Safety, Celebrations
- **Resources & Admin** -- Community Services, Employment, Financial & Legal, End-of-Life, Documents

Within each group, use compact horizontal cards (icon + title + short description on one line) instead of tall cards, reducing vertical scrolling significantly.

**5. Remove "Getting Started" block**
Replace with contextual nudges inside the Today's Snapshot (e.g., "Complete your child's profile" if profile < 100%).

### Technical approach


| Change                                       | Files                                                                                       |
| -------------------------------------------- | ------------------------------------------------------------------------------------------- |
| New `DashboardHero` component                | `src/components/dashboard/DashboardHero.tsx` (new)                                          |
| New `TodaySnapshot` component                | `src/components/dashboard/TodaySnapshot.tsx` (new)                                          |
| New `QuickActions` component                 | `src/components/dashboard/QuickActions.tsx` (new)                                           |
| Refactor `DashboardOverview`                 | `src/pages/Dashboard.tsx` -- replace current overview with new components + categorized nav |
| Retire or simplify `DashboardSummaryWidgets` | Data queries move into `TodaySnapshot`; widget file can be removed                          |


No database changes. No new dependencies. Existing queries for medications, daily logs, care team, and child profile are reused.

```text
┌──────────────────────────────────────┐
│  Good morning, Sarah!                │
│  Caring for: Alex  [avatar]          │  ← Hero
├──────────────────────────────────────┤
│  TODAY                               │
│  💊 Ritalin 10mg · 8am  ✓ done      │
│  💊 Melatonin 3mg · 9pm  ○ pending  │  ← Snapshot
│  📋 Last log: 😊 Happy · yesterday  │
│  ⚠️ Refill due: Ritalin in 3 days   │
├──────────────────────────────────────┤
│  [+ Daily Log] [+ Medication] [📋]  │  ← Quick Actions
├──────────────────────────────────────┤
│  MEDICAL & EMERGENCY                 │
│  ♥ Child Profile  ⚠ Emergency Cards │
│  📋 Protocols  💊 Medications  ...   │  ← Compact cards
│                                      │
│  DAILY LIFE & SAFETY                 │
│  📅 Daily Log  🛡 Home Safety  🎉   │
│                                      │
│  RESOURCES & ADMIN                   │
│  🏢 Community  📄 Documents  ...     │
└──────────────────────────────────────┘
```