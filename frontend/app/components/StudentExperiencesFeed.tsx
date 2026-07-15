"use client";

import { useEffect, useRef, useState } from "react";
import { getApiUrl } from "@/app/utils/api";

type StudentExperience = {
  id: string;
  content: string;
  createdAt: string;
};

type StudentExperiencesFeedProps = {
  reviewerId: string;
  initialExperiences: StudentExperience[];
  initialNextCursor: string | null;
  initialHasMore: boolean;
};

function formatMonthYear(dateString: string): string {
  const date = new Date(dateString);
  return isNaN(date.getTime())
    ? "Date unknown"
    : date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
        timeZone: "UTC"
      });
}

export default function StudentExperiencesFeed({
  reviewerId,
  initialExperiences,
  initialNextCursor,
  initialHasMore
}: StudentExperiencesFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [experiencesList, setExperiencesList] = useState<StudentExperience[]>(initialExperiences);
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor);
  const [hasMore, setHasMore] = useState<boolean>(initialHasMore);
  const [inputText, setInputText] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  const handleLoadMore = async () => {
    if (isLoadingMore || !nextCursor) return;
    setIsLoadingMore(true);

    try {
      const url = getApiUrl(`/api/reviewers/${reviewerId}/experiences?limit=20&cursor=${nextCursor}`);
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json && json.data) {
          const fetched: StudentExperience[] = json.data.experiences || [];
          setExperiencesList((prev) => [...fetched, ...prev]);
          setNextCursor(json.data.nextCursor || null);
          setHasMore(json.data.hasMore || false);
        }
      }
    } catch {
      // Ignore defensively
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleSubmit = async (e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (isSubmitting) return;

    const trimmed = inputText.trim();

    if (trimmed.length < 2) {
      setError("Please write at least 2 characters.");
      return;
    }

    if (trimmed.length > 1000) {
      setError("Written experience cannot exceed 1000 characters.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSubmitSuccess(false);

    try {
      const res = await fetch(getApiUrl(`/api/reviewers/${reviewerId}/experiences`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          content: trimmed
        })
      });

      if (!res.ok) {
        throw new Error("Submission failed");
      }

      setInputText("");
      setSubmitSuccess(true);
      const timer = setTimeout(() => {
        setSubmitSuccess(false);
      }, 4000);
      return () => clearTimeout(timer);
    } catch {
      setError("Failed to submit experience. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Student Experiences
        </h2>
        <span className="inline-flex items-center rounded-full bg-neutral-100 dark:bg-neutral-800 px-2.5 py-0.5 text-xs font-semibold text-secondary">
          {experiencesList.length}
        </span>
      </div>

      <div className="border border-border bg-surface rounded-xl flex flex-col overflow-hidden">
        <div
          ref={scrollRef}
          className="overflow-y-auto p-4 sm:p-5 flex flex-col gap-4 max-h-[380px] sm:max-h-[480px] scroll-smooth"
        >
          {hasMore && (
            <div className="flex justify-center pb-2 border-b border-border/40">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="text-[11px] text-secondary font-semibold px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                {isLoadingMore ? "Loading..." : "Load older experiences"}
              </button>
            </div>
          )}

          {experiencesList.length > 0 ? (
            experiencesList.map((exp, idx) => (
              <div key={exp.id}>
                {idx > 0 && <div className="border-t border-border/60 my-4" />}
                <div className="flex flex-col gap-2">
                  <p className="text-sm leading-relaxed text-secondary whitespace-pre-line">
                    {exp.content}
                  </p>
                  <div className="flex justify-end text-[11px] text-muted font-medium mt-0.5">
                    <span>{formatMonthYear(exp.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-sm text-secondary">
              No student experiences yet.
            </div>
          )}
        </div>

        <div className="border-t border-border bg-background p-4 flex flex-col gap-3">
          <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
            <label htmlFor="feed-input" className="sr-only">
              Share your experience
            </label>
            <textarea
              id="feed-input"
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                setError("");
              }}
              onKeyDown={handleKeyDown}
              placeholder="Share your experience..."
              maxLength={1000}
              rows={2}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-neutral-400 focus:ring-2 focus:ring-focus/15 focus:outline-none dark:focus:border-neutral-500 resize-none transition-colors duration-150"
            />

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <span className="text-[10px] text-muted leading-tight">
                Posted anonymously. Avoid including identifying information.
              </span>
              <div className="flex items-center justify-end gap-3 self-end sm:self-auto">
                <span className="text-[10px] text-muted font-medium font-mono">
                  {inputText.length} / 1000
                </span>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-8 px-4 rounded-lg bg-accent text-background text-xs font-bold border border-accent hover:opacity-90 transition-opacity duration-150 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 disabled:opacity-50"
                >
                  {isSubmitting ? "Posting..." : "Post"}
                </button>
              </div>
            </div>
            {submitSuccess && (
              <p className="text-xs text-green-600 dark:text-green-400 font-semibold">
                Experience submitted for review.
              </p>
            )}
            {error && (
              <p className="text-xs text-red-600 dark:text-red-400 font-semibold">{error}</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
