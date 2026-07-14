"use client";

import { useState } from "react";

const faqs = [
  {
    question: "What is Reviewer Bucket?",
    answer:
      "Reviewer Bucket is a student-focused utility that helps Brocamp and Brototype students identify reviewers using the reviewer codes shown during reviews.",
  },
  {
    question: "How do I find a reviewer using a reviewer code?",
    answer:
      "Enter the reviewer code shown during your review into the search field. For example, type \"BR 64\" to find the reviewer associated with that code.",
  },
  {
    question: "Can I search without spaces in the reviewer code?",
    answer:
      "Yes. You can search using \"BR64\", \"BR 64\", or just \"64\". The search handles spacing and formatting automatically.",
  },
  {
    question: "Can I search using a reviewer name?",
    answer:
      "Yes. You can search by the reviewer's name instead of the code. The search works with both reviewer codes and names.",
  },
  {
    question: "Is Reviewer Bucket an official Brocamp or Brototype platform?",
    answer:
      "No. Reviewer Bucket is an independent, student-built utility. It is not affiliated with, endorsed by, or officially connected to Brocamp or Brototype.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function toggle(index: number) {
    setOpenIndex(openIndex === index ? null : index);
  }

  return (
    <section id="faq" className="border-t border-border px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Frequently Asked Questions
        </h2>
        <dl className="mt-8 divide-y divide-border">
          {faqs.map((faq, index) => (
            <div key={index} className="py-5">
              <dt>
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  aria-expanded={openIndex === index}
                  className="flex w-full items-start justify-between gap-4 text-left font-medium text-foreground transition-colors duration-150 hover:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
                >
                  <span className="text-sm font-semibold">
                    {faq.question}
                  </span>
                  <span
                    className="ml-auto flex-shrink-0 text-muted transition-transform duration-150 motion-reduce:transition-none"
                    style={{
                      transform: openIndex === index ? "rotate(45deg)" : "rotate(0deg)",
                    }}
                    aria-hidden="true"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <line x1="8" y1="3" x2="8" y2="13" />
                      <line x1="3" y1="8" x2="13" y2="8" />
                    </svg>
                  </span>
                </button>
              </dt>
              {openIndex === index && (
                <dd className="mt-3 pr-8 text-sm leading-relaxed text-secondary">
                  {faq.answer}
                </dd>
              )}
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
