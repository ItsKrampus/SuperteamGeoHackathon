import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { db } from '@/lib/db'
import { createJob } from '@/lib/anchor/instructions'
import { solToLamports } from '@/lib/solana'
import { Button } from '@/components/ui/button'
import { useProfile } from '@/contexts/ProfileContext'

export default function NewJob() {
  const { publicKey, connected } = useWallet()
  const wallet = useWallet()
  const { connection } = useConnection()
  const navigate = useNavigate()
  const { profile } = useProfile()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [amountSol, setAmountSol] = useState('')
  const [tags, setTags] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const tagList = tags.split(',').map((t) => t.trim()).filter(Boolean)

  if (!connected) {
    return (
      <div className="max-w-2xl mx-auto p-8 pt-24 text-center">
        <p className="text-neutral-400">Connect your wallet to post a job.</p>
      </div>
    )
  }

  if (profile?.role === 'freelancer') {
    return (
      <div className="max-w-2xl mx-auto p-8 pt-24 text-center">
        <p className="text-neutral-400 mb-4">Only clients can post jobs.</p>
        <Button asChild variant="brand">
          <Link to="/jobs">Browse Jobs</Link>
        </Button>
      </div>
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const jobId = Date.now()
      const amount = parseFloat(amountSol)
      if (!amount || amount <= 0) throw new Error('Invalid amount')

      const { tx, jobPda } = await createJob(wallet, connection, {
        jobId,
        amountSol: amount,
      })

      await db.jobs.create({
        clientWallet: publicKey.toBase58(),
        jobId: String(jobId),
        jobAccountPda: jobPda.toBase58(),
        title,
        description,
        tags: tagList,
        amount: solToLamports(amount),
        tokenMint: null,
        status: 'funded',
        freelancerWallet: null,
        txSig: tx,
      })

      navigate(`/jobs/${publicKey.toBase58()}_${jobId}`)
    } catch (err) {
      console.error('createJob failed:', err)
      setError(err.message || 'Transaction failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="pt-24 pb-20 px-6 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12">
          <h1 className="font-display text-3xl font-bold mb-2">Create New Escrow Job</h1>
          <p className="text-zinc-400 max-w-2xl">Define your project requirements and lock funds securely on-chain. All contracts are secured by the ProofWork Escrow Protocol.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section className="lg:col-span-2 space-y-8">
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-lg">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="font-display text-xs text-zinc-500 uppercase tracking-widest">Job Title</label>
                  <input
                    className="w-full bg-zinc-800 border-zinc-700 text-white p-3 rounded-lg focus:ring-2 focus:ring-[#e63b2e] focus:border-transparent outline-none transition-all duration-200"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Smart Contract Auditor for DeFi Protocol"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-display text-xs text-zinc-500 uppercase tracking-widest">Job Description</label>
                  <textarea
                    className="w-full bg-zinc-800 border-zinc-700 text-white p-3 rounded-lg focus:ring-2 focus:ring-[#e63b2e] focus:border-transparent outline-none transition-all duration-200"
                    rows={6}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the technical requirements, deliverables, and scope of work..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-display text-xs text-zinc-500 uppercase tracking-widest">Budget Amount (SOL)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-zinc-400 font-bold font-display text-sm">◎</span>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      className="w-full bg-zinc-800 border-zinc-700 text-white pl-10 pr-16 p-3 rounded-lg focus:ring-2 focus:ring-[#e63b2e] focus:border-transparent outline-none transition-all duration-200"
                      value={amountSol}
                      onChange={(e) => setAmountSol(e.target.value)}
                      placeholder="0.00"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-zinc-500 font-bold font-display text-xs">SOL</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-display text-xs text-zinc-500 uppercase tracking-widest">Required Skills (Tags)</label>
                  <input
                    className="w-full bg-zinc-800 border-zinc-700 text-white p-3 rounded-lg focus:ring-2 focus:ring-[#e63b2e] focus:border-transparent outline-none transition-all duration-200"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="Rust, Solidity, Anchor, React (comma separated)"
                  />
                  {tagList.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {tagList.map((tag) => (
                        <span key={tag} className="bg-zinc-800 text-zinc-300 px-3 py-1 rounded text-xs border border-zinc-700 uppercase">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>

                {error && (
                  <p className="text-sm text-red-400">{error}</p>
                )}

                <div className="flex items-center justify-between pt-4">
                  <button type="button" onClick={() => navigate(-1)} className="text-zinc-500 font-bold hover:text-white transition-colors font-display text-sm">
                    Discard Draft
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-[#e63b2e] text-white px-12 py-4 rounded font-bold font-display text-base hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-[#e63b2e]/20 disabled:opacity-50 disabled:pointer-events-none uppercase tracking-wider flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined">lock</span>
                    {loading ? 'Confirm in Phantom...' : 'Deploy Job to Chain'}
                  </button>
                </div>
              </form>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="bg-[#e63b2e]/10 border border-[#e63b2e]/30 p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-[#e63b2e]" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                <h3 className="font-display text-white font-semibold">Escrow Required</h3>
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed mb-4">
                Funds are locked in a programmatic escrow upon job creation. Payment is released only after milestone approval.
              </p>
              <ul className="text-xs text-zinc-400 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[#e63b2e] text-[14px]">check_circle</span>
                  Automated release via smart contract
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[#e63b2e] text-[14px]">check_circle</span>
                  0% Protocol Fee on settlement
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[#e63b2e] text-[14px]">check_circle</span>
                  Soulbound NFT review upon completion
                </li>
              </ul>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 overflow-hidden rounded-lg">
              <div className="h-32 bg-gradient-to-br from-[#1a1a1a] to-zinc-800 relative flex items-center justify-center">
                <span className="material-symbols-outlined text-6xl text-zinc-700">code</span>
                <div className="absolute bottom-4 left-4 bg-zinc-900/80 backdrop-blur-sm px-3 py-1 border border-zinc-700 rounded text-[10px] uppercase tracking-widest text-zinc-400">Live Preview</div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded bg-white flex items-center justify-center text-[#1a1a1a] font-black font-display text-sm">BL</div>
                  <span className="text-[#e63b2e] font-bold text-lg font-display">{amountSol || '---'} SOL</span>
                </div>
                <h4 className="text-white font-bold mb-2">{title || 'Job Title Preview'}</h4>
                <p className="text-zinc-500 text-xs line-clamp-3">{description || 'Your description will appear here once you start typing.'}</p>
              </div>
            </div>

            <div className="p-6 border border-zinc-800 rounded-lg">
              <h4 className="font-display text-xs text-zinc-500 uppercase mb-3">Transaction Info</h4>
              <p className="text-[10px] text-zinc-400 leading-relaxed">
                Posting this job requires a Phantom wallet transaction to lock funds in the on-chain escrow contract. Funds are fully refundable before a freelancer is accepted.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
