import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Link, useLocation } from 'react-router-dom'
import { ADMIN_PUBKEY, SOLANA_NETWORK } from '@/lib/solana'
import { cn } from '@/lib/utils'
import { useProfile } from '@/contexts/ProfileContext'

const links = [
  { to: '/jobs', label: 'Jobs' },
  { to: '/dashboard', label: 'Dashboard', auth: true },
]

export default function NavBar() {
  const { publicKey } = useWallet()
  const location = useLocation()
  const { profile, needsOnboarding } = useProfile()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isAdmin = publicKey && publicKey.equals(ADMIN_PUBKEY)

  const navLinks = links.filter((link) => !link.auth || publicKey)

  function NavLink({ to, active, children, className: extra }) {
    return (
      <Link
        to={to}
        onClick={() => setMobileOpen(false)}
        className={cn(
          'font-display uppercase tracking-tighter text-sm transition-colors active:scale-95 duration-200 border-b-2 pb-1',
          active
            ? 'text-[#e63b2e] border-[#e63b2e] font-bold'
            : 'text-neutral-400 hover:text-white border-transparent',
          extra
        )}
      >
        {children}
      </Link>
    )
  }

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-card border-b border-neutral-800">
      <div className="flex items-center justify-between px-6 h-16">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-2xl font-black text-white tracking-tighter font-display uppercase">
              PROOFWORK
            </Link>
            {SOLANA_NETWORK !== 'mainnet-beta' && (
              <span className="font-display text-[9px] bg-yellow-500/10 text-yellow-400 px-2 py-0.5 rounded uppercase border border-yellow-500/30 tracking-widest">
                {SOLANA_NETWORK}
              </span>
            )}
          </div>
          <div className="hidden md:flex gap-6">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} active={location.pathname === link.to}>
                {link.label}
              </NavLink>
            ))}
            {publicKey && (
              <NavLink
                to={`/profile/${publicKey.toBase58()}`}
                active={location.pathname.startsWith('/profile')}
                className="flex items-center gap-1.5"
              >
                {profile?.displayName || 'Profile'}
                {needsOnboarding && (
                  <span className="w-2 h-2 rounded-full bg-[#e63b2e] animate-pulse" />
                )}
              </NavLink>
            )}
            {isAdmin && (
              <NavLink to="/admin/disputes" active={location.pathname === '/admin/disputes'}>
                Admin
              </NavLink>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:block">
            <WalletMultiButton />
          </div>
          <button
            className="md:hidden p-2 text-neutral-400 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-[#e63b2e] rounded"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            <span className="material-symbols-outlined text-xl">
              {mobileOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-neutral-800 bg-card px-6 py-4 space-y-3">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} active={location.pathname === link.to}>
              <span className="block py-2">{link.label}</span>
            </NavLink>
          ))}
          {publicKey && (
            <NavLink
              to={`/profile/${publicKey.toBase58()}`}
              active={location.pathname.startsWith('/profile')}
              className="flex items-center gap-1.5"
            >
              <span className="block py-2">
                {profile?.displayName || 'Profile'}
              </span>
              {needsOnboarding && (
                <span className="w-2 h-2 rounded-full bg-[#e63b2e] animate-pulse" />
              )}
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin/disputes" active={location.pathname === '/admin/disputes'}>
              <span className="block py-2">Admin</span>
            </NavLink>
          )}
          <div className="pt-3 border-t border-neutral-800 mobile-wallet">
            <WalletMultiButton />
          </div>
        </div>
      )}
    </nav>
  )
}
