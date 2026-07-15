import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import ReviewerRatingSection from "@/app/components/ReviewerRatingSection";
import StudentExperiencesFeed from "@/app/components/StudentExperiencesFeed";
import { getApiUrl } from "@/app/utils/api";

type Props = {
  params: Promise<{ slug: string }>;
};

type BackendReviewer = {
  id: string;
  name: string;
  code: string;
  slug: string;
  stacks: string[];
};

export async function generateStaticParams() {
  try {
    const res = await fetch(getApiUrl("/api/reviewers"));
    if (res.ok) {
      const json = await res.json();
      if (json && Array.isArray(json.data)) {
        return json.data.map((r: { slug: string }) => ({
          slug: r.slug
        }));
      }
    }
  } catch {
    // Return empty list
  }
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await fetch(getApiUrl(`/api/reviewers/${slug}`));
    if (res.ok) {
      const json = await res.json();
      if (json && json.data) {
        const reviewer: BackendReviewer = json.data;
        return {
          title: `${reviewer.name} (${reviewer.code}) | Reviewer Bucket`,
          description: `Lookup reviewer codes and details for Brocamp and Brototype reviewer ${reviewer.name} (${reviewer.code}) on Reviewer Bucket.`
        };
      }
    }
  } catch {
    // Fall back to default
  }
  return {
    title: "Reviewer Details | Reviewer Bucket"
  };
}

export default async function ReviewerDetailPage({ params }: Props) {
  const { slug } = await params;

  let reviewer: BackendReviewer | null = null;
  try {
    const res = await fetch(getApiUrl(`/api/reviewers/${slug}`), { cache: "no-store" });
    if (res.ok) {
      const json = await res.json();
      if (json && json.data) {
        reviewer = json.data;
      }
    }
  } catch {
    // Fall back to null
  }

  if (!reviewer) {
    notFound();
  }

  let averageRating: number | null = null;
  let ratingCount = 0;
  try {
    const ratingRes = await fetch(getApiUrl(`/api/reviewers/${reviewer.id}/rating-summary`), {
      cache: "no-store"
    });
    if (ratingRes.ok) {
      const ratingJson = await ratingRes.json();
      if (ratingJson && ratingJson.data) {
        averageRating = ratingJson.data.averageRating;
        ratingCount = ratingJson.data.ratingCount;
      }
    }
  } catch {
    // Fall back to defaults
  }

  type BackendExperience = {
    id: string;
    content: string;
    createdAt: string;
  };

  let initialExperiences: BackendExperience[] = [];
  let initialNextCursor: string | null = null;
  let initialHasMore = false;
  try {
    const expRes = await fetch(getApiUrl(`/api/reviewers/${reviewer.id}/experiences`), {
      cache: "no-store"
    });
    if (expRes.ok) {
      const expJson = await expRes.json();
      if (expJson && expJson.data) {
        initialExperiences = expJson.data.experiences || [];
        initialNextCursor = expJson.data.nextCursor || null;
        initialHasMore = expJson.data.hasMore || false;
      }
    }
  } catch {
    // Fall back to empty
  }

  return (
    <>
      <Header />
      <main className="flex-1 bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-secondary transition-colors duration-150 hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:outline-none dark:hover:bg-neutral-800"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back to reviewers
          </Link>
        </div>

        <div className="mx-auto max-w-3xl px-4 pb-20 pt-2 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 border-b border-border pb-6">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              {reviewer.name}
            </h1>
            <span className="inline-flex items-center rounded-md border border-border bg-surface px-3 py-1 font-mono text-sm font-medium text-secondary">
              {reviewer.code}
            </span>
          </div>

          <div className="mt-8 flex flex-col gap-6">
            {reviewer.stacks && reviewer.stacks.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="rounded-xl border border-border bg-surface p-5">
                  <span className="text-xs font-semibold tracking-wider text-muted uppercase">
                    Stacks
                  </span>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {reviewer.stacks.map((stack) => (
                      <span
                        key={stack}
                        className="inline-flex items-center rounded-md bg-background border border-border px-2 py-0.5 font-mono text-xs font-medium text-secondary"
                      >
                        {stack}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-surface p-6 text-center">
                <p className="text-sm text-secondary">
                  Reviewer information is being added.
                </p>
              </div>
            )}

            <ReviewerRatingSection
              reviewerId={reviewer.id}
              initialAverageRating={averageRating}
              initialRatingCount={ratingCount}
            />

            <div className="border-t border-border pt-8 mt-2">
              <StudentExperiencesFeed
                reviewerId={reviewer.id}
                initialExperiences={initialExperiences}
                initialNextCursor={initialNextCursor}
                initialHasMore={initialHasMore}
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
