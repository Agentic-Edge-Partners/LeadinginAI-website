"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Lockup } from "@/components/brand/Logo";
import { Container } from "./Container";
import { Button } from "@/components/ui/Button";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { useSubscribeModal } from "@/components/forms/SubscribeProvider";
import { cx } from "@/lib/cx";
import { EASE } from "@/lib/motion";

export const NAV = [
  { href: "/episodes", label: "Episodes" },
  { href: "/guests", label: "Guests" },
  { href: "/about", label: "About" },
] as const;

export function Header() {
  const pathname = usePathname();
  const { open } = useSubscribeModal();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    const raf = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Close the mobile menu after navigation.
  useEffect(() => {
    const raf = requestAnimationFrame(() => setMenuOpen(false));
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      className={cx(
        "sticky top-0 z-50 border-b transition-colors duration-300",
        scrolled || menuOpen
          ? "border-line bg-ground/80 backdrop-blur-md"
          : "border-transparent bg-transparent",
      )}
    >
      <Container
        as="nav"
        className="flex h-16 items-center justify-between gap-6"
        aria-label="Primary"
      >
        <Link
          href="/"
          className="flex shrink-0 items-center rounded-sm"
          aria-label="Leading in AI — home"
        >
          <Lockup className="h-5 sm:h-6" />
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <li key={item.href}>
              <MagneticButton>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cx(
                    "inline-flex rounded-btn px-3 py-2 text-sm font-medium transition-colors",
                    isActive(item.href) ? "text-ink" : "text-ink-muted hover:text-ink",
                  )}
                >
                  {item.label}
                </Link>
              </MagneticButton>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <MagneticButton>
            <Button size="sm" onClick={open}>
              Subscribe
            </Button>
          </MagneticButton>
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-btn text-ink-muted hover:text-ink md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              {menuOpen ? (
                <>
                  <path d="M6 6l12 12" />
                  <path d="M18 6L6 18" />
                </>
              ) : (
                <>
                  <path d="M4 7h16" />
                  <path d="M4 12h16" />
                  <path d="M4 17h16" />
                </>
              )}
            </svg>
          </button>
        </div>
      </Container>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="border-t border-line md:hidden"
          >
            <Container>
              <ul className="flex flex-col py-3">
                {NAV.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={isActive(item.href) ? "page" : undefined}
                      className={cx(
                        "block rounded-btn px-2 py-3 text-lg font-medium",
                        isActive(item.href) ? "text-cyan" : "text-ink",
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
