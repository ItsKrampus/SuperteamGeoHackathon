import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { db } from '@/lib/db'
import { lamportsToSol, shortenAddress } from '@/lib/solana'
import { Button } from '@/components/ui/button'

const statusStyles = {
  funded: 'bg-[#1a1a1a] text-[#e63b2e] border border-[#e63b2e]',
  inProgress: 'bg-[#1a1a1a] text-[#537aff] border border-[#537aff]',
  submitted: 'bg-[#1a1a1a] text-yellow-400 border border-yellow-600',
  released: 'bg-[#2a2a2a] text-neutral-400 border border-neutral-700',
  disputed: 'bg-[#1a1a1a] text-red-400 border border-red-600',
  cancelled: 'bg-[#2a2a2a] text-neutral-500 border border-neutral-700',
}

const CATEGORIES = ['Smart Contracts', 'Frontend Dev', 'UI/UX Design', 'Backend', 'Security']

export default function Jobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategories, setSelectedCategories] = useState([])
  const [sortBy, setSortBy] = useState('recent')

  useEffect(() => {
    db.jobs.list().then((data) => {
      setJobs(data)
      setLoading(false)
    })
  }, [])

  function toggleCategory(cat) {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }

  const filtered = jobs.filter((job) => {
    if (search) {
      const q = search.toLowerCase()
      const matchTitle = job.title?.toLowerCase().includes(q)
      const matchDesc = job.description?.toLowerCase().includes(q)
      const matchTags = job.tags?.some((t) => t.toLowerCase().includes(q))
      if (!matchTitle && !matchDesc && !matchTags) return false
    }
    if (selectedCategories.length > 0) {
      const jobTags = (job.tags || []).map((t) => t.toLowerCase())
      const match = selectedCategories.some((cat) => jobTags.some((t) => t.includes(cat.toLowerCase().split(' ')[0])))
      if (!match) return false
    }
    return true
  })

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'budget') return (b.amount || 0) - (a.amount || 0)
    return (b.createdAt || 0) - (a.createdAt || 0)
  })

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-8 pt-24">
        <p className="text-neutral-500">Loading jobs...</p>
      </div>
    )
  }

  return (
    <div className="pt-16 min-h-screen">
      <div className="max-w-6xl mx-auto p-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="relative flex-1 max-w-xl">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">search</span>
            <input
              className="w-full bg-[#2a2a2a] border-none focus:ring-1 focus:ring-[#e63b2e] text-white pl-10 pr-4 py-3 rounded-[4px] text-sm"
              placeholder="Search for jobs, skills, or keywords..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-neutral-400 font-display text-xs uppercase">Sort by</span>
            <select
              className="bg-[#2a2a2a] border-none text-white font-display text-xs px-4 py-2 rounded-[4px] focus:ring-[#e63b2e]"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="recent">Most Recent</option>
              <option value="budget">Highest Budget</option>
            </select>
            <Button asChild variant="brand">
              <Link to="/jobs/new">Post a Job</Link>
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="space-y-8">
            <div>
              <h4 className="font-display text-sm font-semibold mb-4 border-l-2 border-[#e63b2e] pl-3 uppercase">Category</h4>
              <div className="space-y-2">
                {CATEGORIES.map((cat) => (
                  <label key={cat} className="flex items-center gap-3 group cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat)}
                      onChange={() => toggleCategory(cat)}
                      className="form-checkbox bg-transparent border-neutral-600 text-[#e63b2e] rounded-sm"
                    />
                    <span className="text-neutral-300 text-sm group-hover:text-white">{cat}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-display text-sm font-semibold mb-4 border-l-2 border-[#e63b2e] pl-3 uppercase">Payment Type</h4>
              <div className="space-y-2">
                {['SOL Payments', 'USDC Stablecoin'].map((type) => (
                  <label key={type} className="flex items-center gap-3 group cursor-pointer">
                    <input type="checkbox" defaultChecked className="form-checkbox bg-transparent border-neutral-600 text-[#e63b2e] rounded-sm" />
                    <span className="text-neutral-300 text-sm group-hover:text-white">{type}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          <section className="lg:col-span-3 space-y-4">
            {sorted.length === 0 ? (
              <div className="bg-[#1f1f1f] border border-neutral-800 p-12 text-center">
                <p className="text-neutral-400 mb-4">No jobs found.</p>
                <Button asChild variant="brand">
                  <Link to="/jobs/new">Be the first to post</Link>
                </Button>
              </div>
            ) : (
              sorted.map((job) => (
                <Link
                  key={`${job.clientWallet}_${job.jobId}`}
                  to={`/jobs/${job.clientWallet}_${job.jobId}`}
                >
                  <div className="bg-[#1f1f1f] border border-[#4a4a4a] p-6 hover:border-[#e63b2e] transition-colors duration-200 group">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-[2px] tracking-widest uppercase ${statusStyles[job.status] || 'bg-[#2a2a2a] text-neutral-400'}`}>
                            {job.status === 'funded' ? 'Escrow Secured' : job.status}
                          </span>
                        </div>
                        <h2 className="font-display text-xl text-white group-hover:text-[#e63b2e] transition-colors">{job.title}</h2>
                        <p className="text-neutral-500 text-xs mt-1">
                          by {shortenAddress(job.clientWallet)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-display text-lg font-semibold">{lamportsToSol(job.amount)} SOL</div>
                        <div className="text-neutral-500 font-display text-[10px] uppercase">Est. Budget</div>
                      </div>
                    </div>
                    <p className="text-neutral-400 text-sm mb-6 line-clamp-2">
                      {job.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        {job.tags?.map((tag) => (
                          <span key={tag} className="bg-[#2a2a2a] text-neutral-300 font-display text-[10px] px-3 py-1 uppercase">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <span className="bg-white text-black font-display text-xs px-6 py-2 uppercase font-bold group-hover:bg-[#e63b2e] group-hover:text-white transition-colors">
                        View Details
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
