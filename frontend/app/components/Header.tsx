import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur-xs">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-base font-semibold tracking-tight text-foreground">
          Reviewer Bucket
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/community" className="text-sm font-medium text-secondary hover:text-foreground transition-colors">
            Community
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
