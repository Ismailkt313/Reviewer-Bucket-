"use client";

import { useState, useMemo } from "react";
import type { Reviewer } from "@/app/data/reviewers";
import ReviewerRow from "./ReviewerRow";

type ReviewerExplorerProps = {
  reviewers: Reviewer[];
};

function normalizeQuery(input: string): string {
  return input.toLowerCase().replace(/\s+/g, "").trim();
}

function matchesReviewer(reviewer: Reviewer, query: string): boolean {
  if (!query) return true;

  const normalized = normalizeQuery(query);
  const normalizedName = normalizeQuery(reviewer.name);
  const normalizedCode = normalizeQuery(reviewer.code);
  const codeNumbers = reviewer.code.replace(/\D/g, "");

  return (
    normalizedName.includes(normalized) ||
    normalizedCode.includes(normalized) ||
    codeNumbers === normalized
  );
}

export default function ReviewerExplorer({ reviewers }: ReviewerExplorerProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () => reviewers.filter((r) => matchesReviewer(r, query)),
    [reviewers, query]
  );

  return (
    <>
      <section className="px-4 pb-12 pt-10 sm:px-6 sm:pt-14">
        <div className="mx-auto max-w-5xl">
          <div className="max-w-xl">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Find Your Brocamp Reviewer by Code
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400 sm:text-base">
              Search the reviewer code shown during your review and quickly find the matching
              reviewer.
            </p>
          </div>

          <div className="relative mt-6 max-w-xl">
            <label htmlFor="reviewer-search" className="sr-only">
              Search by code or reviewer name
            </label>
            <div className="relative">
              <svg
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                id="reviewer-search"
                type="text"
                role="searchbox"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by code or reviewer name"
                autoComplete="off"
                className="h-12 w-full rounded-lg border border-neutral-200 bg-background pl-10 pr-10 text-sm text-foreground placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:placeholder:text-neutral-500 dark:focus:border-neutral-500 dark:focus:ring-neutral-700 sm:h-11"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-neutral-400 transition-colors hover:text-neutral-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground dark:hover:text-neutral-300"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <line x1="4" y1="4" x2="12" y2="12" />
                    <line x1="12" y1="4" x2="4" y2="12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section id="reviewers" aria-label="Reviewer directory" className="px-4 pb-16 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-baseline gap-3">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Reviewers
            </h2>
            <span className="text-sm text-neutral-400 dark:text-neutral-500">
              {filtered.length}
            </span>
          </div>

          {filtered.length > 0 ? (
            <div
              role="list"
              className="mt-4 overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800"
            >
              <div className="grid grid-cols-1 md:grid-cols-2">
                {filtered.map((reviewer) => (
                  <ReviewerRow key={reviewer.id} reviewer={reviewer} />
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-8 text-center">
              <p className="text-sm font-medium text-foreground">
                No reviewer found for &ldquo;{query}&rdquo;
              </p>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                Check the code or try searching without spaces.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
