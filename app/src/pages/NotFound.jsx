import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <main className="pt-16 min-h-screen flex items-center justify-center">
      <div className="text-center px-6">
        <h1 className="font-display text-7xl font-black text-[#e63b2e] tracking-tighter mb-4">404</h1>
        <p className="font-display text-xl text-white uppercase tracking-tight mb-2">Page Not Found</p>
        <p className="text-zinc-500 text-sm mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-[#e63b2e] hover:bg-[#d1332a] text-white px-6 py-3 rounded font-display text-sm font-bold uppercase tracking-wider transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-[#e63b2e] focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Home
        </Link>
      </div>
    </main>
  )
}
