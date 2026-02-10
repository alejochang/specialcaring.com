
# Add Delete User Functionality for Admins

## Overview
Allow admins to delete users from the system via the Admin Panel. Since deleting a user from `auth.users` requires the service role key (not available client-side), this needs a Supabase Edge Function.

## How It Works
1. Admin clicks a "Delete" button next to a user in the Admin Panel
2. A confirmation dialog appears to prevent accidental deletions
3. On confirmation, the app calls a new Edge Function that securely deletes the user
4. The Edge Function uses the service role key to remove the user from `auth.users`, which cascades to `user_roles` and `profiles`

## Changes

### 1. New Edge Function: `delete-user`
- Accepts a `user_id` in the request body
- Verifies the calling user is an admin (server-side check using the JWT + `has_role` function)
- Prevents self-deletion
- Uses the Supabase Admin API to delete the user from `auth.users`
- Related data in `user_roles`, `profiles`, and other tables with user_id will be cleaned up (user_roles has `ON DELETE CASCADE`)

### 2. Update Admin Panel (`src/pages/AdminPanel.tsx`)
- Add a "Delete" button (with trash icon) in the actions column for each user (except the current admin)
- Add a confirmation dialog asking "Are you sure you want to permanently delete this user?"
- Wire up the delete action to call the new edge function
- Refresh the user list after successful deletion

## Technical Details

### Edge Function (`supabase/functions/delete-user/index.ts`)
```text
POST /delete-user
Headers: Authorization: Bearer <user-jwt>
Body: { "user_id": "<uuid>" }

Flow:
1. Extract JWT, verify caller is authenticated
2. Query user_roles to confirm caller has admin role
3. Reject if user_id matches caller (no self-delete)
4. Call supabase.auth.admin.deleteUser(user_id)
5. Return success/error response
```

### Frontend Changes
- Import `AlertDialog` components and `Trash2` icon
- Add `deleteUser` async function that calls the edge function
- Add confirmation dialog triggered by the delete button
- Show delete button only for non-self users in both "Pending" and "All Users" tabs
