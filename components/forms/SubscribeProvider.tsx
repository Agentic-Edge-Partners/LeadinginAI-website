"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { SubscribeForm, type SubscribeCopy } from "./SubscribeForm";

type Ctx = { open: () => void; close: () => void; isOpen: boolean };
const SubscribeContext = createContext<Ctx | null>(null);

/**
 * Global subscribe modal, opened from the header CTA anywhere on the site.
 * Copy comes from content/site.json via the root layout.
 */
export function SubscribeProvider({
  children,
  headline,
  subheadline,
  copy,
}: {
  children: React.ReactNode;
  headline: string;
  subheadline: string;
  copy: SubscribeCopy;
}) {
  const [isOpen, setOpen] = useState(false);
  const open = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);
  const value = useMemo(() => ({ open, close, isOpen }), [open, close, isOpen]);
  return (
    <SubscribeContext.Provider value={value}>
      {children}
      <Modal open={isOpen} onClose={close} title={headline}>
        <p className="text-ink-muted">{subheadline}</p>
        <div className="mt-6">
          <SubscribeForm copy={copy} source="modal" autoFocus />
        </div>
      </Modal>
    </SubscribeContext.Provider>
  );
}

export function useSubscribeModal(): Ctx {
  const ctx = useContext(SubscribeContext);
  if (!ctx) throw new Error("useSubscribeModal must be used inside <SubscribeProvider>");
  return ctx;
}
