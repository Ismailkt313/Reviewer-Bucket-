export default function HowItWorks() {
  const steps = [
    {
      number: "1",
      title: "See the reviewer code",
      description: "During your Brocamp or Brototype review, note the reviewer code displayed on screen.",
    },
    {
      number: "2",
      title: "Search in Reviewer Bucket",
      description: "Enter the reviewer code or name into the search field on this page.",
    },
    {
      number: "3",
      title: "Find the reviewer",
      description: "Instantly see the matching reviewer's name and code.",
    },
  ];

  return (
    <section id="how-it-works" className="border-t border-border px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          How Reviewer Bucket Works
        </h2>
        <div className="mt-8 grid gap-8 sm:grid-cols-3">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col gap-2">
              <span className="font-mono text-sm font-medium text-neutral-400">
                {step.number}
              </span>
              <h3 className="text-base font-medium text-foreground">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
