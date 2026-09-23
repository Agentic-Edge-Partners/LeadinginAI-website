"use client";

import { SearchInput } from "./SearchInput";
import { cx } from "@/lib/cx";

export type FilterOption = { value: string; label: string };
export type Filters = { topic: string; guest: string; season: string; q: string };

/** Topic · guest · season selects plus search. Native selects: accessible and small. */
export function FilterBar({
  filters,
  onChange,
  topics,
  guests,
  seasons,
  resultCount,
}: {
  filters: Filters;
  onChange: (next: Filters) => void;
  topics: FilterOption[];
  guests: FilterOption[];
  seasons: FilterOption[];
  resultCount: number;
}) {
  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });
  const dirty = filters.topic || filters.guest || filters.season || filters.q;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 md:grid-cols-12">
        <SearchInput value={filters.q} onChange={(q) => set({ q })} className="md:col-span-5" />
        <Select
          label="Topic"
          value={filters.topic}
          onChange={(topic) => set({ topic })}
          options={topics}
          className="md:col-span-3"
        />
        <Select
          label="Guest"
          value={filters.guest}
          onChange={(guest) => set({ guest })}
          options={guests}
          className="md:col-span-3"
        />
        {seasons.length > 1 && (
          <Select
            label="Season"
            value={filters.season}
            onChange={(season) => set({ season })}
            options={seasons}
            className="md:col-span-1"
          />
        )}
      </div>
      <div className="flex items-center justify-between gap-4">
        <p className="meta text-ink-dim" aria-live="polite">
          {resultCount} {resultCount === 1 ? "episode" : "episodes"}
          {filters.q && <span className="tracking-normal normal-case"> for “{filters.q}”</span>}
        </p>
        {dirty && (
          <button
            type="button"
            onClick={() => onChange({ topic: "", guest: "", season: "", q: "" })}
            className="meta text-cyan hover:text-ink"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: FilterOption[];
  className?: string;
}) {
  return (
    <label className={cx("relative block", className)}>
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full appearance-none rounded-btn border border-line-bright bg-surface pr-9 pl-3.5 text-sm text-ink focus:border-cyan focus:outline-none"
      >
        <option value="">All {label.toLowerCase()}s</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-ink-dim"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </label>
  );
}
