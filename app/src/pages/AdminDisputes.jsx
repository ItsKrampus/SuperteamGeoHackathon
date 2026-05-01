import { useEffect, useState } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { db } from '@/lib/db'
import { ADMIN_PUBKEY, shortenAddress, lamportsToSol } from '@/lib/solana'
import { resolveDispute } from '@/lib/anchor/instructions'

export default function AdminDisputes() {
  const wallet = useWallet()
  const { publicKey, connected } = wallet
  const { connection } = useConnection()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)

  const isAdmin = connected && publicKey?.equals(ADMIN_PUBKEY)

  useEffect(() => {
    db.jobs.list({ status: 'disputed' }).then((data) => {
      setJobs(data)
      setLoading(false)
    })
  }, [])

  async function handleResolve(job, awardToFreelancer) {
    const key = `${job.clientWallet}_${job.jobId}`
    setActionLoading(key)
    try {
      await resolveDispute(wallet, connection, {
        jobPda: new PublicKey(job.jobAccountPda),
        clientPubkey: new PublicKey(job.clientWallet),
        freelancerPubkey: new PublicKey(job.freelancerWallet),
        awardToFreelancer,
      })
      await db.jobs.update(job.clientWallet, job.jobId, {
        status: awardToFreelancer ? 'released' : 'cancelled',
      })
      setJobs((prev) => prev.filter((j) => `${j.clientWallet}_${j.jobId}` !== key))
    } catch (err) {
      console.error('resolve failed:', err)
      alert(`Failed: ${err.message}`)
    } finally {
      setActionLoading(null)
    }
  }

  // if (!isAdmin) {
  //   return (
  //     <div className="max-w-3xl mx-auto p-8 pt-24 text-center">
  //       <p className="text-neutral-500">Admin only.</p>
  //     </div>
  //   )
  // }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6 pt-24">
        <p className="text-neutral-500">Loading disputes...</p>
      </div>
    )
  }

  const totalEscrowed = jobs.reduce((sum, j) => sum + Number(j.amount || 0), 0)

  return (
    <main className="pt-16 min-h-screen bg-zinc-950">
      <div className="max-w-7xl mx-auto p-6 lg:p-10">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-white mb-1">Dispute Resolution</h1>
            <p className="text-zinc-500 font-display text-xs uppercase tracking-widest">Protocol Governance / Disputes / Active Queue</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-zinc-900 border border-zinc-700 px-4 py-2 rounded flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-xs font-display text-zinc-300">Arbitrator Node: Active</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-zinc-900/40 border border-zinc-700 p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-6xl">warning</span>
            </div>
            <div className="text-zinc-500 text-xs font-display uppercase mb-2">Active Disputes</div>
            <div className="text-3xl font-display font-bold text-white">{jobs.length}</div>
            <div className="mt-4 flex items-center gap-1 text-[#e63b2e] text-xs">
              <span className="material-symbols-outlined text-sm">gavel</span>
              <span>Awaiting resolution</span>
            </div>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-700 p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-6xl">lock</span>
            </div>
            <div className="text-zinc-500 text-xs font-display uppercase mb-2">Escrow Under Review</div>
            <div className="text-3xl font-display font-bold text-white">{lamportsToSol(totalEscrowed)} <span className="text-zinc-500 text-lg">SOL</span></div>
            <div className="mt-4 flex items-center gap-1 text-zinc-500 text-xs">
              <span className="material-symbols-outlined text-sm">schedule</span>
              <span>Locked in escrow</span>
            </div>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-700 p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-6xl">check_circle</span>
            </div>
            <div className="text-zinc-500 text-xs font-display uppercase mb-2">Arbitrator</div>
            <div className="text-3xl font-display font-bold text-white">{shortenAddress(publicKey)}</div>
            <div className="mt-4 flex items-center gap-1 text-green-500 text-xs">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              <span>Authorized admin</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="font-display text-xl font-semibold text-white">Active Case Queue</h2>
          </div>

          {jobs.length === 0 ? (
            <div className="bg-zinc-900/40 border border-zinc-700 p-12 text-center rounded">
              <p className="text-zinc-400">No active disputes.</p>
            </div>
          ) : (
            jobs.map((job) => {
              const key = `${job.clientWallet}_${job.jobId}`
              const isProcessing = actionLoading === key
              return (
                <div
                  key={key}
                  className="bg-zinc-900/60 border border-zinc-700 p-6 flex flex-col lg:flex-row gap-8 items-start lg:items-center relative"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="material-symbols-outlined text-[#e63b2e]">emergency_home</span>
                      <h3 className="text-xl font-bold font-display text-white">{job.title}</h3>
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs font-display">
                      <div className="flex flex-col">
                        <span className="text-zinc-500 uppercase tracking-widest text-[10px]">Client</span>
                        <span className="text-zinc-300 font-mono">{shortenAddress(job.clientWallet)}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-zinc-500 uppercase tracking-widest text-[10px]">Freelancer</span>
                        <span className="text-zinc-300 font-mono">{shortenAddress(job.freelancerWallet)}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-zinc-500 uppercase tracking-widest text-[10px]">Amount</span>
                        <span className="text-white font-bold">{lamportsToSol(job.amount)} SOL</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 lg:border-l border-zinc-800 lg:pl-8">
                    <span className="text-zinc-500 uppercase tracking-widest text-[10px] block mb-1">Job Description</span>
                    <p className="text-zinc-300 text-sm italic line-clamp-3">{job.description || 'No description provided.'}</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      className="bg-[#e63b2e] text-white font-bold py-2 px-4 rounded-sm text-xs uppercase hover:bg-[#d1332a] transition-colors whitespace-nowrap disabled:opacity-50"
                      onClick={() => handleResolve(job, true)}
                      disabled={isProcessing}
                    >
                      Award Freelancer
                    </button>
                    <button
                      className="bg-zinc-100 text-zinc-950 font-bold py-2 px-4 rounded-sm text-xs uppercase hover:bg-white transition-colors whitespace-nowrap disabled:opacity-50"
                      onClick={() => handleResolve(job, false)}
                      disabled={isProcessing}
                    >
                      Refund Client
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </main>
  )
}
