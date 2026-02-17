

## Problem

When adding a new child, the name is saved to the `children` table. However, when navigating to the Child Profile (Key Information) section, the form reads from the `key_information` table, which has its own `full_name` field. These two are completely disconnected -- the name entered during child creation never prefills the Child Profile form.

## Solution

Prefill the `full_name` field in the Key Information form with the child's name from the `children` table when no key_information record exists yet. This creates a seamless flow: add a child by name, then see that name already filled in when you open their profile.

## Changes

### 1. Update `KeyInformation.tsx` -- Prefill from `activeChild.name`

In the `dbToFormValues` function, when there is no existing `key_information` record (i.e., `dbData` is null), use `activeChild.name` as the default value for `fullName` instead of an empty string.

Additionally, update the `useEffect` that resets the form to also handle the case where `keyInfo` is null but `activeChild` changes -- ensuring the name prefills when switching between children who don't yet have a key_information record.

### 2. Keep names in sync (optional but recommended)

When saving the Key Information form, also update the `children.name` field to match the `full_name` entered, so the child selector and the profile stay consistent.

### Technical Details

**File: `src/components/sections/KeyInformation.tsx`**

- Modify `dbToFormValues` to accept `activeChild` as a second parameter
- When `dbData` is null, set `fullName` to `activeChild?.name || ""`
- In the `useEffect`, also trigger a form reset when `activeChild` changes and `keyInfo` is null
- In the `mutation.mutationFn`, after saving key_information, call `updateChild(activeChild.id, values.fullName)` to keep the child selector name in sync

No database changes are needed -- this is purely a frontend wiring fix.

