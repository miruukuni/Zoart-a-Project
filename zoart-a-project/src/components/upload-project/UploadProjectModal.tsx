"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent } from "react";
import type { CreateProjectInput } from "@/types/project";


export type UploadProjectModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: CreateProjectInput) => Promise<void>;
  /** Identifies a callback that only simulates submission. */
  demo?: boolean;
};

type Field = keyof CreateProjectInput;
type Errors = Partial<Record<Field, string>>;
const suggestions = ["React", "Web Dev", "Design", "AI / ML", "Mobile"];
const chipColors = [
  "bg-[var(--yellow-orange,#FFB100)]",
  "bg-[var(--bubblegum-pink,#F194B4)]",
  "bg-[var(--sea-teal,#00ADA5)]",
  "bg-[var(--coral-red,#CC404A)]",
];
const inputClass =
  "w-full rounded-md border-2 border-[#141414] bg-white px-3 py-2 text-sm leading-[18px] text-[#141414] placeholder:text-[#484848] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sea-teal,#00ADA5)]";
const buttonClass =
  "min-h-10 rounded-md border-[3px] border-[#141414] px-3 py-2 text-sm font-bold leading-[18px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sea-teal,#00ADA5)] disabled:cursor-wait disabled:opacity-60";

export default function UploadProjectModal(props: UploadProjectModalProps) {
  // A new opening starts a fresh form; a failed submission keeps this form mounted.
  return props.open ? <OpenUploadProjectModal {...props} /> : null;
}

function OpenUploadProjectModal({
  onClose,
  onSubmit,
  demo = false,
}: UploadProjectModalProps) {
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const tagInput = useRef<HTMLInputElement>(null);
  const successPanel = useRef<HTMLDivElement>(null);
  const pending = useRef(false);
  const active = useRef(false);
  const [values, setValues] = useState<CreateProjectInput>({
    title: "",
    author: "",
    description: "",
    contact_info: "",
    tags: [],
  });
  const [customTag, setCustomTag] = useState("");
  const [tagPickerOpen, setTagPickerOpen] = useState(false);
  const [activeTagIndex, setActiveTagIndex] = useState(-1);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<
    "idle" | "pending" | "success" | "error"
  >("idle");
  const tagQuery = customTag.trim();
  const tagChoices = suggestions
    .filter(
      (tag) =>
        !values.tags.some(
          (selected) => selected.toLowerCase() === tag.toLowerCase(),
        ),
    )
    .filter((tag) => tag.toLowerCase().includes(tagQuery.toLowerCase()))
    .map((tag) => ({ value: tag, label: tag }));
  if (
    tagQuery &&
    ![...suggestions, ...values.tags].some(
      (tag) => tag.toLowerCase() === tagQuery.toLowerCase(),
    )
  ) {
    tagChoices.push({ value: tagQuery, label: `Create “${tagQuery}”` });
  }
  const showTagPicker = tagPickerOpen && status !== "pending";
  const activeTag =
    activeTagIndex >= 0 ? tagChoices[activeTagIndex] : undefined;

  useEffect(() => {
    const element = dialog.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    active.current = true;
    element?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      active.current = false;
      element?.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected)
        previousFocus.focus();
    };
  }, []);

  useEffect(() => {
    if (status === "success") successPanel.current?.focus();
  }, [status]);

  function update(field: Exclude<Field, "tags">, value: string) {
    setValues((previous) => ({ ...previous, [field]: value }));
    if (value.trim())
      setErrors((previous) => ({ ...previous, [field]: undefined }));
    if (status === "error") setStatus("idle");
  }

  function addTag(value: string) {
    const tag = value.trim();
    if (!tag) return;
    setValues((previous) =>
      previous.tags.some((item) => item.toLowerCase() === tag.toLowerCase())
        ? previous
        : { ...previous, tags: [...previous.tags, tag] },
    );
    setCustomTag("");
    setActiveTagIndex(-1);
    setTagPickerOpen(false);
    setErrors((previous) => ({ ...previous, tags: undefined }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current || status === "success") return;
    const input: CreateProjectInput = {
      title: values.title.trim(),
      author: values.author.trim(),
      description: values.description.trim(),
      contact_info: values.contact_info.trim(),
      tags: [...values.tags],
    };
    const nextErrors: Errors = {};
    if (!input.title) nextErrors.title = "Enter a project title.";
    if (!input.author) nextErrors.author = "Enter your name.";
    if (!input.tags.length) nextErrors.tags = "Add at least one tag.";
    if (!input.description) nextErrors.description = "Describe your project.";
    if (!input.contact_info)
      nextErrors.contact_info = "Enter an email address or contact handle.";
    setErrors(nextErrors);
    const firstError = Object.keys(nextErrors)[0];
    if (firstError) {
      form.current
        ?.querySelector<HTMLElement>(`[name="${firstError}"]`)
        ?.focus();
      return;
    }
    pending.current = true;
    setStatus("pending");
    try {
      await onSubmit(input);
      if (active.current) setStatus("success");
    } catch {
      if (active.current) setStatus("error");
    } finally {
      pending.current = false;
    }
  }

  function error(field: Field) {
    return errors[field] ? (
      <p
        id={`${id}-${field}-error`}
        className="mt-1 text-xs font-bold text-[var(--coral-red,#CC404A)]"
        role="alert"
      >
        {errors[field]}
      </p>
    ) : null;
  }

  function textField(
    field: "title" | "author" | "contact_info",
    label: string,
    placeholder: string,
  ) {
    return (
      <div>
        <label
          htmlFor={`${id}-${field}`}
          className="mb-1 block text-[13px] font-bold leading-[18px]"
        >
          {label} *
        </label>
        <input
          id={`${id}-${field}`}
          name={field}
          required
          autoComplete={field === "author" ? "name" : "off"}
          value={values[field]}
          onChange={(event) => update(field, event.target.value)}
          placeholder={placeholder}
          className={inputClass}
          aria-invalid={!!errors[field]}
          aria-describedby={
            [
              errors[field] ? `${id}-${field}-error` : "",
              field === "contact_info" ? `${id}-contact-note` : "",
            ]
              .filter(Boolean)
              .join(" ") || undefined
          }
        />
        {error(field)}
      </div>
    );
  }

  return (
    <dialog
      ref={dialog}
      aria-labelledby={`${id}-heading`}
      aria-describedby={`${id}-intro`}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const controls = Array.from(
          event.currentTarget.querySelectorAll<HTMLElement>(
            'button, input, textarea, select, a[href], [tabindex]:not([tabindex="-1"])',
          ),
        ).filter(
          (element) =>
            !element.matches(":disabled") &&
            element.getClientRects().length > 0,
        );
        const first = controls[0];
        const last = controls[controls.length - 1];
        const focusIsOutsideControls = !controls.includes(
          document.activeElement as HTMLElement,
        );
        if (
          event.shiftKey &&
          (document.activeElement === first || focusIsOutsideControls)
        ) {
          event.preventDefault();
          last?.focus();
        } else if (
          !event.shiftKey &&
          (document.activeElement === last || focusIsOutsideControls)
        ) {
          event.preventDefault();
          first?.focus();
        }
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < bounds.left ||
          event.clientX > bounds.right ||
          event.clientY < bounds.top ||
          event.clientY > bounds.bottom
        )
          onClose();
      }}
      className="m-auto max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] max-w-[460px] overflow-y-auto overscroll-contain rounded-[10px] border-4 border-[#141414] bg-[#ffebc4] p-0 font-[Arial,Helvetica,sans-serif] text-[#141414] shadow-[6px_6px_0_rgba(0,0,0,0.3)] backdrop:bg-black/60"
    >
      <header className="flex items-center justify-between gap-3 bg-[var(--sea-teal,#00ADA5)] px-4 py-2">
        <p className="text-xs font-bold">ZOT A PROJECT / NEW PROJECT</p>
        <button
          type="button"
          aria-label="Close Upload Project"
          onClick={onClose}
          className="flex size-7 shrink-0 items-center justify-center rounded-md border-[3px] border-[#141414] bg-[#ffebc4] text-xl font-bold leading-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
        >
          ×
        </button>
      </header>
      <div className="p-4 sm:p-5">
        <h2
          id={`${id}-heading`}
          className="text-[22px] font-bold leading-tight"
        >
          Find your next teammate.
        </h2>
        <p
          id={`${id}-intro`}
          className="mb-3 mt-1.5 text-[13px] leading-[18px]"
        >
          Share your project and find people to build with.
        </p>
        {status === "success" ? (
          <div
            ref={successPanel}
            tabIndex={-1}
            role="status"
            className="space-y-3 rounded-md border-[3px] border-[#141414] bg-white p-4"
          >
            <h3 className="text-xl font-bold">
              {demo ? "Demo submission complete!" : "Submission complete!"}
            </h3>
            <p className="text-sm">
              {demo
                ? "The demo callback received your project. No database write occurred."
                : "Your submission callback completed successfully."}
            </p>
            <button
              type="button"
              onClick={onClose}
              className={`${buttonClass} bg-[var(--sea-teal,#00ADA5)]`}
            >
              Done
            </button>
          </div>
        ) : (
          <form
            ref={form}
            onSubmit={submit}
            noValidate
            aria-busy={status === "pending"}
          >
            <fieldset
              disabled={status === "pending"}
              className="min-w-0 space-y-2.5 disabled:opacity-70"
            >
              <legend className="sr-only">Project details</legend>
              {textField("title", "Project title", "Campus Study Finder")}
              {textField("author", "Author / Your name", "Alex Anteater")}
              <div
                className="relative"
                onBlur={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget))
                    setTagPickerOpen(false);
                }}
              >
                <label
                  htmlFor={`${id}-tags`}
                  className="mb-1 block text-[13px] font-bold leading-[18px]"
                >
                  Tags *
                </label>
                <div className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-md border-2 border-[#141414] bg-white px-2 py-1">
                  {values.tags.map((tag, index) => (
                    <button
                      type="button"
                      key={tag.toLowerCase()}
                      onClick={() =>
                        setValues((previous) => ({
                          ...previous,
                          tags: previous.tags.filter((item) => item !== tag),
                        }))
                      }
                      aria-label={`Remove ${tag} tag`}
                      className={`${chipColors[index % chipColors.length]} max-w-full break-words rounded border-2 border-[#141414] px-2 py-1 text-xs font-bold leading-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sea-teal,#00ADA5)]`}
                    >
                      {tag} <span aria-hidden="true">×</span>
                    </button>
                  ))}
                  <input
                    ref={tagInput}
                    id={`${id}-tags`}
                    name="tags"
                    role="combobox"
                    autoComplete="off"
                    aria-expanded={showTagPicker}
                    aria-autocomplete="list"
                    aria-controls={
                      showTagPicker ? `${id}-tag-options` : undefined
                    }
                    aria-activedescendant={
                      showTagPicker && activeTag
                        ? `${id}-tag-option-${activeTagIndex}`
                        : undefined
                    }
                    value={customTag}
                    onChange={(event) => {
                      setCustomTag(event.target.value);
                      setActiveTagIndex(-1);
                      setTagPickerOpen(true);
                    }}
                    onFocus={() => setTagPickerOpen(true)}
                    onClick={() => setTagPickerOpen(true)}
                    onKeyDown={(event) => {
                      if (event.nativeEvent.isComposing) return;
                      if (
                        event.key === "ArrowDown" ||
                        event.key === "ArrowUp"
                      ) {
                        event.preventDefault();
                        setTagPickerOpen(true);
                        const direction = event.key === "ArrowDown" ? 1 : -1;
                        setActiveTagIndex((previous) =>
                          !tagChoices.length
                            ? -1
                            : previous < 0
                              ? direction === 1
                                ? 0
                                : tagChoices.length - 1
                              : (previous + direction + tagChoices.length) %
                                tagChoices.length,
                        );
                      } else if (event.key === "Enter") {
                        event.preventDefault();
                        addTag(
                          showTagPicker && activeTag
                            ? activeTag.value
                            : customTag,
                        );
                      } else if (event.key === "Escape" && showTagPicker) {
                        event.preventDefault();
                        event.stopPropagation();
                        setTagPickerOpen(false);
                        setActiveTagIndex(-1);
                      }
                    }}
                    placeholder="+ Add tag"
                    aria-invalid={!!errors.tags}
                    aria-describedby={`${id}-tag-help${errors.tags ? ` ${id}-tags-error` : ""}`}
                    className="min-w-0 flex-1 basis-20 rounded px-1 py-1 text-sm leading-[18px] placeholder:text-[#555] focus-visible:outline-2 focus-visible:outline-[var(--sea-teal,#00ADA5)]"
                  />
                </div>
                <p id={`${id}-tag-help`} className="sr-only">
                  Use Up and Down arrows to choose a suggestion, Enter to select
                  or create a tag, and Escape to close suggestions.
                </p>
                {showTagPicker && (
                  <div
                    id={`${id}-tag-options`}
                    role="listbox"
                    aria-label="Suggested tags"
                    className="absolute inset-x-0 top-full z-10 mt-1 max-h-44 overflow-y-auto rounded-md border-2 border-[#141414] bg-[#ffebc4] p-1 shadow-[3px_3px_0_#141414]"
                  >
                    {tagChoices.length ? (
                      tagChoices.map((choice, index) => (
                        <div
                          key={choice.value}
                          id={`${id}-tag-option-${index}`}
                          role="option"
                          aria-selected={index === activeTagIndex}
                          onMouseDown={(event) => event.preventDefault()}
                          onMouseMove={() => setActiveTagIndex(index)}
                          onClick={() => addTag(choice.value)}
                          className={`cursor-pointer rounded px-2 py-1.5 text-xs ${index === activeTagIndex ? "bg-[var(--sea-teal,#00ADA5)] font-bold" : "hover:bg-white"}`}
                        >
                          {choice.label}
                        </div>
                      ))
                    ) : (
                      <p className="px-2 py-1.5 text-xs" role="status">
                        {tagQuery
                          ? "This tag is already selected."
                          : "All suggestions selected. Type a custom tag."}
                      </p>
                    )}
                  </div>
                )}
                {error("tags")}
              </div>
              <div>
                <label
                  htmlFor={`${id}-description`}
                  className="mb-1 block text-[13px] font-bold leading-[18px]"
                >
                  Project description *
                </label>
                <textarea
                  id={`${id}-description`}
                  name="description"
                  required
                  value={values.description}
                  onChange={(event) =>
                    update("description", event.target.value)
                  }
                  placeholder="A map of open study spaces at UCI. Looking for someone to help build the frontend."
                  aria-invalid={!!errors.description}
                  aria-describedby={
                    errors.description ? `${id}-description-error` : undefined
                  }
                  className={`${inputClass} block min-h-[88px] resize-y`}
                />
                {error("description")}
              </div>
              <div>
                {textField("contact_info", "Contact info", "hello@uci.edu")}
                <p
                  id={`${id}-contact-note`}
                  className="mt-2 text-[11px] leading-4"
                >
                  This contact info will be visible on your project.
                </p>
              </div>
            </fieldset>
            {status === "error" && (
              <p
                role="alert"
                className="mt-3 rounded-md border-2 border-[var(--coral-red,#CC404A)] bg-white p-3 text-xs font-bold text-[var(--coral-red,#CC404A)]"
              >
                {demo
                  ? "The demo callback failed."
                  : "The submission callback failed."}{" "}
                Your input is still here. Please try again.
              </p>
            )}
            <p role="status" className="sr-only">
              {status === "pending" ? "Submitting project. Please wait." : ""}
            </p>
            <div className="mt-4 flex items-stretch gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className={`${buttonClass} w-[30%] shrink-0 bg-white`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={status === "pending"}
                className={`${buttonClass} flex-1 bg-[var(--sea-teal,#00ADA5)]`}
              >
                {status === "pending" ? "Submitting…" : "Create project →"}
              </button>
            </div>
          </form>
        )}
      </div>
    </dialog>
  );
}
