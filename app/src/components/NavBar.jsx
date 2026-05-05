import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Link, useLocation } from 'react-router-dom'
import { ADMIN_PUBKEY } from '@/lib/solana'
import { cn } from '@/lib/utils'
import { useProfile } from '@/contexts/ProfileContext'

const links = [
  { to: '/', label: 'Home' },
  { to: '/jobs', label: 'Browse Jobs' },
  { to: '/jobs/new', label: 'Post Job' },
  { to: '/dashboard', label: 'Dashboard', auth: true },
]

export default function NavBar() {
  const { publicKey } = useWallet()
  const location = useLocation()
  const { profile, needsOnboarding } = useProfile()

  const isAdmin = publicKey && publicKey.equals(ADMIN_PUBKEY)

  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 h-16 bg-card border-b border-neutral-800">
      <div className="flex items-center gap-8">
        <Link to="/" className="text-2xl font-black text-white tracking-tighter font-display uppercase">
          PROOFWORK
        </Link>
        <div className="hidden md:flex gap-6">
          {links
            .filter((link) => !link.auth || publicKey)
            .map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                'font-display uppercase tracking-tighter text-sm transition-colors active:scale-95 duration-200',
                location.pathname === link.to
                  ? 'text-[#e63b2e] border-b-2 border-[#e63b2e] pb-1 font-bold'
                  : 'text-neutral-400 hover:text-white'
              )}
            >
              {link.label}
            </Link>
          ))}
          {publicKey && (
            <Link
              to={`/profile/${publicKey.toBase58()}`}
              className={cn(
                'font-display uppercase tracking-tighter text-sm transition-colors active:scale-95 duration-200 flex items-center gap-1.5',
                location.pathname.startsWith('/profile')
                  ? 'text-[#e63b2e] border-b-2 border-[#e63b2e] pb-1 font-bold'
                  : 'text-neutral-400 hover:text-white'
              )}
            >
              {profile?.displayName || 'Profile'}
              {needsOnboarding && (
                <span className="w-2 h-2 rounded-full bg-[#e63b2e] animate-pulse" />
              )}
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin/disputes"
              className={cn(
                'font-display uppercase tracking-tighter text-sm transition-colors active:scale-95 duration-200',
                location.pathname === '/admin/disputes'
                  ? 'text-[#e63b2e] border-b-2 border-[#e63b2e] pb-1 font-bold'
                  : 'text-neutral-400 hover:text-white'
              )}
            >
              Admin
            </Link>
          )}
        </div>
      </div>
      <WalletMultiButton />
    </nav>
  )
}
