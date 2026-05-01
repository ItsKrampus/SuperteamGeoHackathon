import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useWallet } from '@solana/wallet-adapter-react'
import { db } from '@/lib/db'
import { lamportsToSol, shortenAddress } from '@/lib/solana'

export default function Dashboard() {
  const { publicKey, connected } = useWallet()
  const [clientJobs, setClientJobs] = useState([])
  const [freelancerJobs, setFreelancerJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!connected || !publicKey) {
      setLoading(false)
      return
    }
    const wallet = publicKey.toBase58()
    Promise.all([
      db.jobs.list({ clientWallet: wallet }),
      db.jobs.list({ freelancerWallet: wallet }),
    ]).then(([cJobs, fJobs]) => {
      setClientJobs(cJobs)
      setFreelancerJobs(fJobs)
      setLoading(false)
    })
  }, [connected, publicKey])

  if (!connected) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center">
        <p className="text-neutral-500">Connect your wallet to view your dashboard.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="pt-24 min-h-screen">
        <div className="max-w-7xl mx-auto p-6">
          <p className="text-neutral-500">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const allJobs = [...clientJobs, ...freelancerJobs]
  const activeJobs = allJobs.filter((j) => ['funded', 'inProgress', 'submitted'].includes(j.status))
  const completedJobs = allJobs.filter((j) => j.status === 'released')
  const totalEarned = freelancerJobs
    .filter((j) => j.status === 'released')
    .reduce((sum, j) => sum + Number(j.amount || 0), 0)
  const totalEscrowed = allJobs
    .filter((j) => ['funded', 'inProgress', 'submitted'].includes(j.status))
    .reduce((sum, j) => sum + Number(j.amount || 0), 0)

  const recentActivity = allJobs
    .sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0))
    .slice(0, 5)

  return (
    <main className="pt-16 min-h-screen bg-neutral-950">
      <div className="max-w-7xl mx-auto p-6 md:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <div className="lg:col-span-2 bg-[#121212] border border-neutral-800 rounded-lg p-6 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#e63b2e] opacity-5 blur-[100px]"></div>
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="font-display text-2xl font-semibold text-white mb-1">Wallet Overview</h2>
                <p className="text-neutral-500 text-sm uppercase tracking-widest font-display">Protocol Activity</p>
              </div>
              <span className="material-symbols-outlined text-neutral-600">account_balance_wallet</span>
            </div>
            <div className="flex flex-col md:flex-row md:items-end gap-8">
              <div>
                <p className="text-xs text-neutral-500 font-display uppercase mb-1">Total Earned</p>
                <p className="text-4xl font-black text-white tracking-tighter">{lamportsToSol(totalEarned)} <span className="text-lg font-normal text-neutral-600">SOL</span></p>
              </div>
              <div className="md:border-l border-neutral-800 md:pl-8">
                <p className="text-xs text-neutral-500 font-display uppercase mb-1">In Escrow</p>
                <p className="text-4xl font-black text-white tracking-tighter">{lamportsToSol(totalEscrowed)} <span className="text-lg font-normal text-neutral-600">SOL</span></p>
              </div>
            </div>
          </div>

          <div className="bg-[#121212] border border-neutral-800 rounded-lg p-6">
            <h3 className="font-display text-xs text-neutral-500 uppercase tracking-widest mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <p className="text-neutral-500 text-sm">No activity yet.</p>
              ) : (
                recentActivity.slice(0, 3).map((job) => (
                  <Link
                    key={`${job.clientWallet}_${job.jobId}`}
                    to={`/jobs/${job.clientWallet}_${job.jobId}`}
                    className="flex gap-4 items-start pb-4 border-b border-neutral-800/50 last:border-0 hover:opacity-80 transition-opacity"
                  >
                    <div className={`w-2 h-2 rounded-full mt-1.5 ${
                      job.status === 'released' ? 'bg-green-500' :
                      job.status === 'disputed' ? 'bg-red-500' :
                      job.status === 'inProgress' ? 'bg-blue-500' :
                      'bg-[#e63b2e]'
                    }`}></div>
                    <div>
                      <p className="text-sm text-white font-medium">{job.title}</p>
                      <p className="text-xs text-neutral-500">{job.status} &middot; {lamportsToSol(job.amount)} SOL</p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <div className="xl:col-span-8 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="font-display text-2xl font-semibold text-white">Active Gigs</h2>
              <Link to="/jobs" className="text-xs font-display text-[#e63b2e] uppercase flex items-center gap-1 hover:underline">
                Browse Jobs <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>

            {activeJobs.length === 0 ? (
              <div className="bg-[#1a1a1a] border border-neutral-800 p-12 rounded-lg text-center">
                <p className="text-neutral-400 mb-4">No active gigs yet.</p>
                <Link to="/jobs" className="text-[#e63b2e] font-display text-sm uppercase hover:underline">Browse available jobs</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeJobs.map((job) => {
                  const isMyClient = job.clientWallet === publicKey.toBase58()
                  return (
                    <Link
                      key={`${job.clientWallet}_${job.jobId}`}
                      to={`/jobs/${job.clientWallet}_${job.jobId}`}
                      className="bg-[#1a1a1a] border border-neutral-800 p-6 rounded-lg group hover:border-[#e63b2e] transition-colors"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${
                          isMyClient ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'
                        }`}>
                          {isMyClient ? 'Client' : 'Freelancer'}
                        </span>
                        <span className="text-xs text-neutral-500 flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm text-green-500" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                          In Escrow
                        </span>
                      </div>
                      <h4 className="text-xl font-bold text-white mb-2 leading-tight group-hover:text-[#e63b2e] transition-colors">{job.title}</h4>
                      <p className="text-sm text-neutral-400 mb-6 line-clamp-2">{job.description}</p>
                      <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
                        <div>
                          <p className="text-[10px] text-neutral-500 uppercase font-display">Budget</p>
                          <p className="text-white font-bold">{lamportsToSol(job.amount)} SOL</p>
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${
                          job.status === 'submitted' ? 'bg-yellow-500/10 text-yellow-400' :
                          job.status === 'inProgress' ? 'bg-blue-500/10 text-blue-400' :
                          'bg-neutral-800 text-neutral-400'
                        }`}>
                          {job.status === 'funded' ? 'Open' : job.status}
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          <div className="xl:col-span-4 space-y-6">
            <h2 className="font-display text-2xl font-semibold text-white">Completed</h2>
            <div className="bg-[#121212] border border-neutral-800 rounded-lg divide-y divide-neutral-800">
              {completedJobs.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-neutral-500 text-sm">No completed jobs yet.</p>
                </div>
              ) : (
                completedJobs.slice(0, 5).map((job) => (
                  <Link
                    key={`${job.clientWallet}_${job.jobId}`}
                    to={`/jobs/${job.clientWallet}_${job.jobId}`}
                    className="block p-4 hover:bg-neutral-900 transition-colors"
                  >
                    <div className="flex justify-between mb-2">
                      <h5 className="text-sm font-bold text-white">{job.title}</h5>
                      <span className="text-xs text-green-400 font-bold">{lamportsToSol(job.amount)} SOL</span>
                    </div>
                    <div className="flex gap-2">
                      {job.tags?.slice(0, 2).map((tag) => (
                        <span key={tag} className="text-[9px] bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded border border-neutral-700">{tag}</span>
                      ))}
                    </div>
                  </Link>
                ))
              )}
            </div>

            <div className="bg-[#e63b2e] rounded-lg p-6 relative overflow-hidden">
              <div className="relative z-10">
                <h4 className="text-lg font-black text-white uppercase tracking-tighter mb-2">Soulbound Reviews</h4>
                <p className="text-white/80 text-xs mb-4">Complete jobs and earn permanent on-chain reputation as non-transferable NFT reviews.</p>
                <Link to={`/profile/${publicKey?.toBase58()}`} className="bg-white text-black font-display text-[10px] uppercase px-4 py-2 rounded font-bold hover:bg-neutral-200 transition-all inline-block">
                  View Profile
                </Link>
              </div>
              <div className="absolute -bottom-4 -right-4 opacity-10">
                <span className="material-symbols-outlined text-[120px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
