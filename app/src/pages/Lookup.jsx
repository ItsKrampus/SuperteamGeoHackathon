import { useState } from 'react'
import { PublicKey } from '@solana/web3.js'
import { Link } from 'react-router-dom'
import { shortenAddress, explorerUrl } from '@/lib/solana'
import { useOnChainProfile } from '@/hooks/useOnChainProfile'
import { useOnChainReviews } from '@/hooks/useOnChainReviews'
import { useOnChainProfiles } from '@/hooks/useOnChainProfiles'

function isValidPubkey(input) {
  try {
    new PublicKey(input)
    return true
  } catch {
    return false
  }
}

export default function Lookup() {
  const [searchInput, setSearchInput] = useState('')
  const [activeWallet, setActiveWallet] = useState(null)
  const [inputError, setInputError] = useState(null)

  const { profile, loading: profileLoading, error: profileError } = useOnChainProfile(activeWallet)
  const { reviews, loading: reviewsLoading } = useOnChainReviews(activeWallet)

  const reviewerWallets = [...new Set((reviews || []).map((r) => r.clientWallet).filter(Boolean))]
  const { profiles: reviewerProfiles } = useOnChainProfiles(reviewerWallets)

  const loading = profileLoading || reviewsLoading
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = searchInput.trim()
    if (!trimmed) return

    if (!isValidPubkey(trimmed)) {
      setInputError('Invalid Solana address')
      return
    }

    setInputError(null)
    setActiveWallet(trimmed)
  }

  return (
    <main className="pt-16 min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-12 lg:py-16">
        <div className="text-center mb-10">
          <span className="font-display text-xs text-[#e63b2e] uppercase tracking-[0.2em]">Protocol Explorer</span>
          <h1 className="font-display text-4xl md:text-5xl font-black tracking-tighter uppercase mt-3 mb-4">
            Your Wallet Is Your <span className="text-[#e63b2e]">Resume</span>
          </h1>
          <p className="text-zinc-400 max-w-lg mx-auto">
            Look up any Solana wallet to see their soulbound profile and immutable review NFTs — all verified on-chain.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mb-12">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value)
                  if (inputError) setInputError(null)
                }}
                placeholder="Enter a Solana wallet address..."
                className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 rounded-lg font-mono text-sm focus:ring-2 focus:ring-[#e63b2e] focus:border-transparent outline-none transition-all placeholder:text-zinc-500"
                aria-label="Wallet address"
                spellCheck={false}
                autoComplete="off"
              />
              {inputError && (
                <p className="absolute -bottom-6 left-0 text-xs text-red-400 font-display">{inputError}</p>
              )}
            </div>
            <button
              type="submit"
              className="bg-[#e63b2e] hover:bg-[#d1332a] text-white px-5 py-3 rounded-lg font-display text-sm font-bold uppercase tracking-wider transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-[#e63b2e] focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 min-w-[48px] min-h-[48px] flex items-center justify-center"
              aria-label="Search wallet"
            >
              <span className="material-symbols-outlined">search</span>
            </button>
          </div>
        </form>

        {!activeWallet && !loading && (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-4xl text-zinc-600" style={{ fontVariationSettings: "'FILL' 1" }}>fingerprint</span>
            </div>
            <h2 className="font-display text-lg font-semibold uppercase tracking-tight mb-2">On-Chain Identity Lookup</h2>
            <p className="text-zinc-500 text-sm max-w-md mx-auto">
              Paste any wallet address above to view their soulbound profile NFT and review history. No wallet connection required.
            </p>
          </div>
        )}

        {loading && (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-[#e63b2e] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-zinc-400 font-display">Scanning on-chain data...</p>
          </div>
        )}

        {activeWallet && !loading && (
          <div className="space-y-6">
            {profileError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center justify-between">
                <p className="text-sm text-red-400">Failed to fetch on-chain data.</p>
                <button
                  onClick={() => { setActiveWallet(null); setTimeout(() => setActiveWallet(searchInput.trim()), 0) }}
                  className="font-display text-xs text-red-400 uppercase underline hover:text-red-300 focus-visible:ring-2 focus-visible:ring-red-400 rounded"
                >
                  Retry
                </button>
              </div>
            )}

            <section className="bg-[#242424] rounded-xl border border-zinc-800 p-6 md:p-8">
              {profile ? (
                <div className="flex flex-col md:flex-row items-start gap-6">
                  <div className="relative shrink-0">
                    <div className="w-24 h-24 rounded-lg bg-zinc-800 border-4 border-zinc-800 flex items-center justify-center">
                      <span className="material-symbols-outlined text-4xl text-zinc-600">person</span>
                    </div>
                    {profile.onChain && (
                      <div className="absolute -bottom-2 -right-2 bg-[#e63b2e] text-white p-1.5 rounded-full shadow-lg border-2 border-[#242424]">
                        <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-display text-2xl font-bold tracking-tight mb-1">
                      {profile.displayName || shortenAddress(activeWallet)}
                    </h2>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      {profile.role && (
                        <span className="font-display text-[10px] bg-zinc-800 text-zinc-400 px-3 py-1 rounded-full uppercase border border-zinc-700">
                          {profile.role === 'both' ? 'Verified Member' : `Verified ${profile.role}`}
                        </span>
                      )}
                      {profile.onChain && (
                        <span className="font-display text-[10px] bg-[#e63b2e]/10 text-[#e63b2e] px-3 py-1 rounded-full uppercase border border-[#e63b2e]/30">
                          On-Chain Identity
                        </span>
                      )}
                      {profile.mintAddress && (
                        <a
                          href={explorerUrl(profile.mintAddress)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-display text-[10px] bg-[#537aff]/10 text-[#537aff] px-3 py-1 rounded-full uppercase border border-[#537aff]/30 hover:bg-[#537aff]/20 transition-colors flex items-center gap-1"
                        >
                          Profile SBT
                          <span className="material-symbols-outlined text-xs">open_in_new</span>
                        </a>
                      )}
                    </div>
                    {profile.bio && (
                      <p className="text-zinc-400 text-sm leading-relaxed mb-4">{profile.bio}</p>
                    )}
                    {profile.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.map((s) => (
                          <span key={s} className="font-display text-[11px] bg-zinc-900 border border-zinc-700 text-white px-3 py-1.5 rounded uppercase">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <span className="material-symbols-outlined text-4xl text-zinc-600 mb-3 block">person_off</span>
                  <h3 className="font-display text-lg font-semibold uppercase tracking-tight mb-2">No Soulbound Profile Found</h3>
                  <p className="text-zinc-500 text-sm max-w-md mx-auto">
                    This wallet hasn't minted a Profile NFT on ProofWork yet.
                  </p>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-zinc-800 flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-1.5 text-[#e63b2e] font-display text-[10px] uppercase">
                  <span className="material-symbols-outlined text-sm">account_balance_wallet</span>
                  <span className="font-mono text-xs">{shortenAddress(activeWallet)}</span>
                </span>
                <a
                  href={explorerUrl(activeWallet)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-display text-[10px] text-[#537aff] uppercase hover:underline flex items-center gap-1"
                >
                  View on Explorer
                  <span className="material-symbols-outlined text-xs">open_in_new</span>
                </a>
                <Link
                  to={`/profile/${activeWallet}`}
                  className="font-display text-[10px] text-zinc-400 uppercase hover:text-white transition-colors flex items-center gap-1"
                >
                  Full Profile
                  <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </Link>
              </div>
            </section>

            {reviews.length > 0 && (
              <div className="flex items-center gap-4 px-1">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#e63b2e]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="font-display text-lg font-bold text-white">{avgRating}</span>
                </div>
                <span className="text-zinc-600">|</span>
                <span className="font-display text-xs text-zinc-400 uppercase tracking-wider">
                  {reviews.length} Soulbound {reviews.length === 1 ? 'Review' : 'Reviews'}
                </span>
              </div>
            )}

            {reviews.length > 0 ? (
              <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reviews.map((r, idx) => (
                  <div key={r.mintAddress || idx} className="bg-[#242424] p-5 rounded-xl border border-zinc-800 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }, (_, i) => (
                            <span
                              key={i}
                              className={`material-symbols-outlined text-sm ${i < r.rating ? 'text-[#e63b2e]' : 'text-zinc-600'}`}
                              style={{ fontVariationSettings: i < r.rating ? "'FILL' 1" : "'FILL' 0" }}
                              aria-hidden="true"
                            >
                              star
                            </span>
                          ))}
                        </div>
                        {r.onChain && r.mintAddress && (
                          <a
                            href={explorerUrl(r.mintAddress)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-display text-[9px] bg-[#e63b2e]/10 text-[#e63b2e] px-2 py-0.5 rounded uppercase border border-[#e63b2e]/30 hover:bg-[#e63b2e]/20 transition-colors"
                          >
                            Verified On-Chain
                          </a>
                        )}
                      </div>
                      {r.comment && (
                        <p className="text-sm italic text-zinc-300 leading-relaxed">"{r.comment}"</p>
                      )}
                    </div>
                    <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between">
                      <span className="font-display text-[10px] text-zinc-500 uppercase tracking-widest">
                        — {reviewerProfiles[r.clientWallet]?.displayName || shortenAddress(r.clientWallet)}
                      </span>
                      {r.jobId && (
                        <Link
                          to={`/jobs/${r.clientWallet}_${r.jobId}`}
                          className="font-display text-[10px] text-zinc-500 uppercase hover:text-[#e63b2e] transition-colors"
                        >
                          View Job
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </section>
            ) : (
              !reviewsLoading && (
                <section className="bg-[#242424] rounded-xl border border-zinc-800 p-8 text-center">
                  <span className="material-symbols-outlined text-3xl text-zinc-600 mb-3 block" aria-hidden="true">rate_review</span>
                  <h3 className="font-display text-sm font-semibold uppercase tracking-tight mb-1">No Soulbound Reviews Yet</h3>
                  <p className="text-zinc-500 text-xs">
                    This wallet hasn't received any review NFTs from completed jobs.
                  </p>
                </section>
              )
            )}
          </div>
        )}
      </div>
    </main>
  )
}
