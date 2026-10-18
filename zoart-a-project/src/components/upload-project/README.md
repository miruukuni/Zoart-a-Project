# Upload Project modal

Frontend only. Neither component imports Supabase or performs a network request.

```tsx
"use client";

import { useState } from "react";
import UploadProjectModal from "@/components/upload-project/UploadProjectModal";
import UploadProjectTrigger from "@/components/upload-project/UploadProjectTrigger";
import type { CreateProjectInput } from "@/types/project";

export function UploadProject({
  onSubmit,
}: {
  onSubmit: (input: CreateProjectInput) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <UploadProjectTrigger onClick={() => setOpen(true)} />
      <UploadProjectModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={onSubmit}
      />
    </>
  );
}
```

The trigger accepts standard button props. The modal requires `open`, `onClose`,
and an async `onSubmit`; optional `demo` labels simulated submissions. A resolved
callback shows success, a rejected callback preserves input and allows retry.
Submission is guarded against repeated clicks. Closing discards the form; reopening
starts fresh. Closing during a pending callback does not cancel that callback.

The native HTML dialog makes the page behind it inert; explicit Tab/Shift+Tab
wrapping keeps keyboard focus inside it. Escape, the backdrop, Cancel, and X close it. Page scroll is locked while
open and the previously focused trigger regains focus when closed.

## Isolated preview

From `zoart-a-project`, run `npm.cmd install`, then `npm.cmd run dev` on Windows
(use `npm` on other platforms). Open http://localhost:3000/upload-preview.
The callback waits 1.5 seconds, then displays its payload in page memory. Nothing
is persisted. Check “Simulate submission failure” before opening to test retry.
The preview can be removed by deleting `src/app/upload-preview`.

Try an empty submission, whitespace-only fields, contact handles, tag suggestions,
custom tags with Enter, mixed-case duplicate tags, chip removal, double submission,
failure/retry, all dismissal methods, Tab/Shift+Tab, focus restoration, and mobile
scrolling. Focus or click "+ Add tag" to open suggestions. Up/Down arrows choose
an option; Enter selects it or creates the typed tag. The list also offers a
clickable Create option. Escape closes the list first, then the modal on a second
press. Tab or clicking another field dismisses suggestions. Selected tags remain
removable chips inside the input container.

## Visual reference

Based on the supplied screenshot: cream `#ffebc4`, near-black 2px input borders
and a 4px modal outline,
Arial-family type, white inputs, yellow/pink chips, and the wide Create project
action. Brand colors reuse `--sea-teal` (`#00ADA5`), `--yellow-orange` (`#FFB100`),
`--bubblegum-pink` (`#F194B4`), and `--coral-red` (`#CC404A`) through Tailwind
arbitrary-value utilities. Teal colors the header, primary actions, and focus
outlines; coral colors errors and additional tags. Exact-color fallbacks keep
the isolated preview styled when the shared variables are unavailable. No global
theme changes are required. The cream background and font are inferred from the
raster reference.
Required additions are the author field, suggested tags, tag instructions, and
validation/submission states. The demo notice lives on the preview page outside
the modal. The modal is capped at 460px, with a 22px heading, 13px labels, 14px
input text, 38px inputs, and an 88px minimum textarea height. Actions remain side
by side. The modal is centered and scrolls internally only when its content
exceeds the viewport height minus 32px.
