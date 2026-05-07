import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { db } from '@/lib/db'
import { lamportsToSol, shortenAddress } from '@/lib/solana'
import { Button } from '@/components/ui/button'
import { useProfile } from '@/contexts/ProfileContext'

export default function Jobs() {
  const { profile } = useProfile()
  const canPost = !profile?.role || profile.role !== 'freelancer'
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('recent')

  useEffect(() => {
    db.jobs.list({ status: 'funded' }).then((data) => {
      setJobs(data)
      setLoading(false)
    })
  }, [])

  const filtered = jobs.filter((job) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      job.title?.toLowerCase().includes(q) ||
      job.description?.toLowerCase().includes(q) ||
      job.tags?.some((t) => t.toLowerCase().includes(q))
    )
  })

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'budget') return (b.amount || 0) - (a.amount || 0)
    return (b.createdAt || 0) - (a.createdAt || 0)
  })

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-8 pt-24 flex justify-center">
        <div className="w-8 h-8 border-2 border-[#e63b2e] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="pt-16 min-h-screen">
      <div className="max-w-5xl mx-auto p-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="relative flex-1 max-w-xl">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">search</span>
            <input
              className="w-full bg-[#2a2a2a] border-none focus:ring-1 focus:ring-[#e63b2e] text-white pl-10 pr-4 py-3 rounded-[4px] text-sm"
              placeholder="Search jobs, skills, or keywords..."
              type="text"
              aria-label="Search jobs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4">
            <select
              className="bg-[#2a2a2a] border-none text-white font-display text-xs px-4 py-2 rounded-[4px] focus:ring-1 focus:ring-[#e63b2e] outline-none"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="recent">Most Recent</option>
              <option value="budget">Highest Budget</option>
            </select>
            {canPost && (
              <Button asChild variant="brand">
                <Link to="/jobs/new">Post a Job</Link>
              </Button>
            )}
          </div>
        </header>

        <div className="space-y-4">
          {sorted.length === 0 ? (
            <div className="bg-[#1f1f1f] border border-neutral-800 p-12 text-center">
              <p className="text-neutral-400 mb-4">No jobs found.</p>
              {canPost && (
                <Button asChild variant="brand">
                  <Link to="/jobs/new">Be the first to post</Link>
                </Button>
              )}
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
                        <span className="text-[10px] font-bold px-2 py-1 rounded-[2px] tracking-widest uppercase bg-[#1a1a1a] text-[#e63b2e] border border-[#e63b2e]">
                          Escrow Secured
                        </span>
                      </div>
                      <h2 className="font-display text-xl text-white group-hover:text-[#e63b2e] transition-colors">{job.title}</h2>
                      <p className="text-neutral-500 text-xs mt-1">
                        by {shortenAddress(job.clientWallet)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-display text-lg font-semibold font-mono tabular-nums">{lamportsToSol(job.amount)} SOL</div>
                      <div className="text-neutral-500 font-display text-[10px] uppercase">Budget</div>
                    </div>
                  </div>
                  <p className="text-neutral-400 text-sm mb-6 line-clamp-2">
                    {job.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
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
        </div>
      </div>
    </div>
  )
}
