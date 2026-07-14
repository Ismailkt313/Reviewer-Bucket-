import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center px-4 sm:px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight text-foreground">
          Reviewer Bucket
        </Link>
      </div>
    </header>
  );
}
