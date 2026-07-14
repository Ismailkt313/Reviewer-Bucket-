export default function About() {
  return (
    <section id="about" className="border-t border-border px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          About Reviewer Bucket
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
          Reviewer Bucket is a simple reviewer finder created to help Brocamp and Brototype
          students identify reviewers using the reviewer codes shown during reviews. Search by
          reviewer code or name to quickly find the matching reviewer.
        </p>
      </div>
    </section>
  );
}
