# How to Disable Email Confirmation in Supabase

To allow users to login immediately after signup without email confirmation:

## Steps:

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project: `gzefyknnjlsjmcgndbfn`
3. Go to **Authentication** → **Settings** (in the left sidebar)
4. Scroll down to **Email Auth Settings**
5. Find the setting **"Confirm email"**
6. **Toggle it OFF** (disable it)
7. Click **Save**

## What this does:

- Users can login immediately after signup
- No email verification required
- Accounts are automatically confirmed
- Users get a session token right away

## Already completed in code:

The signup function in `/utils/supabaseClient.ts` already handles both scenarios:
- If auto-confirm is enabled (email confirmation disabled), users log in immediately
- If email confirmation is required, users see a message to check their email

Once you disable email confirmation in the Supabase dashboard, new signups will work immediately!
