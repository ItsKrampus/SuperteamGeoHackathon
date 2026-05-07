import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { db } from '@/lib/db'
import { lamportsToSol, shortenAddress, explorerUrl } from '@/lib/solana'
import {
  acceptFreelancer,
  submitWork,
  releasePayment,
  disputeJob,
  cancelJob,
} from '@/lib/anchor/instructions'
import { mintReviewNft } from '@/lib/nft/mintReviewNft'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import ReviewModal from '@/components/ReviewModal'
import { useProfile } from '@/contexts/ProfileContext'
import { useOnChainProfile } from '@/hooks/useOnChainProfile'
import { useOnChainProfiles } from '@/hooks/useOnChainProfiles'

const STATUS_LABELS = {
  funded: 'Open — Accepting Applications',
  inProgress: 'In Progress',
  submitted: 'Work Submitted — Awaiting Review',
  released: 'Completed & Paid',
  disputed: 'Disputed',
  cancelled: 'Cancelled',
}

export default function JobDetail() {
  const { id } = useParams()
  const [clientWallet, jobId] = id.split('_')
  const wallet = useWallet()
  const { publicKey, connected } = wallet
  const { connection } = useConnection()

  const [job, setJob] = useState(null)
  const [applications, setApplications] = useState([])
  const [coverLetter, setCoverLetter] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewLoading, setReviewLoading] = useState(false)
  const [txResult, setTxResult] = useState(null)
  const [messages, setMessages] = useState([])
  const [msgText, setMsgText] = useState('')
  const chatEndRef = useRef(null)
  const { profile } = useProfile()

  const isClient = connected && publicKey?.toBase58() === clientWallet
  const canApply = connected && !isClient && profile?.role !== 'client'
  const isFreelancer =
    connected && job?.freelancerWallet && publicKey?.toBase58() === job.freelancerWallet

  const otherWallet = isClient ? job?.freelancerWallet : isFreelancer ? clientWallet : null
  const { profile: otherProfile } = useOnChainProfile(otherWallet)

  const applicantWallets = applications.map((a) => a.freelancerWallet)
  const { profiles: applicantProfiles } = useOnChainProfiles(applicantWallets)

  const nameMap = {}
  if (profile?.displayName && publicKey) nameMap[publicKey.toBase58()] = profile.displayName
  if (otherProfile?.displayName && otherWallet) nameMap[otherWallet] = otherProfile.displayName
  for (const [addr, p] of Object.entries(applicantProfiles)) {
    if (p?.displayName) nameMap[addr] = p.displayName
  }

  const refresh = useCallback(async () => {
    const jobData = await db.jobs.get(clientWallet, jobId)
    setJob(jobData)
    const apps = await db.applications.listForJob(clientWallet, jobId)
    setApplications(apps)

    setLoading(false)
  }, [clientWallet, jobId, connected, wallet, connection])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    if (!job?.freelancerWallet || (!isClient && !isFreelancer)) return
    const jobKey = `${clientWallet}_${jobId}`
    const unsubscribe = db.messages.subscribe(jobKey, (msgs) => {
      setMessages(msgs)
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    })
    return unsubscribe
  }, [job?.freelancerWallet, isClient, isFreelancer, clientWallet, jobId])

  async function handleSendMessage(e) {
    e.preventDefault()
    if (!msgText.trim()) return
    await db.messages.send({
      jobKey: `${clientWallet}_${jobId}`,
      senderWallet: publicKey.toBase58(),
      text: msgText.trim(),
    })
    setMsgText('')
  }

  async function handleApply(e) {
    e.preventDefault()
    await db.applications.create({
      clientWallet,
      jobId,
      freelancerWallet: publicKey.toBase58(),
      coverLetter,
    })
    setCoverLetter('')
    refresh()
  }

  async function handleAccept(app) {
    setActionLoading(true)
    setTxResult(null)
    try {
      const jobPda = new PublicKey(job.jobAccountPda)
      const { tx } = await acceptFreelancer(wallet, connection, {
        jobPda,
        freelancerPubkey: new PublicKey(app.freelancerWallet),
      })
      await db.jobs.update(clientWallet, jobId, {
        status: 'inProgress',
        freelancerWallet: app.freelancerWallet,
      })
      await db.applications.updateStatus(app.id, 'accepted')
      setTxResult({ type: 'success', message: 'Freelancer accepted', txSig: tx })
      refresh()
    } catch (err) {
      console.error('Accept freelancer failed:', err)
      setTxResult({ type: 'error', message: err.message })
    } finally {
      setActionLoading(false)
    }
  }

  async function handleAction(action) {
    setActionLoading(true)
    setTxResult(null)
    try {
      const jobPda = new PublicKey(job.jobAccountPda)
      let result

      if (action === 'submit') {
        result = await submitWork(wallet, connection, { jobPda })
        await db.jobs.update(clientWallet, jobId, { status: 'submitted' })
        setTxResult({ type: 'success', message: 'Work submitted', txSig: result.tx })
      } else if (action === 'release') {
        result = await releasePayment(wallet, connection, {
          jobPda,
          freelancerPubkey: new PublicKey(job.freelancerWallet),
        })
        await db.jobs.update(clientWallet, jobId, { status: 'released' })
        setTxResult({ type: 'success', message: 'Payment released', txSig: result.tx })
        setShowReviewModal(true)
      } else if (action === 'dispute') {
        result = await disputeJob(wallet, connection, { jobPda })
        await db.jobs.update(clientWallet, jobId, { status: 'disputed' })
        setTxResult({ type: 'success', message: 'Dispute filed', txSig: result.tx })
      } else if (action === 'cancel') {
        result = await cancelJob(wallet, connection, { jobPda })
        await db.jobs.update(clientWallet, jobId, { status: 'cancelled' })
        setTxResult({ type: 'success', message: 'Job cancelled, funds refunded', txSig: result.tx })
      }
      refresh()
    } catch (err) {
      console.error(`Action ${action} failed:`, err)
      setTxResult({ type: 'error', message: err.message })
    } finally {
      setActionLoading(false)
    }
  }

  async function handleReviewSubmit({ rating, comment }) {
    setReviewLoading(true)
    try {
      const { mintAddress, txSig } = await mintReviewNft(wallet, connection, {
        freelancerPubkey: new PublicKey(job.freelancerWallet),
        rating,
        comment,
        jobId,
        clientWallet,
      })

      await db.reviews.create({
        jobId,
        freelancerWallet: job.freelancerWallet,
        clientWallet,
        rating,
        comment,
        mintAddress,
        txSig,
      })

      setShowReviewModal(false)
      setTxResult({ type: 'success', message: 'Soulbound review NFT minted', txSig, mintAddress })
      refresh()
    } catch (err) {
      console.error('NFT mint failed:', err)
      setTxResult({ type: 'error', message: `Review mint failed: ${err.message}` })
      setShowReviewModal(false)
    } finally {
      setReviewLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 pt-24 flex justify-center">
        <div className="w-8 h-8 border-2 border-[#e63b2e] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!job) {
    return (
      <div className="max-w-7xl mx-auto p-6 pt-24">
        <p className="text-neutral-500">Job not found.</p>
      </div>
    )
  }

  return (
    <main className="pt-16 min-h-screen">
      <div className="max-w-7xl mx-auto p-6 lg:p-10">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-neutral-800 text-[#537aff] text-[10px] font-bold uppercase tracking-widest border border-neutral-700 rounded">
                {job.status === 'funded' ? 'Active Listing' : job.status}
              </span>
            </div>
            <h1 className="font-display text-3xl font-bold text-white">{job.title}</h1>
          </div>
          <div className="flex items-center gap-3">
            {isClient && job.status === 'funded' && !job.freelancerWallet && (
              <Button variant="outline" onClick={() => handleAction('cancel')} disabled={actionLoading}>
                Cancel & Refund
              </Button>
            )}
            {isFreelancer && job.status === 'inProgress' && (
              <Button variant="brand" onClick={() => handleAction('submit')} disabled={actionLoading}>
                Submit Work
              </Button>
            )}
            {isClient && job.status === 'submitted' && (
              <Button variant="brand" onClick={() => handleAction('release')} disabled={actionLoading}>
                Release Payment
              </Button>
            )}
            {(isClient || isFreelancer) && (job.status === 'inProgress' || job.status === 'submitted') && (
              <Button variant="destructive" onClick={() => handleAction('dispute')} disabled={actionLoading}>
                Dispute
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-[#1a1a1a] border border-neutral-800 p-8 rounded-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#e63b2e]/10 to-transparent"></div>
              <h2 className="font-display text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#e63b2e]">verified_user</span>
                Job Details
              </h2>
              <div className="text-neutral-300 whitespace-pre-wrap mb-6">{job.description}</div>

              {job.tags?.length > 0 && (
                <div>
                  <h3 className="text-white font-bold uppercase tracking-widest text-xs mb-4">Required Stack</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.tags.map((tag) => (
                      <span key={tag} className="px-4 py-2 bg-neutral-900 border border-neutral-800 text-xs font-display text-white rounded uppercase">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {job.freelancerWallet && (
                <div className="mt-6 flex items-center gap-3 p-4 bg-neutral-900/50 border border-neutral-800 rounded">
                  <span className="material-symbols-outlined text-[#537aff]">person</span>
                  <div>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-widest">Assigned Freelancer</p>
                    <Link to={`/profile/${job.freelancerWallet}`} className="text-white text-sm hover:text-[#e63b2e] transition-colors">
                      {nameMap[job.freelancerWallet] || shortenAddress(job.freelancerWallet)}
                    </Link>
                  </div>
                </div>
              )}
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-neutral-800 rounded flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#537aff]">schedule</span>
                  </div>
                  <div>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-widest">Escrow Type</p>
                    <p className="text-white font-bold">Full Upfront</p>
                  </div>
                </div>
              </div>
              <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-neutral-800 rounded flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#537aff]">work_outline</span>
                  </div>
                  <div>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-widest">Commitment</p>
                    <p className="text-white font-bold">Project Based</p>
                  </div>
                </div>
              </div>
            </div>

            {job.status === 'funded' && (
              <section className="bg-[#1a1a1a] border border-neutral-800 p-8 rounded-lg">
                <h2 className="font-display text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-neutral-400">description</span>
                  Applications ({applications.length})
                </h2>
                <div className="space-y-4">
                  {applications.map((app) => (
                    <div key={app.id} className="p-4 bg-[#1a1a1a]/50 border border-neutral-800 hover:border-neutral-600 rounded transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <Link to={`/profile/${app.freelancerWallet}`} className="font-display text-sm font-medium text-white hover:text-[#e63b2e] transition-colors">
                            {nameMap[app.freelancerWallet] || shortenAddress(app.freelancerWallet)}
                          </Link>
                          <p className="text-neutral-400 text-sm mt-1">{app.coverLetter}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-4 shrink-0">
                          {isClient && app.status === 'pending' && (
                            <Button
                              variant="brand"
                              size="sm"
                              onClick={() => handleAccept(app)}
                              disabled={actionLoading}
                            >
                              Accept
                            </Button>
                          )}
                          <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-neutral-500">{app.status}</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {canApply && (
                    <form onSubmit={handleApply} className="space-y-3 border-t border-neutral-800 pt-4">
                      <textarea
                        className="w-full rounded border border-white/10 bg-white/5 text-white focus:border-[#e63b2e] focus:ring-1 focus:ring-[#e63b2e] px-4 py-2 text-sm min-h-[80px]"
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        placeholder="Why are you a good fit for this job?"
                        required
                      />
                      <Button type="submit" variant="brand">Apply</Button>
                    </form>
                  )}
                </div>
              </section>
            )}

            {job.freelancerWallet && (isClient || isFreelancer) && (
              <section className="bg-[#1a1a1a] border border-neutral-800 rounded-lg overflow-hidden">
                <div className="p-6 border-b border-neutral-800">
                  <h2 className="font-display text-xl font-semibold text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-neutral-400">chat</span>
                    Messages
                  </h2>
                </div>
                <div className="h-80 overflow-y-auto p-6 space-y-4">
                  {messages.length === 0 && (
                    <p className="text-neutral-500 text-sm text-center py-8">No messages yet. Start the conversation.</p>
                  )}
                  {messages.map((msg) => {
                    const isMine = msg.senderWallet === publicKey?.toBase58()
                    const senderName = nameMap[msg.senderWallet] || shortenAddress(msg.senderWallet)
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, x: isMine ? 16 : -16, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                        className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                      >
                        <span className="text-[10px] text-neutral-500 font-display uppercase tracking-widest mb-1">
                          {senderName}
                        </span>
                        <div className={`max-w-[80%] px-4 py-2.5 rounded-lg text-sm ${isMine ? 'bg-[#e63b2e] text-white' : 'bg-neutral-800 text-neutral-200'}`}>
                          {msg.text}
                        </div>
                        <span className="text-[9px] text-neutral-600 mt-1">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </motion.div>
                    )
                  })}
                  <div ref={chatEndRef} />
                </div>
                <form onSubmit={handleSendMessage} className="p-4 border-t border-neutral-800 flex gap-3">
                  <input
                    className="flex-1 bg-neutral-800 border-none text-white px-4 py-2.5 rounded-lg text-sm focus:ring-1 focus:ring-[#e63b2e] outline-none"
                    value={msgText}
                    onChange={(e) => setMsgText(e.target.value)}
                    placeholder="Type a message..."
                  />
                  <Button type="submit" variant="brand" disabled={!msgText.trim()}>Send</Button>
                </form>
              </section>
            )}
          </div>

          <aside className="space-y-6">
            <div className="bg-[#1a1a1a] border border-neutral-800 p-8 rounded-lg">
              <p className="text-xs text-neutral-500 uppercase tracking-[0.2em] mb-2 font-bold">Total Budget</p>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-black text-white font-display tracking-tighter font-mono tabular-nums">{lamportsToSol(job.amount)}</span>
                <span className="text-xl text-neutral-400 font-bold tracking-tight">SOL</span>
              </div>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center py-3 border-b border-neutral-800">
                  <span className="text-xs text-neutral-500 uppercase font-medium">Escrow Status</span>
                  <span className="flex items-center gap-1.5 text-[#e63b2e] text-xs font-bold uppercase">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                    {STATUS_LABELS[job.status] || job.status}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-neutral-800">
                  <span className="text-xs text-neutral-500 uppercase font-medium">Platform Fee</span>
                  <span className="text-xs text-neutral-300">0.00%</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-xs text-neutral-500 uppercase font-medium">Client</span>
                  <Link to={`/profile/${job.clientWallet}`} className="text-xs text-white hover:text-[#e63b2e] transition-colors">
                    {nameMap[job.clientWallet] || shortenAddress(job.clientWallet)}
                  </Link>
                </div>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 p-4 rounded">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#537aff]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  <div>
                    <p className="text-xs font-bold text-white mb-1">Guaranteed Payment</p>
                    <p className="text-[10px] text-neutral-500 leading-relaxed">Funds are locked in a smart contract and released upon milestone completion.</p>
                  </div>
                </div>
              </div>
            </div>

            {actionLoading && (
              <div className="p-4 border border-[#537aff]/20 bg-[#537aff]/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-[#537aff] border-t-transparent rounded-full animate-spin" />
                  <div>
                    <p className="text-[10px] text-[#537aff] font-bold uppercase tracking-widest">Processing</p>
                    <p className="text-xs text-neutral-400">Confirm in Phantom...</p>
                  </div>
                </div>
              </div>
            )}

            {txResult && (
              <div className={`p-4 rounded-lg border ${txResult.type === 'success' ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
                <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${txResult.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                  {txResult.type === 'success' ? 'Transaction Confirmed' : 'Transaction Failed'}
                </p>
                <p className="text-xs text-neutral-300 mb-2">{txResult.message}</p>
                {txResult.txSig && (
                  <a
                    href={explorerUrl(txResult.txSig, 'tx')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] text-[#537aff] hover:text-[#e63b2e] font-display uppercase tracking-widest transition-colors"
                  >
                    View on Solana Explorer
                    <span className="material-symbols-outlined text-xs">open_in_new</span>
                  </a>
                )}
                {txResult.mintAddress && (
                  <a
                    href={explorerUrl(txResult.mintAddress)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] text-[#537aff] hover:text-[#e63b2e] font-display uppercase tracking-widest transition-colors ml-4"
                  >
                    View NFT
                    <span className="material-symbols-outlined text-xs">open_in_new</span>
                  </a>
                )}
              </div>
            )}

            {job.jobAccountPda && (
              <div className="p-4 border border-neutral-800 bg-neutral-900/50 rounded-lg">
                <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mb-2">Escrow Account (PDA)</p>
                <a
                  href={explorerUrl(job.jobAccountPda)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-white font-mono hover:text-[#e63b2e] transition-colors flex items-center gap-1"
                >
                  {shortenAddress(job.jobAccountPda, 8)}
                  <span className="material-symbols-outlined text-xs text-neutral-500">open_in_new</span>
                </a>
              </div>
            )}

            {job.txSig && (
              <div className="p-4 border border-neutral-800 bg-neutral-900/50 rounded-lg">
                <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mb-2">Creation Transaction</p>
                <a
                  href={explorerUrl(job.txSig, 'tx')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-white font-mono hover:text-[#e63b2e] transition-colors flex items-center gap-1"
                >
                  {shortenAddress(job.txSig, 8)}
                  <span className="material-symbols-outlined text-xs text-neutral-500">open_in_new</span>
                </a>
              </div>
            )}
          </aside>
        </div>
      </div>

      <ReviewModal
        open={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onSubmit={handleReviewSubmit}
        loading={reviewLoading}
      />
    </main>
  )
}
