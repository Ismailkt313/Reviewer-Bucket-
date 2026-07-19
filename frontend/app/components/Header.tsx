"use client";

import Link from "next/link";
import { MessageCircleMore } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import NotificationPanel from "./NotificationPanel";
import { useCommunityUnread } from "../hooks/useCommunityUnread";

export default function Header() {
  const { unreadCount } = useCommunityUnread();
  const displayCount = unreadCount > 9 ? "9+" : unreadCount.toString();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/85 backdrop-blur-md flex-shrink-0">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col">
          <Link
            href="/"
            className="text-sm font-bold tracking-tight text-foreground leading-none"
          >
            Reviewer Bucket
          </Link>
          <span className="hidden sm:inline text-[10px] text-muted font-medium mt-0.5">
            Community-driven interview experiences
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/community"
            aria-label="Community"
            title="Community"
            className="relative flex h-9 w-9 items-center justify-center rounded-xl text-secondary hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-focus min-w-[36px] min-h-[36px]"
          >
            <MessageCircleMore className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-background ring-2 ring-background animate-pulse">
                {displayCount}
              </span>
            )}
          </Link>

          <NotificationPanel />

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}