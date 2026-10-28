# Upload Project modal

`UploadProjectModal` accepts `open`, `onClose`, and an async `onSubmit` callback.
The optional `demo` flag labels simulated submissions. Both the homepage and
search page pass the real `createProject` callback, which posts to FastAPI.

The picker uses the approved tag catalog in `src/data/tags.json`. Known aliases
resolve locally. Unfamiliar input is matched through `/api/normalize_tag`; only
approved labels can be added. The form allows 1–7 unique tags. Matching is shown
to the user and blocks submission until complete. Typed but unselected input
must be selected or cleared before submission.

A separate optional UCI major picker loads `/api/majors`, shows Anteater API
attribution, and saves multiple stable `major_ids` as removable chips. An unavailable
major catalog does not block posting without majors. The backend validates every
major and saves the project and major links atomically.

Submission is guarded against repeated clicks. Success shows a confirmation;
failure preserves the form and displays the backend error. Closing discards the
form; reopening starts fresh. Closing during a pending submission does not
cancel the database write.

The native dialog makes the rest of the page inert, traps keyboard focus, locks
page scrolling, and restores focus when closed. Escape, backdrop, Cancel, and X
close it. In the tag picker, Up/Down chooses an option, Enter selects or matches
the input, and Escape closes suggestions first.

The current database migration and tag catalog workflow are documented in
`docs/project-updates.md` at the repository root.
