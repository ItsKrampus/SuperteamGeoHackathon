import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useWallet } from '@solana/wallet-adapter-react'
import { db } from '@/lib/db'
import { shortenAddress, lamportsToSol, explorerUrl } from '@/lib/solana'
import { Button } from '@/components/ui/button'
import { useProfile } from '@/contexts/ProfileContext'
import { useOnChainProfile } from '@/hooks/useOnChainProfile'
import { useOnChainReviews } from '@/hooks/useOnChainReviews'
import { useOnChainProfiles } from '@/hooks/useOnChainProfiles'
import OnboardingModal from '@/components/OnboardingModal'

export default function Profile() {
  const { wallet: walletParam } = useParams()
  const { publicKey, connected } = useWallet()
  const isOwn = connected && publicKey?.toBase58() === walletParam

  const { profile: ownProfile, needsOnboarding, updateProfile, mintAddress, loading: profileLoading } = useProfile()
  const { profile: otherProfile, loading: otherLoading } = useOnChainProfile(isOwn ? null : walletParam)
  const { reviews: onChainReviews, loading: reviewsLoading } = useOnChainReviews(walletParam)

  const profile = isOwn ? ownProfile : otherProfile
  const loading = isOwn ? profileLoading : otherLoading
  const reviewerWallets = [...new Set((onChainReviews || []).map((r) => r.clientWallet).filter(Boolean))]
  const { profiles: reviewerProfiles } = useOnChainProfiles(reviewerWallets)

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ displayName: '', bio: '', skills: '', role: 'both' })
  const [localReviews, setLocalReviews] = useState([])
  const [jobs, setJobs] = useState([])
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    if (profile) {
      setForm({
        displayName: profile.displayName || '',
        bio: profile.bio || '',
        skills: (profile.skills || []).join(', '),
        role: profile.role || 'both',
      })
    }
  }, [profile])

  useEffect(() => {
    db.reviews.listForFreelancer(walletParam).then(setLocalReviews)
    db.jobs.list({ clientWallet: walletParam }).then(setJobs)
  }, [walletParam])

  useEffect(() => {
    if (isOwn && needsOnboarding && !loading) {
      setShowOnboarding(true)
    }
  }, [isOwn, needsOnboarding, loading])

  // Merge on-chain and localStorage reviews, deduplicate by mintAddress
  const reviews = (() => {
    const byMint = new Map()
    for (const r of onChainReviews) {
      byMint.set(r.mintAddress, r)
    }
    for (const r of localReviews) {
      if (r.mintAddress && !byMint.has(r.mintAddress)) {
        byMint.set(r.mintAddress, r)
      } else if (!r.mintAddress) {
        byMint.set(r.id, r)
      }
    }
    return Array.from(byMint.values())
  })()

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setSaveError(null)
    try {
      const data = {
        displayName: form.displayName,
        bio: form.bio,
        skills: form.skills,
        role: form.role,
      }
      if (mintAddress) {
        await updateProfile(data)
      } else {
        await db.profiles.upsert(walletParam, {
          ...data,
          skills: data.skills.split(',').map((s) => s.trim()).filter(Boolean),
        })
      }
      setEditing(false)
    } catch (err) {
      console.error('Profile save failed:', err)
      setSaveError(err.message || 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const inputClass = "w-full bg-zinc-800 border-zinc-700 text-white p-3 rounded-lg focus:ring-2 focus:ring-[#e63b2e] focus:border-transparent outline-none transition-all duration-200 text-sm"

  if (loading) {
    return (
      <main className="pt-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#e63b2e] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-zinc-400 font-display">Loading on-chain profile...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="pt-16 min-h-screen">
      {showOnboarding && (
        <OnboardingModal onClose={() => setShowOnboarding(false)} />
      )}

      <div className="max-w-7xl mx-auto p-6 lg:p-10">
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-start gap-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-lg bg-zinc-800 border-4 border-zinc-800 shadow-2xl flex items-center justify-center">
                <span className="material-symbols-outlined text-5xl text-zinc-600">person</span>
              </div>
              {profile?.onChain && (
                <div className="absolute -bottom-2 -right-2 bg-[#e63b2e] text-white p-1.5 rounded-full shadow-lg border-2 border-zinc-900">
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                </div>
              )}
            </div>
            <div className="pt-4">
              <h1 className="font-display text-4xl font-bold tracking-tight mb-1">
                {profile?.displayName || shortenAddress(walletParam)}
              </h1>
              <div className="flex items-center gap-3 mb-4">
                {profile?.role && (
                  <span className="font-display text-[10px] bg-zinc-800 text-zinc-400 px-3 py-1 rounded-full uppercase border border-zinc-700">
                    {profile.role === 'both' ? 'Verified Member' : `Verified ${profile.role}`}
                  </span>
                )}
                {profile?.onChain && (
                  <span className="font-display text-[10px] bg-[#e63b2e]/10 text-[#e63b2e] px-3 py-1 rounded-full uppercase border border-[#e63b2e]/30">
                    On-Chain Identity
                  </span>
                )}
                {mintAddress && (
                  <a
                    href={explorerUrl(mintAddress)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-display text-[10px] bg-[#537aff]/10 text-[#537aff] px-3 py-1 rounded-full uppercase border border-[#537aff]/30 hover:bg-[#537aff]/20 transition-colors flex items-center gap-1"
                  >
                    Profile SBT
                    <span className="material-symbols-outlined text-xs">open_in_new</span>
                  </a>
                )}
                <span className="flex items-center gap-1 text-[#e63b2e] font-display text-[10px] uppercase">
                  <span className="material-symbols-outlined text-sm">account_balance_wallet</span>
                  {shortenAddress(walletParam)}
                </span>
              </div>
              {profile?.bio && (
                <p className="max-w-md text-zinc-400 text-sm leading-relaxed">{profile.bio}</p>
              )}
            </div>
          </div>
          <div className="pb-1">
            {isOwn && !editing && profile && (
              <button
                onClick={() => setEditing(true)}
                className="font-display text-sm font-bold tracking-widest border-2 border-zinc-700 hover:border-[#e63b2e] hover:text-[#e63b2e] px-8 py-3 rounded-lg transition-all active:scale-95 uppercase focus-visible:ring-2 focus-visible:ring-[#e63b2e] focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900"
              >
                Edit Profile
              </button>
            )}
            {!profile && isOwn && (
              <Button variant="brand" onClick={() => setShowOnboarding(true)} size="lg">
                Create Profile
              </Button>
            )}
          </div>
        </header>

        {editing && (
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-lg mb-8">
            <h2 className="font-display text-xl font-semibold text-white mb-2">Edit Profile</h2>
            {mintAddress && (
              <p className="text-xs text-zinc-500 mb-6">Changes will be saved on-chain (requires transaction signing).</p>
            )}
            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                <label className="font-display text-xs text-zinc-500 uppercase tracking-widest">Display Name</label>
                <input className={inputClass} value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} placeholder="Your display name" maxLength={50} />
              </div>
              <div className="space-y-2">
                <label className="font-display text-xs text-zinc-500 uppercase tracking-widest">Bio</label>
                <textarea className={`${inputClass} min-h-[80px]`} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Tell clients about your expertise..." maxLength={200} />
              </div>
              <div className="space-y-2">
                <label className="font-display text-xs text-zinc-500 uppercase tracking-widest">Skills (comma-separated)</label>
                <input className={inputClass} value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="Rust, Solidity, React, TypeScript" />
              </div>
              <div className="space-y-2">
                <label className="font-display text-xs text-zinc-500 uppercase tracking-widest">Role</label>
                <select className={inputClass} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option value="client">Client</option>
                  <option value="freelancer">Freelancer</option>
                  <option value="both">Both</option>
                </select>
              </div>
              {saveError && (
                <p className="text-sm text-red-400">{saveError}</p>
              )}
              <div className="flex gap-3">
                <Button type="submit" variant="brand" disabled={saving}>
                  {saving ? 'Saving...' : mintAddress ? 'Save On-Chain' : 'Save'}
                </Button>
                <Button variant="outline" type="button" onClick={() => setEditing(false)} disabled={saving}>Cancel</Button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-4 space-y-4">
            {!editing && profile?.skills?.length > 0 && (
              <section className="bg-[#242424] p-6 rounded-xl border border-zinc-800">
                <h2 className="font-display text-sm mb-4 uppercase tracking-widest text-zinc-500 border-b border-zinc-800 pb-2 flex justify-between items-center">
                  Technical Stack
                  <span className="material-symbols-outlined text-xs">terminal</span>
                </h2>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((s) => (
                    <span key={s} className="font-display text-[11px] bg-zinc-900 border border-zinc-700 text-white px-3 py-1.5 rounded uppercase">
                      {s}
                    </span>
                  ))}
                </div>
              </section>
            )}

            <section className="bg-[#242424] p-6 rounded-xl border border-zinc-800">
              <h2 className="font-display text-sm mb-4 uppercase tracking-widest text-zinc-500 border-b border-zinc-800 pb-2">Network Stats</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-display text-zinc-400 uppercase">Jobs Posted</span>
                  <span className="text-sm font-display font-semibold text-white">{jobs.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-display text-zinc-400 uppercase">Reviews</span>
                  <span className="text-sm font-display font-semibold text-white">{reviews.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-display text-zinc-400 uppercase">Avg Rating</span>
                  <span className="text-sm font-display font-semibold text-[#e63b2e]">
                    {reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : '—'}
                  </span>
                </div>
              </div>
            </section>
          </div>

          <div className="col-span-12 lg:col-span-8 space-y-4">
            {jobs.length > 0 && (
              <section className="bg-[#242424] p-6 rounded-xl border border-zinc-800">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-display text-lg font-semibold tracking-tight">Completed Gigs</h2>
                  <span className="text-xs font-display text-[#e63b2e] bg-[#e63b2e]/10 px-2 py-1 rounded uppercase">{jobs.length} contracts</span>
                </div>
                <div className="space-y-1">
                  {jobs.map((j) => (
                    <Link
                      key={`${j.clientWallet}_${j.jobId}`}
                      to={`/jobs/${j.clientWallet}_${j.jobId}`}
                      className="group p-4 flex items-center justify-between border-b border-zinc-800 last:border-0 hover:bg-zinc-800/30 transition-all rounded"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-zinc-800 rounded flex items-center justify-center border border-zinc-700">
                          <span className="material-symbols-outlined text-zinc-400">description</span>
                        </div>
                        <div>
                          <h3 className="font-display text-base leading-tight group-hover:text-[#e63b2e] transition-colors">{j.title}</h3>
                          <p className="text-[11px] font-display text-zinc-500 uppercase tracking-wider">
                            {j.status === 'released' ? 'Completed' : j.status}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-display text-sm text-white block font-mono tabular-nums">{lamportsToSol(j.amount)} SOL</span>
                        <span className="text-[10px] font-display text-zinc-500 uppercase">
                          {j.status === 'released' ? 'Settled On-Chain' : j.status}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {(reviews.length > 0 || reviewsLoading) && (
              <section className="bg-[#242424] p-6 rounded-xl border border-zinc-800">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-display text-lg font-semibold tracking-tight">Soulbound Reviews</h2>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#e63b2e]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="font-display text-white font-semibold">
                      {reviews.length > 0
                        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                        : '—'}
                    </span>
                  </div>
                </div>
                {reviewsLoading && reviews.length === 0 && (
                  <p className="text-sm text-zinc-500">Fetching on-chain reviews...</p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reviews.map((r, idx) => (
                    <div key={r.mintAddress || r.id || idx} className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }, (_, i) => (
                              <span
                                key={i}
                                className={`material-symbols-outlined text-sm ${i < r.rating ? 'text-[#e63b2e]' : 'text-zinc-600'}`}
                                style={{ fontVariationSettings: i < r.rating ? "'FILL' 1" : "'FILL' 0" }}
                              >
                                star
                              </span>
                            ))}
                          </div>
                          {r.onChain ? (
                            <a
                              href={explorerUrl(r.mintAddress)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-display text-[9px] bg-[#e63b2e]/10 text-[#e63b2e] px-2 py-0.5 rounded uppercase border border-[#e63b2e]/30 hover:bg-[#e63b2e]/20 transition-colors"
                            >
                              Verified On-Chain
                            </a>
                          ) : r.mintAddress ? (
                            <span className="font-display text-[9px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded uppercase border border-zinc-700">Verified SBT</span>
                          ) : null}
                        </div>
                        {r.comment && (
                          <p className="text-sm italic text-zinc-300 leading-relaxed">"{r.comment}"</p>
                        )}
                      </div>
                      <div className="mt-4 pt-4 border-t border-zinc-800">
                        <span className="font-display text-[10px] text-zinc-500 uppercase tracking-widest">
                          — {reviewerProfiles[r.clientWallet]?.displayName || shortenAddress(r.clientWallet)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
