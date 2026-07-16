import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/app/components/Header";
import ReviewerDetailWrapper from "@/app/components/ReviewerDetailWrapper";
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
    // Ignore
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
    // Ignore
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
    // Ignore
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
    // Ignore
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
    // Ignore
  }

  return (
    <div className="flex flex-col h-dvh overflow-hidden bg-background text-foreground">
      <div className="flex-shrink-0">
        <Header />
      </div>
      <main className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <ReviewerDetailWrapper
          reviewer={reviewer}
          averageRating={averageRating}
          ratingCount={ratingCount}
          initialExperiences={initialExperiences}
          initialNextCursor={initialNextCursor}
          initialHasMore={initialHasMore}
        />
      </main>
    </div>
  );
}
