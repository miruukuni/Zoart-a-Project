# Database setup

For the latest four-active-project and approved-link update on an existing
installation, run `migrations/202610290001_safety_and_limits.sql`. Also follow
`docs/security-and-search.md` for Google sign-in and search settings.

Use **setup.sql**. It is the one complete setup script for the current app.

1. Open your existing Supabase project.
2. Select **SQL Editor → New query**.
3. Copy the entire contents of `setup.sql`, paste it, and click **Run**.
4. Follow `docs/google-sign-in-setup.md` for Google OAuth and sign-in return URLs.
5. Restart the backend and refresh the app.

Keep the same project URL. SQL does not rotate keys: replace shared private
credentials using [the key replacement guide](../docs/key-rotation.md). Do not
delete the Supabase project or its tables. The script creates missing tables,
sets public-read/backend-write permissions, adds approved tags, project ownership,
and account likes. Supabase manages the `auth.users` table. The script installs
the verified-account creation, status, and likes functions. It preserves data and can be
run more than once. Its final results show how many projects were preserved and
whether public read/write permissions are configured correctly.

The files in `migrations/` are historical incremental upgrades. They do not need
to be run in addition to `setup.sql`.

If you already ran the account setup before Apply links were added, you can run
only `migrations/202610280001_project_applications.sql` for this addition. See
`docs/apply-links.md` for its upload field and the editable mascot messages.
