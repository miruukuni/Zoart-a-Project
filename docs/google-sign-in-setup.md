# Enable Google sign-in

Zoart's sign-in page now uses **Continue with Google**. Google verifies the
account; Supabase creates or resumes its session. Project ownership, likes and
the four-active-project limit continue using the Supabase account ID.

Complete this setup once per Supabase project. The sign-in page checks whether
the Google provider is enabled and offers a retry if configuration changes.

## 1. Create a Google OAuth client

In [Google Auth Platform](https://console.cloud.google.com/auth/overview), use an
existing Google Cloud project or create one. Configure Branding and Audience
for Zoart. Use an External audience if students outside your own Google
Workspace organization should be allowed to sign in. While the app is in
Testing, add the Google accounts you will test with as test users.

Use only basic identity scopes: `openid`, email and profile. Zoart does not need
Gmail, Drive or Calendar access to sign in.

Under **Clients**, create an OAuth client of type **Web application**.

Authorized JavaScript origins for this development setup:

```text
http://localhost:3000
http://127.0.0.1:3000
```

The authorized redirect URI is your Supabase callback, exactly:

```text
https://ihrsnjsmxxtmslcaduva.supabase.co/auth/v1/callback
```

This Google setting uses the Supabase callback. The app's `/auth/callback` is
used in the next step. Google returns to Supabase first, then Supabase returns
to Zoart.

## 2. Enable Google in Supabase

In the existing Supabase project, open **Authentication → Sign In / Providers →
Google**. Enter the Google Client ID and Client Secret there, enable Google, and
save. Enter the secret directly into Supabase; it does not belong in frontend
environment variables, the repository or this chat.

In **Authentication → URL Configuration**, use:

- Site URL: `http://localhost:3000` for development.
- Redirect URLs: `http://localhost:3000/**` and `http://127.0.0.1:3000/**`.

The app returns to `/auth/callback?next=...`, exchanges the PKCE code for a
Supabase session, and allows only `/` or `/search` as return destinations.
Use your deployed HTTPS origin and app callback allowlist for production.

## 3. Test

Refresh the sign-in page and choose **Check again** if it was already open.
**Continue with Google** becomes available after Supabase reports Google enabled.
Choose your Google account and return to Zoart. You should see your account and
be able to create a project, like posts, and manage your own project status.
Sign out and repeat to check returning-user login. On another device, open
your deployed site; localhost refers to the device opening it.

This flow does not send email links or verification codes, so email templates,
SMTP delivery and email sending quotas are not part of Google sign-in.

## Existing accounts

Supabase can automatically link a Google identity to an existing verified-email
account when its identity-linking rules allow it. An account deleted from
Supabase cannot be restored just by using the same email again; a new sign-in
creates a new account ID. Do not assign old posts based only on their author
name or contact text.

Google sign-in itself does not require a SQL migration. Existing database
updates for ownership, project limits and application-link rules are separate.

## Common setup errors

- `redirect_uri_mismatch`: Google's redirect URI must be the exact Supabase
  `/auth/v1/callback` above, rather than the app's `/auth/callback`.
- Google denies a test account: check Audience and add that account under Test
  users while the Google app is in Testing.
- Zoart says sign-in is being set up: save and enable the Google provider in
  Supabase, then choose **Check again**.
- A browser flow expires: start **Continue with Google** again in that browser
  instead of reusing an old callback URL.

Reference: [Supabase's Google setup guide](https://supabase.com/docs/guides/auth/social-sign-in/auth-google).
