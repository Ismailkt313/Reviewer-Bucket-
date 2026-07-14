export default function Footer() {
  return (
    <footer className="border-t border-border px-4 py-8 sm:px-6 lg:px-8 bg-background">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <p className="text-xs text-muted">
          &copy; {new Date().getFullYear()} Reviewer Bucket
        </p>
      </div>
    </footer>
  );
}
