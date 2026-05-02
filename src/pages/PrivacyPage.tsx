export function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-8 text-slate-200">
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <h1 className="text-2xl font-bold text-white">Privacy Policy</h1>
        <p className="mt-2 text-sm text-slate-400">
          Last updated: May 2026
        </p>
      </section>

      <section className="space-y-4 text-sm leading-7 text-slate-300">
        <p>
          FootyAM is a football highlights discovery service designed to help users find official match highlights with spoiler protection.
        </p>

        <h2 className="text-lg font-semibold text-white">Information we collect</h2>
        <p>
          We may store basic preferences such as spoiler mode, favorite clubs, and notification settings. If account features are enabled, sign-in information may be handled through third-party authentication providers.
        </p>

        <h2 className="text-lg font-semibold text-white">How we use information</h2>
        <p>
          We use this information to personalize the experience, remember preferences, and improve the service.
        </p>

        <h2 className="text-lg font-semibold text-white">Third-party services</h2>
        <p>
          FootyAM may embed or link to third-party services such as YouTube and official football media channels. Their own privacy policies apply when you interact with their services.
        </p>

        <h2 className="text-lg font-semibold text-white">Data storage</h2>
        <p>
          Some settings may be stored locally in your browser. If account features are enabled, certain preferences may be stored securely through our backend or authentication provider.
        </p>

        <h2 className="text-lg font-semibold text-white">Contact</h2>
        <p>
          If you have questions about this policy, please contact us through the contact page.
        </p>
      </section>
    </main>
  );
}