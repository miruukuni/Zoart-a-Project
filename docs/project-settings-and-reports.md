# Project settings and reports

Every card has a cogwheel immediately before Apply in its Contact header.
Cards without an Apply link still show it.

## Owners

The signed-in creator gets a prefilled settings form for title, author,
description, tags, majors, contact and Apply link. Saving preserves the project
ID, creation time, availability and likes. Existing field limits, approved tags,
safe-link rules and Gemini review also apply to edits. Failed checks retain the
form input. Ownership is checked before review and again inside the atomic
database update, including replacement of selected majors.

Delete project opens a separate confirmation. Delete permanently removes the
listing and its likes/major links. It cannot be undone. Availability stays on
the existing power button.

## Reports and administrator review

Other visitors get Report project. Sign-in is required to submit an explanation
of 10–2,000 characters. One report per account/project and 10 reports per rolling
24 hours are enforced in the database, including concurrent requests. Reports
do not automatically hide a listing and are not sent to Gemini.

In Supabase's Table Editor, open `public.project_reports` and filter `status`
to `pending`. Review the reason and project, then set status to `reviewed` or
`dismissed`. This change does not add email notifications or an administrator
dashboard. Reports are private to administrators; ordinary users, including
project owners, cannot read them. RLS is enabled and browser grants are revoked.
The linter's informational “RLS enabled, no policy” notice is intentional for
this backend-only table.

A report retains the title as it was when reported. Deleting a project sets
the report's project ID to null without deleting the report. Deleting an Auth
account similarly clears its reporter ID.

## Database setup and verification

Migration `20261101034955_project_management_reports.sql` has been applied to
the connected project. Other existing instances can run it after the current
base setup. `supabase/setup.sql` includes the same additions for fresh installs.
It adds the private inbox and service-only functions without changing existing
project data. No actual projects were edited/deleted or reports submitted during
verification on the hosted database.

Run the offline API checks from the repository root:

```powershell
backend/.venv/Scripts/python.exe backend/checks/check_project_actions.py -v
```

They mock Supabase/Gemini and cover verified identity, ownership, moderation
failure, invalid input/links, deletion authorization and report limits/errors.
Local SQL checks also verify transaction rollback, preserved likes/date/status,
deletion cascades, retained reports and private browser permissions.
