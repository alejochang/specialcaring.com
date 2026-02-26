

## Summary

Google OAuth consent screen requires three public URLs: home page, privacy policy, and terms of service. Your app already has `/privacy` but is missing `/terms` (Terms of Service) and `/help` (Help & Support) pages — even though the footer already links to them.

### What you need to provide to Google

| Field | URL |
|-------|-----|
| Application home page | `https://specialcaring.com` |
| Application privacy policy link | `https://specialcaring.com/privacy` |
| Application terms of service link | `https://specialcaring.com/terms` |

### What needs to be built

The `/privacy` page already exists and works. We need to:

1. **Create `/terms` page** — A Terms of Service page (`src/pages/Terms.tsx`) following the same structure as the existing Privacy page (Navbar + content + Footer). Content will cover standard terms: acceptable use, user responsibilities, data ownership, limitation of liability, and termination.

2. **Create `/help` page** — A Help & Support page (`src/pages/Help.tsx`) with FAQs and contact information, same layout pattern.

3. **Add routes in `App.tsx`** — Register `/terms` and `/help` routes so the existing footer links work.

4. **Add i18n keys** — No changes needed for the page content initially (English-only legal text is standard), but the footer translation keys for these links already exist.

### Technical details

- Both new pages will mirror `src/pages/Privacy.tsx` structure: `Navbar` + `main` content + `Footer`
- Routes added alongside the existing `/privacy` route in `App.tsx`
- No database or backend changes required

