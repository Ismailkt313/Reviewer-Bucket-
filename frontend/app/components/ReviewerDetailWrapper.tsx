"use client";

import { useState } from "react";
import { useViewportHeight } from "@/app/hooks/useViewportHeight";
import ReviewerRatingSection from "./ReviewerRatingSection";
import StudentExperiencesFeed from "./StudentExperiencesFeed";

type ReviewerDetailWrapperProps = {
  reviewer: {
    id: string;
    name: string;
    code: string;
    stacks: string[];
  };
  averageRating: number | null;
  ratingCount: number;
  initialExperiences: {
    id: string;
    content: string;
    createdAt: string;
  }[];
  initialNextCursor: string | null;
  initialHasMore: boolean;
};

export default function ReviewerDetailWrapper({
  reviewer,
  averageRating,
  ratingCount,
  initialExperiences,
  initialNextCursor,
  initialHasMore
}: ReviewerDetailWrapperProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const viewportHeight = useViewportHeight();

  const handleCollapsedChange = (collapsed: boolean) => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setIsCollapsed(collapsed);
    }
  };

  return (
    <div
      id="detail-page-container"
      className="flex flex-col overflow-hidden bg-background text-foreground w-full"
      style={{ height: viewportHeight }}
    >
      <div className="mx-auto max-w-3xl px-4 py-3 flex-1 min-h-0 flex flex-col w-full relative">
        <div className={`transition-all duration-300 ease-in-out origin-top flex-shrink-0 ${isCollapsed ? "max-h-0 opacity-0 -translate-y-4 scale-95 pointer-events-none overflow-hidden pb-0" : "max-h-[350px] opacity-100 translate-y-0 scale-100 pb-4"}`}>
          <ReviewerRatingSection
            reviewerId={reviewer.id}
            reviewerName={reviewer.name}
            reviewerCode={reviewer.code}
            reviewerStacks={reviewer.stacks || []}
            initialAverageRating={averageRating}
            initialRatingCount={ratingCount}
          />
        </div>

        <div className="flex-1 min-h-0 flex flex-col">
          <StudentExperiencesFeed
            key={reviewer.id}
            reviewerId={reviewer.id}
            initialExperiences={initialExperiences}
            initialNextCursor={initialNextCursor}
            initialHasMore={initialHasMore}
            onCollapsedChange={handleCollapsedChange}
          />
        </div>
      </div>
    </div>
  );
}
