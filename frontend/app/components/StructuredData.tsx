export default function StructuredData() {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Reviewer Bucket",
    description:
      "A student-focused utility to help Brocamp and Brototype students identify reviewers using reviewer codes shown during reviews.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "/?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is Reviewer Bucket?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Reviewer Bucket is a student-focused utility that helps Brocamp and Brototype students identify reviewers using the reviewer codes shown during reviews.",
        },
      },
      {
        "@type": "Question",
        name: "How do I find a reviewer using a reviewer code?",
        acceptedAnswer: {
          "@type": "Answer",
          text: 'Enter the reviewer code shown during your review into the search field. For example, type "BR 64" to find the reviewer associated with that code.',
        },
      },
      {
        "@type": "Question",
        name: "Can I search without spaces in the reviewer code?",
        acceptedAnswer: {
          "@type": "Answer",
          text: 'Yes. You can search using "BR64", "BR 64", or just "64". The search handles spacing and formatting automatically.',
        },
      },
      {
        "@type": "Question",
        name: "Can I search using a reviewer name?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. You can search by the reviewer's name instead of the code. The search works with both reviewer codes and names.",
        },
      },
      {
        "@type": "Question",
        name: "Is Reviewer Bucket an official Brocamp or Brototype platform?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. Reviewer Bucket is an independent, student-built utility. It is not affiliated with, endorsed by, or officially connected to Brocamp or Brototype.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}
