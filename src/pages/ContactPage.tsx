export function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-8 text-slate-200">
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <h1 className="text-2xl font-bold text-white">Contact</h1>
        <p className="mt-2 text-sm text-slate-400">
          Have feedback or found an issue? Get in touch.
        </p>
      </section>

      <section className="space-y-4 text-sm leading-7 text-slate-300">
        <p>
          FootyAM is an early-stage project. If you find bugs, incorrect match data,
          or missing highlights, your feedback helps improve the service.
        </p>

        <h2 className="text-lg font-semibold text-white">How to contact</h2>

        <div className="space-y-3">
          <p>
            Email:
            <a
              href="mailto:footyam.official@gmail.com"
              className="ml-2 text-brand-500 hover:underline"
            >
              your@email.com
            </a>
          </p>

          <p>
            Or reach out via social media (if available).
          </p>
        </div>

        <h2 className="text-lg font-semibold text-white">What to include</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Match (teams or league)</li>
          <li>What went wrong</li>
          <li>Device / browser (if possible)</li>
        </ul>
      </section>
    </main>
  );
}