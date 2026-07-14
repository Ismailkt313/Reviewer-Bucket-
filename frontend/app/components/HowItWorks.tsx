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
    <section id="how-it-works" className="border-t border-border px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          How Reviewer Bucket Works
        </h2>
        <div className="mt-8 flex flex-col gap-8">
          {steps.map((step) => (
            <div key={step.number} className="flex gap-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface border border-border font-mono text-xs font-semibold text-secondary">
                {step.number}
              </span>
              <div className="flex flex-col gap-1">
                <h3 className="text-base font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-secondary">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
