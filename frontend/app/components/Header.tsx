import Link from "next/link";
import { MessageCircleMore } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur-xs">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-base font-semibold tracking-tight text-foreground"
        >
          Reviewer Bucket
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/community"
            aria-label="Community"
            title="Community"
            className="flex h-10 w-10 items-center justify-center rounded-full text-secondary transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <MessageCircleMore className="h-5 w-5 sm:h-6 sm:w-6" />
          </Link>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}