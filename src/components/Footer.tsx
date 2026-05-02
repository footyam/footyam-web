export function Footer() {
  return (
<footer className="mt-32 border-t border-slate-900 py-8 text-center text-sm text-slate-600">      <p>© {new Date().getFullYear()} FootyAM</p>
      <div className="mt-2 space-x-4">
        <a href="/privacy" className="hover:underline">Privacy</a>
        <a href="/terms" className="hover:underline">Terms</a>
        <a
          href="mailto:footyam.official@gmail.com?subject=FootyAM Inquiry"
          className="hover:underline"
        >
          Contact
        </a>
      </div>
    </footer>
  );
}