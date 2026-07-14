export default function About() {
  return (
    <section id="about" className="border-t border-border bg-surface/50 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          About Reviewer Bucket
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-secondary">
          Reviewer Bucket is a simple reviewer finder created to help Brocamp and Brototype
          students identify reviewers using the reviewer codes shown during reviews. Search by
          reviewer code or name to quickly find the matching reviewer.
        </p>
      </div>
    </section>
  );
}
