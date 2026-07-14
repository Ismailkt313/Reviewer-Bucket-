export default function Footer() {
  return (
    <footer className="border-t border-border px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs text-neutral-400 dark:text-neutral-500">
          &copy; {new Date().getFullYear()} Reviewer Bucket
        </p>
      </div>
    </footer>
  );
}
