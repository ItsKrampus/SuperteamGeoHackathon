import { Link } from 'react-router-dom'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Button } from '@/components/ui/button'
import { useProfile } from '@/contexts/ProfileContext'

export default function Home() {
  const { connected } = useWallet()
  const { profile } = useProfile()
  const canPost = !profile?.role || profile.role !== 'freelancer'

  return (
    <main className="pt-16">
      <section className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-6 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#e63b2e] rounded-full blur-[120px]"></div>
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-600 rounded-full blur-[120px]"></div>
        </div>

        <div className="relative z-10 max-w-5xl text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-800 border border-neutral-700 rounded-full">
            <span className="flex h-2 w-2 rounded-full bg-[#e63b2e]"></span>
            <span className="font-display text-xs text-neutral-400 uppercase tracking-widest">Built on Solana</span>
          </div>

          <h1 className="font-display text-[56px] md:text-[64px] leading-[1.1] font-black text-white tracking-tighter uppercase md:px-12">
            Connect Wallet. <span className="text-[#e63b2e]">Start Working.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg text-neutral-400">
            No signup. No email verification. No middleman fees. Your Solana wallet is your identity — profiles live on-chain as soulbound NFTs, payments are secured by smart contract escrow, and every review is permanently minted to the blockchain.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-6">
            {connected ? (
              <>
                <Button asChild variant="default" size="lg">
                  <Link to="/jobs" className="flex items-center gap-2">
                    Browse Jobs
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </Link>
                </Button>
                {canPost && (
                  <Button asChild variant="outline" size="lg">
                    <Link to="/jobs/new">Post a Job</Link>
                  </Button>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <WalletMultiButton />
                <p className="text-sm text-neutral-500">That's it. No forms, no passwords.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="font-display text-xs text-[#e63b2e] uppercase tracking-[0.2em]">Why On-Chain</span>
          <h2 className="font-display mt-4 text-4xl font-bold uppercase">Everything Verifiable. Nothing Hidden.</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-xl">
            <div className="w-14 h-14 bg-[#e63b2e]/10 border border-[#e63b2e]/30 rounded-lg flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-[#e63b2e] text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>fingerprint</span>
            </div>
            <h3 className="font-display text-xl font-semibold mb-3">Soulbound Identity</h3>
            <p className="text-neutral-400 text-sm leading-relaxed mb-4">
              Your profile is a non-transferable NFT minted via Token-2022. Connect any wallet that holds your Profile SBT and your identity loads instantly — no database, no account recovery.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="text-[10px] font-display bg-neutral-800 text-neutral-400 px-2 py-1 rounded uppercase border border-neutral-700">Token-2022</span>
              <span className="text-[10px] font-display bg-neutral-800 text-neutral-400 px-2 py-1 rounded uppercase border border-neutral-700">NonTransferable</span>
              <span className="text-[10px] font-display bg-neutral-800 text-neutral-400 px-2 py-1 rounded uppercase border border-neutral-700">MetadataPointer</span>
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-xl">
            <div className="w-14 h-14 bg-[#537aff]/10 border border-[#537aff]/30 rounded-lg flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-[#537aff] text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
            </div>
            <h3 className="font-display text-xl font-semibold mb-3">Programmable Escrow</h3>
            <p className="text-neutral-400 text-sm leading-relaxed mb-4">
              Funds are locked in a PDA controlled by an Anchor smart contract. Payment releases only when the client approves — no trust required, no third party involved. 0% platform fee.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="text-[10px] font-display bg-neutral-800 text-neutral-400 px-2 py-1 rounded uppercase border border-neutral-700">Anchor</span>
              <span className="text-[10px] font-display bg-neutral-800 text-neutral-400 px-2 py-1 rounded uppercase border border-neutral-700">PDA Escrow</span>
              <span className="text-[10px] font-display bg-neutral-800 text-neutral-400 px-2 py-1 rounded uppercase border border-neutral-700">0% Fee</span>
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-xl">
            <div className="w-14 h-14 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-green-400 text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            </div>
            <h3 className="font-display text-xl font-semibold mb-3">Immutable Reviews</h3>
            <p className="text-neutral-400 text-sm leading-relaxed mb-4">
              After job completion, the client mints a soulbound review NFT directly to the freelancer's wallet. Ratings can't be edited, deleted, or faked — they're permanent proof of work.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="text-[10px] font-display bg-neutral-800 text-neutral-400 px-2 py-1 rounded uppercase border border-neutral-700">Soulbound</span>
              <span className="text-[10px] font-display bg-neutral-800 text-neutral-400 px-2 py-1 rounded uppercase border border-neutral-700">Immutable</span>
              <span className="text-[10px] font-display bg-neutral-800 text-neutral-400 px-2 py-1 rounded uppercase border border-neutral-700">Portable</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-neutral-950 border-y border-neutral-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <span className="font-display text-xs text-[#e63b2e] uppercase tracking-[0.2em]">How It Works</span>
            <h2 className="font-display mt-4 text-4xl font-bold uppercase">From Posting to Payment in 4 Steps</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-px bg-neutral-800"></div>
            {[
              { num: '01', title: 'Connect Wallet', desc: 'Your soulbound Profile NFT loads automatically. No signup form — your wallet is your account.', color: 'border-[#e63b2e]' },
              { num: '02', title: 'Post or Apply', desc: 'Clients deploy jobs with SOL locked in escrow. Freelancers browse and apply with a cover letter.', color: 'border-[#537aff]' },
              { num: '03', title: 'Work & Submit', desc: 'Freelancer delivers the work. Smart contract tracks status on-chain throughout the lifecycle.', color: 'border-yellow-500' },
              { num: '04', title: 'Get Paid + Review', desc: 'Client approves, escrow releases instantly. A soulbound review NFT is minted as proof of completion.', color: 'border-green-500' },
            ].map((step) => (
              <div key={step.num} className="relative group">
                <div className={`w-14 h-14 bg-neutral-900 border-2 ${step.color} flex items-center justify-center mb-6 relative z-10`}>
                  <span className="font-display text-lg font-semibold text-white">{step.num}</span>
                </div>
                <h4 className="font-display text-lg font-semibold mb-3">{step.title}</h4>
                <p className="text-neutral-400 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto bg-[#e63b2e] p-12 text-center rounded-[4px] relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <span className="material-symbols-outlined text-[300px] absolute -right-20 -bottom-20" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
          </div>
          <div className="relative z-10">
            <h2 className="font-display text-4xl font-bold mb-4 uppercase text-white">Your wallet is your resume.</h2>
            <p className="text-white/80 mb-10 text-lg max-w-xl mx-auto">Every job you complete, every review you earn — it's all on-chain, portable, and yours forever.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {connected ? (
                <>
                  {canPost && (
                    <Link to="/jobs/new" className="bg-white text-[#e63b2e] px-8 py-4 font-display font-bold uppercase tracking-tighter hover:bg-neutral-100 transition-all active:scale-95">
                      Post a Job
                    </Link>
                  )}
                  <Link to="/jobs" className="border border-white text-white px-8 py-4 font-display font-bold uppercase tracking-tighter hover:bg-white/10 transition-all active:scale-95">
                    Browse Jobs
                  </Link>
                </>
              ) : (
                <WalletMultiButton />
              )}
            </div>
          </div>
        </div>
      </section>

      <footer className="w-full py-8 px-6 flex flex-col md:flex-row justify-between items-center bg-card border-t border-neutral-800">
        <div className="flex flex-col items-center md:items-start gap-2 mb-6 md:mb-0">
          <span className="font-display font-black text-white uppercase tracking-tight">PROOFWORK</span>
          <p className="font-display text-xs tracking-widest uppercase text-neutral-500">Built on Solana. Powered by Smart Contracts.</p>
        </div>
      </footer>
    </main>
  )
}
