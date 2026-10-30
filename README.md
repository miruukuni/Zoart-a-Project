# Zoart-A-Project

Zoart connects UCI students with projects and teammates. Find something that
matches your interests, share an idea, and build experience together. Originally
created for ZotHacks, the project is growing into a student collaboration hub.

[Original hackathon demo](https://youtu.be/RzxWzqZxtPM)

## Current features

- Responsive home and project pages with the Zoart mascot and cream background.
- A project-page mascot reminder after 20 seconds, then every 90 seconds, with
  three editable messages, click/10-second dismissal and a sound control.
- Natural-language search: Gemini translates a prompt into approved tag filters.
  Search never sends individual projects or descriptions to Gemini.
- Shared tag catalog with aliases and typo matching; up to **7 tags** per post.
- Multiple UCI majors, loaded from Anteater API and kept separate from tags.
- Google sign-in through Supabase, account likes, and owner-only status controls.
- Active projects by default, offline/My projects views, a major filter, and
  sorting by popularity or creation time. Most liked is the default order.
- Creation age, like counts, and consistent card sections with scrollable content.
- A maximum of **4 active projects per account**, enforced in the database.
- Title limit of **80 characters** and description limit of **2,000 characters**.
- Optional Apply links restricted to UCI sites, Google Forms and GitHub, with a
  destination confirmation before opening the link.
- Required server-side Gemini review of the title and description before a new
  project is saved. Rejected or unchecked submissions are not published.

## Stack and folders

| Part                     | Technology / location                                         |
| ------------------------ | ------------------------------------------------------------- |
| Website                  | Next.js, React, TypeScript, Tailwind CSS — `zoart-a-project/` |
| API                      | Python, FastAPI, Google GenAI SDK — `backend/`                |
| Accounts and data        | Supabase Auth and Postgres — `supabase/`                      |
| UCI major catalog        | Anteater API                                                  |
| Setup and security notes | `docs/`                                                       |

## Local setup on Windows

Install **Node.js 22 or later** (includes npm/npx) and **Python 3.11 or later**.
Use separate VS Code terminals for the backend and frontend. Commands below
start in the repository root; no global Uvicorn installation is needed.

### 1. Configure environment files

Copy `backend/.env.example` to `backend/.env` and
`zoart-a-project/.env.example` to `zoart-a-project/.env.local` if those local
files do not already exist. Fill them in locally; never commit real secrets.

| File                         | Setting                         | Purpose                                                          |
| ---------------------------- | ------------------------------- | ---------------------------------------------------------------- |
| `backend/.env`               | `SUPABASE_URL`                  | Existing Supabase project URL                                    |
| `backend/.env`               | `SUPABASE_SECRET_KEY`           | Private backend `sb_secret_...` key                              |
| `backend/.env`               | `GEMINI_API_KEY`                | Private Gemini API key                                           |
| `backend/.env`               | `GEMINI_MODEL`                  | Default model, currently `gemini-3.5-flash-lite`                 |
| `backend/.env`               | `GEMINI_SEARCH_MODEL`           | Optional independent search model override                       |
| `backend/.env`               | `GEMINI_MODERATION_MODEL`       | Optional independent moderation model override                   |
| `backend/.env`               | `CORS_ORIGINS`                  | Comma-separated frontend origins                                 |
| `zoart-a-project/.env.local` | `NEXT_PUBLIC_SUPABASE_URL`      | Same Supabase project URL                                        |
| `zoart-a-project/.env.local` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public `sb_publishable_...` key; variable retains its older name |
| `zoart-a-project/.env.local` | `NEXT_PUBLIC_API_URL`           | Backend address, usually `http://localhost:8000`                 |

Both private keys belong only on the backend. The Supabase publishable key and
project URL are intentionally public. **If private keys were shared on Discord,
rotate and revoke them using [the key replacement guide](docs/key-rotation.md).**
Changing SQL or deleting a message does not revoke a credential.

### 2. Set up Supabase and Google

Run the complete [supabase/setup.sql](supabase/setup.sql) in the existing
project's SQL Editor. It is rerunnable and includes the current schema,
permissions, ownership, likes, link checks and active-project limit. It preserves
existing projects. Do not also run every historical migration afterward.

For incremental upgrades, see [supabase/README.md](supabase/README.md).
Google requires its own OAuth configuration; follow
[Google sign-in setup](docs/google-sign-in-setup.md). The website does not collect
Google passwords. Supabase manages accounts and sessions, while the backend
verifies account tokens before writes. Sign-in is open to configured Google
users; this is **not currently restricted to UCI email addresses**.

No new SQL migration is needed for the moderation addition. It requires the
existing backend-only write permissions and a working Gemini key.

### 3. Start the backend

```powershell
py -m venv backend/.venv
backend/.venv/Scripts/python.exe -m pip install -r backend/requirements.txt
Set-Location backend
.venv/Scripts/python.exe -m uvicorn app.gemini:app --reload --port 8000
```

If a working virtual environment already exists, skip creating it. Select
`backend/.venv/Scripts/python.exe` as VS Code's Python interpreter. Run **one
backend worker**: the current AI request gate, rate counters and caches live in
that process. API documentation is at [localhost:8000/docs](http://localhost:8000/docs).

### 4. Start the frontend in another terminal

```powershell
Set-Location zoart-a-project
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). Restart the backend after changing
backend keys; restart/rebuild the frontend after changing its public settings.
Update hosting environment variables too when the app is deployed.

## How Gemini is used

**Search:** the prompt and approved tag catalog become AND/OR/exclusion filters;
Postgres finds matching projects. The filter plan is cached for ten minutes,
while matching projects are fetched fresh. AI input does not grow with the
number of projects. A local alias/typo parser is the fallback when AI is unavailable.

**Tags:** known aliases and clear typos are handled locally. Unfamiliar terms
can be matched by Gemini, but only to approved labels.

**Uploads:** after sign-in and field validation, Gemini reviews the title,
description, approved tags and selected major labels. Author, contact, account
details and Apply URLs are excluded. Common emails, phone numbers, handles and
URLs in the reviewed text are redacted; this does not detect every kind of
personal information. Keep personal/sensitive information out of titles and
descriptions, and review [Google's data terms](https://ai.google.dev/gemini-api/terms)
before a public launch. The free API can use submitted content to improve Google
products; use a suitable paid-data arrangement for personal data.

Reviews reject inappropriate content, scams/spam and clear troll listings while
allowing legitimate educational and research topics. A refusal, invalid response
or outage blocks publication. The form retains its input. Decisions are cached
for ten minutes per account, model and reviewed content; changed content needs
a new review. This is an automated screening layer, not a guarantee that every
bad submission or malicious destination will be detected. Author/contact fields
and linked websites are not reviewed by Gemini.

All AI tasks share a single in-flight request gate and a per-IP limit of
10 requests/minute with a three-second cooldown. Busy requests return a retry
message. Separate model settings do not create additional API quota. Quotas
apply per Google Cloud project, not per API key. Keep one setup initially;
monitor actual usage before adding infrastructure. Before using multiple API
workers or replicas, move rate limits/caches to a shared service and introduce
a bounded queue. See [security and search details](docs/security-and-search.md).

## Verification

From the repository root:

```powershell
backend/.venv/Scripts/python.exe backend/checks/check_moderation.py -v
```

These offline checks mock Gemini and Supabase. They verify rejection/outage
behavior, authenticated ownership, prevention of client bypasses, review caching
and data minimization. They do not measure the live model's classification accuracy.

From `zoart-a-project/`:

```powershell
npm run lint
npx tsc --noEmit
node --test src/lib/filter-projects.test.mjs src/lib/project-order.test.mjs
node --test src/lib/mascot-reminder.test.mjs
npm run build
```

Test real Google sign-in, sign-out and returning-user login through your own
browser using [the sign-in guide](docs/google-sign-in-setup.md). Production needs
HTTPS and the deployed callback/origin settings.

## Next improvements

- Replace placeholder click sounds, home-page descriptions and the sign-in GIF.
- Add a full project page and owner editing/deletion controls.
- Add reporting and human review for moderation mistakes or missed abuse.
- Explore dedicated club and student-event/news pages as the hub grows.
