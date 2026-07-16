import Header from "@/app/components/Header";
import ReviewerDetailSkeleton from "@/app/components/ReviewerDetailSkeleton";

export default function Loading() {
  return (
    <div
      id="detail-page-container"
      className="fixed top-0 left-0 w-full flex flex-col overflow-hidden bg-background text-foreground"
      style={{
        height: "100dvh"
      }}
    >
      <div className="flex-shrink-0">
        <Header />
      </div>
      <div className="mx-auto max-w-3xl px-4 py-1 md:py-2 flex-1 min-h-0 flex flex-col w-full relative">
        <ReviewerDetailSkeleton />
      </div>
    </div>
  );
}
