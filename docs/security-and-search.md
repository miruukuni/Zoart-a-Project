# Sign-in, search, links and project limits

## Apply the update

1. Run `supabase/migrations/202610290001_safety_and_limits.sql` in Supabase's SQL
   Editor. It requires the previous account and Apply-link setup. It preserves
   existing projects. `supabase/setup.sql` includes it for a fresh installation.
2. Enable Google through `docs/google-sign-in-setup.md`. It contains the exact
   callback URL for Google Cloud and the Supabase return-URL settings. The
   current sign-in page uses Google; email templates and SMTP are not required.
3. Restart the backend and frontend. The schema update keeps the project URL.
   Shared private credentials must be replaced separately; see
   [key replacement](key-rotation.md).

## Sign-in

The sign-in page uses **Continue with Google** through Supabase OAuth. It asks
only for basic identity scopes, preserves the intended app destination, and
exchanges the returned PKCE code for a Supabase session. Cancellations and
expired browser flows have Google-specific messages. One-use exchanges are
deduplicated only while running, and the callback preserves an explicit PKCE
flow ID when present. Older email-token callbacks remain for compatibility.

Google verifies identity; Supabase manages the session and account.
The backend verifies account tokens with Supabase and derives ownership from
the verified account. Public database policies allow reading cards, while the
browser cannot write project or private like rows directly. The security of
your Google account remains important. These are useful protections, not
a claim that the entire application has undergone a penetration test.

The public frontend key is intended for browsers. The backend secret belongs
only in `backend/.env`; do not place it in a `NEXT_PUBLIC_` variable. Production
uses HTTPS and your real return URLs. The app also sends no-referrer, nosniff,
and anti-framing headers.

See [Supabase Google sign-in](https://supabase.com/docs/guides/auth/social-sign-in/auth-google)
and [PKCE](https://supabase.com/docs/guides/auth/sessions/pkce-flow).

## Submission moderation

The create endpoint requires a verified account and validates lengths, tags,
majors and application links before Gemini reviews the title and description.
Approved tags and UCI major labels provide context. Author, contact information,
account IDs, Apply links, authentication tokens and keys are not in the review
payload. Common emails, URLs, phone numbers and handles in reviewed text are
redacted, but the redactor is not a complete personal-information detector.
The form asks users to keep sensitive/personal information out of those fields.
Review [Google's data terms](https://ai.google.dev/gemini-api/terms) before launch:
unpaid API content may be used for product improvement and should not include
personal/confidential data. A suitable paid-data arrangement is needed for that.

The structured policy blocks explicit sexual exploitation/content, harassment,
harmful activity, scams/spam, doxxing and clearly unrelated troll submissions.
Legitimate educational, clinical, creative and security-research topics are
allowed. A malformed/inconsistent decision, safety refusal or model outage
prevents publication. A busy gate returns 429 with Retry-After. No major upsert
or project insert occurs before approval, and clients cannot provide their own
approval flag. This depends on retaining the backend-only database write grants.
Someone holding a leaked service key can bypass the API; rotate shared keys.

There is one review per new or changed reviewed submission. A bounded cache
holds only hashes, timestamps and decisions for ten minutes, scoped to account,
model, review policy and reviewed content. Failed checks are not cached as
approvals. The shared single-worker gate and per-IP counters limit live AI
requests. `GEMINI_MODERATION_MODEL` can override the default model independently;
it does not add quota. Raw model errors/submitted text are excluded from AI
failure logs. No SQL migration is required for this backend addition.

Automated moderation can miss abuse or reject legitimate posts. Author/contact
fields and linked websites are outside this review. Reporting and human appeal
tools remain future work. Run `backend/checks/check_moderation.py -v` with the
backend Python environment for offline API regressions; this does not evaluate
live model accuracy.

## Search

Gemini reads only the query and the fixed approved tag catalog, including its
aliases. It never receives individual projects, titles or descriptions. Its
output is a structured filter: each group contains OR alternatives, groups are
combined with AND, and exclusions remove unwanted tags. For example, **AI or
robotics using Python, but no web projects** becomes `(AI / ML OR Robotics) AND
Python`, excluding `Web Dev`. Generic Computer Science is not added merely
because a request mentions programming.

The backend rejects invented labels and applies the plan to the database using
indexed tag-array filters. The existing GIN index handles project retrieval;
the amount of AI input does not grow with the number of projects. Up to 1,000
matching cards are returned per search, consistent with the current browser's
result limit. The page displays the interpreted tags so users can see what was
actually matched. Details absent from the taxonomy, such as experience level,
cannot be guaranteed by tag filtering. Those need explicit approved tags or
separate structured fields in a future update.

The search defaults to the configured `GEMINI_MODEL` (currently 3.5 Flash-Lite).
Set `GEMINI_SEARCH_MODEL` to override it independently. Google's catalog lists
`gemini-3.8-flash` as a stronger Flash model with a free API tier, subject to
project access and quotas. Its earlier live checks timed out here, so it is an
optional setting rather than an unverified default. A 3.8 override uses low
thinking effort to reduce latency. API free-tier access differs from the
consumer Gemini subscription. The code does not enable billing or retry with
paid models; a billing-enabled API project follows Google's billing rules.

Repeated queries reuse their interpreted filter for ten minutes, keyed by the
query, model and tag catalog. Database matches are always fetched fresh, so new
projects can appear without another AI call. The one-request-at-a-time gate
remains in place. When AI fails, a conservative local alias/typo and AND/OR/NOT
parser provides a clearly labeled fallback, cached for 30 seconds. Unrecognized
queries do not silently return everything.

See [Google model catalog](https://ai.google.dev/gemini-api/docs/models)
and [API pricing/free tiers](https://ai.google.dev/gemini-api/docs/pricing).

## Application links

New links require HTTPS and an approved destination: UCI domains, Google Forms
(`forms.gle` or `docs.google.com/forms/`), or GitHub. The shared policy lives in
`zoart-a-project/src/data/application-link-policy.json`; the SQL guard mirrors
it. Any future domain addition needs review and a matching SQL update. The form,
backend and database validate the policy. Unsupported older links are hidden
from cards; their projects can still be taken offline.

Apply first shows the actual host and full address, then offers a separate
external link with no opener or referrer access. This limits destinations and
improves visibility; it is not a malware or phishing scan. A Google Form or
repository can still contain misleading content. Do not enter passwords or
sign-in codes into a project application.

## Four active projects

A database trigger checks creation, reactivation and ownership changes, using
an account-specific transaction lock. Four active posts per account are
allowed. A fifth active post or reactivation is rejected even across tabs.
Setting a post offline frees a slot. Offline history is preserved. Existing
accounts above the limit are not automatically edited, but cannot add or
reactivate posts until they are below four.

## Cards

Majors and tags each occupy one fixed row, with horizontal scrolling for extra
chips. Empty groups keep the same row height. Headers, About boxes and Contact
boxes therefore line up across cards regardless of how many chips were added.
