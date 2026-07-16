'use client';

import { useEffect } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center min-h-[60vh] px-4 text-center space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Something went wrong!
          </h2>
          <p className="text-secondary max-w-md mx-auto text-sm">
            We encountered an unexpected error while loading the reviewer profile. This might be due to a transient database disconnect.
          </p>
        </div>
        <button
          type="button"
          onClick={() => reset()}
          className="h-11 px-6 rounded-xl bg-foreground text-background text-sm font-bold hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-focus"
        >
          Try again
        </button>
      </main>
      <Footer />
    </>
  );
}
