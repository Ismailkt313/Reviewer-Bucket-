import type { Reviewer } from "@/app/data/reviewers";

type ReviewerRowProps = {
  reviewer: Reviewer;
};

export default function ReviewerRow({ reviewer }: ReviewerRowProps) {
  return (
    <div
      role="listitem"
      tabIndex={0}
      className="flex items-center justify-between gap-4 border-b border-neutral-100 px-4 py-3 transition-colors duration-150 hover:bg-neutral-50 focus-visible:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-foreground dark:border-neutral-800/60 dark:hover:bg-neutral-800/40 dark:focus-visible:bg-neutral-800/40"
    >
      <span className="min-w-0 truncate text-sm font-medium text-foreground">
        {reviewer.name}
      </span>
      <span className="flex-shrink-0 font-mono text-sm tracking-wide text-neutral-400 dark:text-neutral-500">
        {reviewer.code}
      </span>
    </div>
  );
}
