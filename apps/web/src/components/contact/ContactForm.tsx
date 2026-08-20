"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { submitContactForm } from "@/server/contact/action";
import { CONTACT_FIELD_NAMES, type ContactResult } from "@/server/contact/schema";

import { Turnstile } from "./Turnstile";

const FIELD_CLASS =
  "rounded-[10px] border-[1.5px] border-line bg-card px-3.5 py-[11px] font-sans text-body-sm text-ink";

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      // The accessible name changes with state, so a screen reader hears "Sending…" rather
      // than a button that silently stopped responding.
      aria-label={pending ? pendingLabel : label}
      aria-disabled={pending}
      className="cursor-pointer rounded-full border-none bg-accent px-[26px] py-3 font-sans text-action font-bold text-bg transition-opacity disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

function FieldError({ id, errors }: { id: string; errors: string[] | undefined }) {
  if (!errors?.length) return null;
  return (
    <p id={id} className="m-0 text-small text-accent">
      {errors[0]}
    </p>
  );
}

export interface ContactFormProps {
  siteKey: string;
  submitLabel: string;
  pendingLabel: string;
  successMessage: string;
  errorMessage: string;
}

export function ContactForm({
  siteKey,
  submitLabel,
  pendingLabel,
  successMessage,
  errorMessage,
}: ContactFormProps) {
  const [state, formAction] = useActionState<ContactResult | null, FormData>(
    submitContactForm,
    null,
  );

  // Once delivered, the form is replaced rather than reset — there is nothing left to do.
  if (state?.status === "success") {
    return (
      <p
        role="status"
        className="mt-11 max-w-[520px] rounded-xl border border-line bg-card px-5 py-4 text-body-sm"
      >
        {successMessage}
      </p>
    );
  }

  const fieldErrors = state?.status === "error" ? state.fieldErrors : undefined;
  const formError =
    state?.status === "error" && !state.fieldErrors ? state.message || errorMessage : null;

  return (
    <form action={formAction} noValidate className="mt-11 grid max-w-[520px] gap-4">
      {formError ? (
        <p role="alert" className="m-0 rounded-xl border border-accent px-4 py-3 text-body-sm">
          {formError}
        </p>
      ) : null}

      <div className="grid gap-1.5">
        <label htmlFor="cf-name" className="text-tag font-bold">
          Name
        </label>
        <input
          id="cf-name"
          name={CONTACT_FIELD_NAMES.name}
          type="text"
          autoComplete="name"
          required
          placeholder="Your name"
          aria-describedby={fieldErrors?.name ? "cf-name-error" : undefined}
          aria-invalid={fieldErrors?.name ? true : undefined}
          className={FIELD_CLASS}
        />
        <FieldError id="cf-name-error" errors={fieldErrors?.name} />
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="cf-email" className="text-tag font-bold">
          Email
        </label>
        <input
          id="cf-email"
          name={CONTACT_FIELD_NAMES.email}
          type="email"
          autoComplete="email"
          required
          placeholder="you@company.com"
          aria-describedby={fieldErrors?.email ? "cf-email-error" : undefined}
          aria-invalid={fieldErrors?.email ? true : undefined}
          className={FIELD_CLASS}
        />
        <FieldError id="cf-email-error" errors={fieldErrors?.email} />
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="cf-message" className="text-tag font-bold">
          Message
        </label>
        <textarea
          id="cf-message"
          name={CONTACT_FIELD_NAMES.message}
          rows={5}
          required
          placeholder="What are we building?"
          aria-describedby={fieldErrors?.message ? "cf-message-error" : undefined}
          aria-invalid={fieldErrors?.message ? true : undefined}
          className={`${FIELD_CLASS} resize-y`}
        />
        <FieldError id="cf-message-error" errors={fieldErrors?.message} />
      </div>

      {/*
        Honeypot. Hidden from sight and from assistive technology, and skipped in the tab
        order, so only an automated filler will ever populate it.
      */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="cf-company">Company</label>
        <input
          id="cf-company"
          name={CONTACT_FIELD_NAMES.honeypot}
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <Turnstile siteKey={siteKey} fieldName={CONTACT_FIELD_NAMES.turnstileToken} />
      <FieldError id="cf-turnstile-error" errors={fieldErrors?.turnstileToken} />

      <div>
        <SubmitButton label={submitLabel} pendingLabel={pendingLabel} />
      </div>
    </form>
  );
}
