"use client";

import { ArrowLeft, ChevronDown } from "lucide-react";

export default function ReviewerDetailSkeleton() {
  return (
    <div className="w-full flex-1 flex flex-col min-h-0 relative select-none">
      {/* Mobile collapsed header bar placeholder */}
      <div className="md:hidden flex-shrink-0 flex items-center gap-3 px-4 h-12 border border-border bg-surface rounded-xl mb-1">
        <div className="p-2 rounded-lg text-muted/40 flex items-center justify-center min-w-[44px] min-h-[44px]">
          <ArrowLeft className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1 flex flex-col justify-center gap-1.5">
          <div className="flex items-center gap-1.5">
            <div className="h-4 w-28 bg-neutral-200 dark:bg-neutral-800 rounded animate-skeleton-pulse" />
            <div className="h-3.5 w-10 bg-neutral-200 dark:bg-neutral-800 rounded animate-skeleton-pulse" />
          </div>
          <div className="h-2.5 w-32 bg-neutral-200 dark:bg-neutral-800 rounded animate-skeleton-pulse" />
        </div>
        <div className="text-muted/40 p-1">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>

      {/* Reviewer Rating/Summary Section Placeholder (matches height & layout of real section) */}
      <div className="flex-shrink-0 pb-2">
        <div className="relative rounded-2xl border border-border bg-surface p-3.5 flex flex-col items-center text-center shadow-xs">
          {/* Back button (desktop) */}
          <div className="hidden md:inline-flex absolute top-3 left-3 items-center justify-center gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1 text-xs font-bold text-muted/40">
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </div>

          {/* Avatar circle */}
          <div className="w-12 h-12 rounded-full bg-neutral-200 dark:bg-neutral-800 animate-skeleton-pulse mb-1.5" />

          {/* Reviewer name and code */}
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="h-6 w-36 bg-neutral-200 dark:bg-neutral-800 rounded animate-skeleton-pulse" />
            <div className="h-5 w-12 bg-neutral-200 dark:bg-neutral-800 rounded animate-skeleton-pulse" />
          </div>

          {/* Stack chips */}
          <div className="flex justify-center gap-1 mt-1 mb-1.5">
            <div className="h-4 w-12 bg-neutral-200 dark:bg-neutral-800 rounded animate-skeleton-pulse" />
            <div className="h-4 w-16 bg-neutral-200 dark:bg-neutral-800 rounded animate-skeleton-pulse" />
          </div>

          {/* Rating aggregate summary */}
          <div className="flex items-center justify-center gap-2 mt-1 mb-2">
            <div className="h-4.5 w-24 bg-neutral-200 dark:bg-neutral-800 rounded animate-skeleton-pulse" />
            <div className="h-3 w-16 bg-neutral-200 dark:bg-neutral-800 rounded animate-skeleton-pulse" />
          </div>

          {/* Rating active block */}
          <div className="mt-2.5 pt-2 border-t border-border/50 w-full max-w-xs flex flex-col items-center gap-1.5">
            <div className="h-3 w-28 bg-neutral-200 dark:bg-neutral-800 rounded animate-skeleton-pulse mb-1" />
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((idx) => (
                <div
                  key={idx}
                  className="w-6 h-6 rounded-md bg-neutral-200 dark:bg-neutral-800 animate-skeleton-pulse"
                />
              ))}
            </div>
          </div>

          {/* Edit suggest link */}
          <div className="mt-3 pt-3 border-t border-border/50 w-full flex justify-center">
            <div className="h-3.5 w-24 bg-neutral-200 dark:bg-neutral-800 rounded animate-skeleton-pulse" />
          </div>
        </div>
      </div>

      {/* Student experiences feed placeholder */}
      <div className="flex-1 min-h-0 flex flex-col border border-border bg-surface rounded-2xl overflow-hidden">
        {/* Feed Header */}
        <div className="px-3 py-1.5 md:px-4 md:py-2 border-b border-border/60 bg-neutral-50/50 dark:bg-neutral-900/30 flex items-center justify-between flex-shrink-0">
          <h2 className="text-[10px] md:text-xs font-extrabold tracking-wider uppercase text-secondary">
            Student Experiences
          </h2>
          <div className="h-4 w-6 bg-neutral-200 dark:bg-neutral-800 rounded animate-skeleton-pulse" />
        </div>

        {/* Scrollable experience list placeholder */}
        <div className="flex-1 overflow-y-auto w-full scrollbar-none">
          <div className="min-h-full flex flex-col px-3 py-2.5 md:px-4 md:py-3 gap-1.5 md:gap-2">
            {/* Render 4 skeleton experience cards with different content lengths for a premium look */}
            {[
              { w1: "w-28", w2: "w-[85%]", w3: "w-[40%]" },
              { w1: "w-24", w2: "w-[90%]", w3: "w-[75%]" },
              { w1: "w-32", w2: "w-[60%]", w3: "w-0" },
              { w1: "w-20", w2: "w-[80%]", w3: "w-[30%]" }
            ].map((card, idx) => (
              <div
                key={idx}
                className="flex gap-2 items-start p-2 md:p-2.5 rounded-xl border border-border/30 bg-background/20"
              >
                {/* User avatar placeholder */}
                <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-neutral-200 dark:bg-neutral-800 flex-shrink-0 animate-skeleton-pulse" />
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center justify-between">
                    {/* User author name block */}
                    <div className={`h-3 ${card.w1} bg-neutral-200 dark:bg-neutral-800 rounded animate-skeleton-pulse`} />
                    {/* Timestamp block */}
                    <div className="h-2.5 w-8 bg-neutral-200 dark:bg-neutral-800 rounded animate-skeleton-pulse" />
                  </div>
                  {/* Experience content lines */}
                  <div className="space-y-1">
                    <div className={`h-3.5 ${card.w2} bg-neutral-200 dark:bg-neutral-800 rounded animate-skeleton-pulse`} />
                    {card.w3 !== "w-0" && (
                      <div className={`h-3.5 ${card.w3} bg-neutral-200 dark:bg-neutral-800 rounded/90 animate-skeleton-pulse`} />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Experience input/composer placeholder */}
        <div className="border-t border-border/60 bg-surface/95 backdrop-blur-xs px-3 pt-1.5 pb-[calc(6px+env(safe-area-inset-bottom,0px))] flex flex-col gap-1 relative flex-shrink-0 shadow-[0_-1px_2px_rgba(0,0,0,0.03)]">
          <div className="flex gap-2 items-center">
            {/* Input textarea box */}
            <div className="flex-1 h-[38px] rounded-2xl border border-border/60 bg-background/50 animate-skeleton-pulse" />
            {/* Send button circle */}
            <div className="w-9 h-9 rounded-full bg-neutral-200 dark:bg-neutral-800 animate-skeleton-pulse flex-shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
}
