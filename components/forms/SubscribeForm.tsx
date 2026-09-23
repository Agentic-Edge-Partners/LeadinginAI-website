"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import { cx } from "@/lib/cx";

type Status = "idle" | "loading" | "success" | "already" | "invalid" | "error" | "unconfigured";

export type SubscribeCopy = {
  buttonLabel: string;
  successMessage: string;
  alreadySubscribedMessage: string;
};

/**
 * The newsletter form. Posts to /api/subscribe (never to the provider
 * directly). All four states the plan requires are visible: success,
 * already-subscribed, invalid email, provider down.
 */
export function SubscribeForm({
  copy,
  source = "site",
  size = "md",
  className,
  autoFocus,
}: {
  copy: SubscribeCopy;
  source?: string;
  size?: "md" | "lg";
  className?: string;
  autoFocus?: boolean;
}) {
  const id = useId();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      setStatus("invalid");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value, source }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        status?: string;
        error?: string;
      };
      if (res.ok && data.ok) {
        setStatus(data.status === "already" ? "already" : "success");
        if (data.status !== "already") setEmail("");
      } else if (data.error === "invalid") setStatus("invalid");
      else if (data.error === "unconfigured") setStatus("unconfigured");
      else setStatus("error");
    } catch {
      setStatus("error");
    }
  };

  const message: Record<Status, string | null> = {
    idle: null,
    loading: null,
    success: copy.successMessage,
    already: copy.alreadySubscribedMessage,
    invalid: "That email address doesn't look right.",
    error: "Something went wrong on our side. Please try again in a minute.",
    unconfigured:
      "The newsletter isn't connected yet. Follow the show on YouTube or Spotify in the meantime.",
  };
  const tone =
    status === "success" || status === "already"
      ? "text-cyan"
      : status === "idle" || status === "loading"
        ? "text-ink-dim"
        : "text-red-300";
  const done = status === "success";

  return (
    <form onSubmit={submit} noValidate className={cx("w-full", className)}>
      <div className={cx("flex flex-col gap-3 sm:flex-row", size === "lg" && "sm:gap-4")}>
        <label htmlFor={id} className="sr-only">
          Email address
        </label>
        <input
          id={id}
          type="email"
          name="email"
          inputMode="email"
          autoComplete="email"
          autoFocus={autoFocus}
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status !== "idle" && status !== "loading") setStatus("idle");
          }}
          placeholder="you@company.com"
          disabled={status === "loading" || done}
          aria-invalid={status === "invalid" || undefined}
          aria-describedby={`${id}-status`}
          className={cx(
            "w-full flex-1 rounded-btn border bg-ground px-4 text-ink placeholder:text-ink-dim focus:border-cyan focus:outline-none disabled:opacity-60",
            size === "lg" ? "h-14 text-base" : "h-11 text-sm",
            status === "invalid" ? "border-red-400" : "border-line-bright",
          )}
        />
        <Button
          type="submit"
          size={size === "lg" ? "lg" : "md"}
          disabled={status === "loading" || done}
          className="shrink-0"
        >
          {status === "loading" ? "Subscribing…" : done ? "Subscribed" : copy.buttonLabel}
        </Button>
      </div>
      <p
        id={`${id}-status`}
        role="status"
        aria-live="polite"
        className={cx("mt-3 min-h-5 text-sm", tone)}
      >
        {message[status]}
      </p>
    </form>
  );
}
