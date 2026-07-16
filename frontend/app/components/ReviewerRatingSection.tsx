"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getApiUrl } from "@/app/utils/api";
import { getAnonymousClientId } from "@/app/utils/anonymous-id";

type LocalRating = {
  reviewerId: string;
  value: number;
  updatedAt: string;
};

type ReviewerRatingSectionProps = {
  reviewerId: string;
  reviewerName: string;
  reviewerCode: string;
  reviewerStacks: string[];
  initialAverageRating: number | null;
  initialRatingCount: number;
};

function StarIcon({ filled, className }: { filled: boolean; className?: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export default function ReviewerRatingSection({
  reviewerId,
  reviewerName,
  reviewerCode,
  reviewerStacks,
  initialAverageRating,
  initialRatingCount
}: ReviewerRatingSectionProps) {
  const [localRating, setLocalRating] = useState<number | undefined>(undefined);
  const [hoverRating, setHoverRating] = useState<number | undefined>(undefined);
  const [averageRating, setAverageRating] = useState<number | null>(initialAverageRating);
  const [ratingCount, setRatingCount] = useState<number>(initialRatingCount);
  const [mounted, setMounted] = useState(false);
  const [showNotice, setShowNotice] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSticky, setIsSticky] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 120);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const raw = localStorage.getItem("reviewerBucket:ratings");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            const found = parsed.find(
              (item: LocalRating) => item && item.reviewerId === reviewerId
            );
            if (
              found &&
              Number.isInteger(found.value) &&
              found.value >= 1 &&
              found.value <= 5
            ) {
              setLocalRating(found.value);
            }
          }
        }
      } catch {
        // Ignore
      }
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, [reviewerId]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleRate = async (value: number) => {
    setErrorMessage("");
    try {
      const clientUuid = getAnonymousClientId();

      const res = await fetch(getApiUrl(`/api/reviewers/${reviewerId}/rating`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          value,
          anonymousClientId: clientUuid
        })
      });

      if (!res.ok) {
        throw new Error("Rating submission failed");
      }

      setLocalRating(value);

      try {
        const raw = localStorage.getItem("reviewerBucket:ratings");
        let list: LocalRating[] = [];
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            list = parsed.filter(
              (item: LocalRating) =>
                item && typeof item === "object" && typeof item.reviewerId === "string"
            );
          }
        }
        const idx = list.findIndex((item) => item.reviewerId === reviewerId);
        if (idx >= 0) {
          list[idx] = {
            reviewerId,
            value,
            updatedAt: new Date().toISOString()
          };
        } else {
          list.push({
            reviewerId,
            value,
            updatedAt: new Date().toISOString()
          });
        }
        localStorage.setItem("reviewerBucket:ratings", JSON.stringify(list));
      } catch {
        // Ignore
      }

      const summaryRes = await fetch(getApiUrl(`/api/reviewers/${reviewerId}/rating-summary`));
      if (summaryRes.ok) {
        const summaryJson = await summaryRes.json();
        if (summaryJson && summaryJson.data) {
          setAverageRating(summaryJson.data.averageRating);
          setRatingCount(summaryJson.data.ratingCount);
        }
      }

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      setShowNotice(true);
      timerRef.current = setTimeout(() => {
        setShowNotice(false);
      }, 2000);
    } catch {
      setErrorMessage("Could not submit rating. Please try again.");
    }
  };

  if (!mounted) {
    return (
      <div className="rounded-xl border border-border bg-surface p-5 flex flex-col items-center gap-4 animate-skeleton-pulse">
        <div className="w-16 h-16 rounded-full bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-6 w-32 bg-neutral-200 dark:bg-neutral-800 rounded" />
        <div className="h-4 w-48 bg-neutral-200 dark:bg-neutral-800 rounded" />
      </div>
    );
  }

  const roundedAvg = averageRating !== null ? Math.round(averageRating) : 0;
  const avatarChar = reviewerName.charAt(0).toUpperCase();

  return (
    <>
      <div className={`md:hidden fixed top-0 left-0 right-0 h-14 bg-surface/95 backdrop-blur border-b border-border z-50 flex items-center px-4 gap-3 transition-all duration-200 ${isSticky ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"}`}>
        <Link href="/" className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-secondary flex items-center justify-center min-w-[44px] min-h-[44px]" aria-label="Back">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-neutral-200 to-neutral-300 dark:from-neutral-800 dark:to-neutral-700 flex items-center justify-center text-xs font-bold text-secondary shadow-xs select-none">
          {avatarChar}
        </div>
        <div className="min-w-0 flex flex-col justify-center">
          <span className="text-xs font-bold text-foreground truncate">{reviewerName}</span>
          <span className="text-[9px] text-muted truncate">{reviewerStacks.join(" • ") || "General"}</span>
        </div>
        <div className="ml-auto flex items-center gap-1 text-xs">
          <span className="text-amber-500">★</span>
          <span className="font-semibold">{averageRating !== null ? averageRating.toFixed(1) : "0.0"}</span>
        </div>
      </div>

      <div className="relative rounded-2xl border border-border bg-surface p-3.5 flex flex-col items-center text-center shadow-xs">
        <Link
          href="/"
          className="absolute top-3 left-3 inline-flex items-center justify-center gap-1.5 rounded-full md:rounded-lg border border-border bg-background p-2.5 md:px-2.5 md:py-1 text-xs font-bold text-secondary transition-colors duration-150 hover:bg-neutral-50 dark:hover:bg-neutral-900 focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-none z-10 min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0"
          aria-label="Back to reviewers"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden md:inline">Back</span>
        </Link>

        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-neutral-200 to-neutral-300 dark:from-neutral-800 dark:to-neutral-700 flex items-center justify-center text-lg font-bold text-secondary shadow-xs select-none mb-1.5">
          {avatarChar}
        </div>

        <div className="flex items-center justify-center gap-2">
          <h1 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
            {reviewerName}
          </h1>
          <span className="inline-flex items-center rounded-md border border-border bg-background px-2 py-0.5 font-mono text-xs font-semibold text-secondary">
            {reviewerCode}
          </span>
        </div>

        <div className="flex flex-wrap justify-center gap-1 mt-1">
          {reviewerStacks.map((stack) => (
            <span
              key={stack}
              className="inline-flex items-center rounded-md bg-neutral-50 dark:bg-neutral-900 border border-border/60 px-1.5 py-0.5 text-[10px] font-mono font-medium text-secondary"
            >
              {stack}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 mt-1.5">
          <div className="flex items-center gap-0.5 text-amber-500" aria-hidden="true">
            {[1, 2, 3, 4, 5].map((num) => (
              <StarIcon key={num} filled={num <= roundedAvg} className="w-3.5 h-3.5" />
            ))}
          </div>
          <span className="text-sm font-bold text-foreground">
            {averageRating !== null ? averageRating.toFixed(1) : "0.0"}
          </span>
          <span className="text-xs text-muted">
            • {ratingCount} {ratingCount === 1 ? "Rating" : "Ratings"}
          </span>
        </div>

        <div className="mt-2.5 pt-2 border-t border-border/50 w-full max-w-xs flex flex-col items-center gap-1.5">
          <div className="flex items-center justify-center gap-1.5 min-h-[16px]">
            <span className="text-[11px] font-bold text-secondary uppercase tracking-wider">
              {localRating !== undefined ? `Your rating: ${localRating} / 5` : "Rate this reviewer"}
            </span>
            {showNotice && (
              <span className="text-[10px] text-accent font-semibold animate-slide-up-fade">
                • Updated
              </span>
            )}
          </div>

          <div className="flex gap-1" role="radiogroup" aria-label="Your rating">
            {[1, 2, 3, 4, 5].map((num) => {
              const activeRating = hoverRating !== undefined ? hoverRating : (localRating ?? 0);
              const isFilled = num <= activeRating;
              return (
                <button
                  key={num}
                  type="button"
                  role="radio"
                  aria-checked={localRating === num}
                  aria-label={`Rate ${num} out of 5`}
                  onMouseEnter={() => setHoverRating(num)}
                  onMouseLeave={() => setHoverRating(undefined)}
                  onClick={() => handleRate(num)}
                  className="rounded-lg p-1.5 transition-colors duration-150 hover:bg-neutral-50 dark:hover:bg-neutral-900 text-amber-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  <StarIcon filled={isFilled} className="w-6 h-6" />
                </button>
              );
            })}
          </div>
          {errorMessage && (
            <p className="text-[11px] text-red-600 dark:text-red-400 font-semibold">{errorMessage}</p>
          )}
        </div>
      </div>
    </>
  );
}
