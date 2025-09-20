import * as React from 'react';

export default function OpportunityCardPlaceholder() {
  return (
    <article
      className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm"
      aria-label="Opportunity placeholder"
    >
      <div className="h-4 w-40 rounded bg-neutral-200" />
      <div className="mt-3 h-3 w-24 rounded bg-neutral-200" />
      <div className="mt-6 flex items-center justify-between">
        <div className="h-3 w-16 rounded bg-neutral-200" />
        <div className="h-8 w-24 rounded-md bg-neutral-900/5" />
      </div>
    </article>
  );
}