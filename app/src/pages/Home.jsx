import { Link } from 'react-router-dom'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Button } from '@/components/ui/button'

export default function Home() {
  const { connected } = useWallet()

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
            <span className="font-display text-xs text-neutral-400 uppercase tracking-widest">Devnet Live</span>
          </div>

          <h1 className="font-display text-[64px] leading-[1.1] font-black text-white tracking-tighter uppercase md:px-12">
            The Future of Freelancing is <span className="text-[#e63b2e]">Decentralized</span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg text-neutral-400">
            Eliminate middlemen fees and secure your work with programmable smart contracts.
            Payments held in on-chain escrow. Reviews minted as soulbound NFTs.
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
                <Button asChild variant="outline" size="lg">
                  <Link to="/jobs/new">Post a Job</Link>
                </Button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <WalletMultiButton />
                <p className="text-sm text-neutral-500">Connect Phantom to get started</p>
              </div>
            )}
          </div>

          <div className="pt-16 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-60">
            <div className="flex flex-col items-center">
              <span className="font-display text-2xl font-semibold text-white">$0</span>
              <span className="font-display text-xs text-neutral-400 uppercase">Platform Fee</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-display text-2xl font-semibold text-white">SOL</span>
              <span className="font-display text-xs text-neutral-400 uppercase">Escrow Payments</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-display text-2xl font-semibold text-white">Instant</span>
              <span className="font-display text-xs text-neutral-400 uppercase">Settlement</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-display text-2xl font-semibold text-white">SBT</span>
              <span className="font-display text-xs text-neutral-400 uppercase">Soulbound Reviews</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-8 bg-neutral-900 border border-neutral-800 p-8 rounded-xl flex flex-col justify-between group">
            <div>
              <div className="mb-4 text-[#e63b2e]">
                <span className="material-symbols-outlined text-4xl">verified_user</span>
              </div>
              <h3 className="font-display text-3xl font-semibold mb-4">Programmable Escrow</h3>
              <p className="text-neutral-400 max-w-md">Smart contracts hold funds in secure PDAs. Payment is triggered automatically upon work approval — no disputes, no delays.</p>
            </div>
            <div className="mt-12 h-64 overflow-hidden relative rounded-lg border border-neutral-800 bg-neutral-950 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-[#e63b2e]/5 via-transparent to-blue-600/5"></div>
              <div className="text-center relative z-10">
                <span className="material-symbols-outlined text-6xl text-neutral-700">lock</span>
                <p className="text-neutral-600 font-display text-xs uppercase tracking-widest mt-2">On-Chain Escrow Protocol</p>
              </div>
            </div>
          </div>
          <div className="md:col-span-4 bg-neutral-900 border border-neutral-800 p-8 rounded-xl flex flex-col justify-center text-center">
            <div className="mx-auto mb-6 text-blue-500">
              <span className="material-symbols-outlined text-6xl">star</span>
            </div>
            <h3 className="font-display text-2xl font-semibold mb-4">On-Chain Reputation</h3>
            <p className="text-neutral-400">Build a portable work history that you truly own. Every review is minted as a Soulbound Token (SBT).</p>
            <div className="mt-8 pt-8 border-t border-neutral-800">
              <div className="flex -space-x-2 justify-center">
                <div className="w-10 h-10 rounded-full border-2 border-neutral-900 bg-neutral-800"></div>
                <div className="w-10 h-10 rounded-full border-2 border-neutral-900 bg-neutral-800"></div>
                <div className="w-10 h-10 rounded-full border-2 border-neutral-900 bg-neutral-800"></div>
                <div className="w-10 h-10 rounded-full border-2 border-neutral-900 bg-neutral-800 flex items-center justify-center text-[10px] text-neutral-400">+</div>
              </div>
              <p className="mt-4 font-display text-xs text-neutral-500 uppercase tracking-widest">Portable Reputation</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-neutral-950 border-y border-neutral-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <span className="font-display text-xs text-[#e63b2e] uppercase tracking-[0.2em]">Efficiency Protocol</span>
            <h2 className="font-display mt-4 text-4xl font-bold uppercase">Streamlined Workflow</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-12 left-1/4 right-1/4 h-px bg-neutral-800"></div>
            {[
              { num: '01', title: 'Post & Stake', desc: 'Clients post a job and stake the budget in the escrow contract. Total visibility, total trust.', border: 'border-[#e63b2e]' },
              { num: '02', title: 'Work & Submit', desc: 'Freelancers do the work and submit deliverables. Milestones tracked on-chain.', border: 'border-neutral-700 group-hover:border-blue-500' },
              { num: '03', title: 'Instant Settlement', desc: 'Once approved, escrow releases funds instantly to the freelancer\'s wallet. Zero delays.', border: 'border-neutral-700 group-hover:border-green-500' },
            ].map((step) => (
              <div key={step.num} className="relative group">
                <div className={`w-16 h-16 bg-neutral-900 border-2 ${step.border} flex items-center justify-center mb-8 relative z-10 transition-colors`}>
                  <span className="font-display text-xl font-semibold text-white">{step.num}</span>
                </div>
                <h4 className="font-display text-xl font-semibold mb-4">{step.title}</h4>
                <p className="text-neutral-400">{step.desc}</p>
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
            <h2 className="font-display text-4xl font-bold mb-6 uppercase text-white">Ready to join the revolution?</h2>
            <p className="text-white/80 mb-10 text-lg max-w-xl mx-auto">Skip the paperwork and the platform fees. Start building on the protocol today.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {connected ? (
                <>
                  <Link to="/jobs/new" className="bg-white text-[#e63b2e] px-8 py-4 font-display font-bold uppercase tracking-tighter hover:bg-neutral-100 transition-all active:scale-95">
                    Post Your First Job
                  </Link>
                  <Link to="/jobs" className="border border-white text-white px-8 py-4 font-display font-bold uppercase tracking-tighter hover:bg-white/10 transition-all active:scale-95">
                    Browse Active Jobs
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
          <p className="font-display text-xs tracking-widest uppercase text-neutral-500">© 2024 PROOFWORK. PROTOCOL-DRIVEN WORK.</p>
        </div>
        <div className="flex items-center gap-8">
          {['Terms', 'Privacy', 'Security', 'Docs'].map((link) => (
            <span key={link} className="font-display text-xs tracking-widest uppercase text-neutral-500 hover:text-[#e63b2e] transition-colors cursor-pointer">
              {link}
            </span>
          ))}
        </div>
      </footer>
    </main>
  )
}
