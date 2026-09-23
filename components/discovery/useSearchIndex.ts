"use client";

import { useEffect, useRef, useState } from "react";
import MiniSearch from "minisearch";
import { searchOptions, type SearchDoc } from "@/lib/search-options";

/**
 * Lazily loads the prebuilt MiniSearch index (/search-index.json) the first
 * time a query is typed. Returns null until it is ready so callers can fall
 * back to a simple substring match in the meantime.
 */
export function useSearchIndex(active: boolean) {
  const [index, setIndex] = useState<MiniSearch<SearchDoc> | null>(null);
  const loading = useRef(false);

  useEffect(() => {
    if (!active || index || loading.current) return;
    loading.current = true;
    fetch("/search-index.json")
      .then((r) => r.json())
      .then((json) => setIndex(MiniSearch.loadJS(json, searchOptions)))
      .catch(() => {
        loading.current = false;
      });
  }, [active, index]);

  return index;
}
