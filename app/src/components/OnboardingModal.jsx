import { useState } from 'react'
import { useProfile } from '@/contexts/ProfileContext'
import { Button } from '@/components/ui/button'

export default function OnboardingModal({ onClose }) {
  const { createProfile } = useProfile()
  const [form, setForm] = useState({ displayName: '', bio: '', skills: '', role: 'freelancer' })
  const [minting, setMinting] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.displayName.trim()) return

    setMinting(true)
    setError(null)
    try {
      await createProfile({
        displayName: form.displayName.trim(),
        bio: form.bio.trim(),
        skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
        role: form.role,
      })
      onClose?.()
    } catch (err) {
      setError(err.message || 'Failed to mint profile NFT')
    } finally {
      setMinting(false)
    }
  }

  const inputClass = "w-full bg-zinc-800 border border-zinc-700 text-white p-3 rounded-lg focus:ring-2 focus:ring-[#e63b2e] focus:border-transparent outline-none transition-all duration-200 text-sm"

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 w-full max-w-lg mx-4 shadow-2xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-[#e63b2e]/10 rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-[#e63b2e]" style={{ fontVariationSettings: "'FILL' 1" }}>badge</span>
          </div>
          <h2 className="font-display text-2xl font-bold tracking-tight">Create On-Chain Identity</h2>
        </div>
        <p className="text-sm text-zinc-400 mb-6">
          Mint a soulbound Profile NFT. Your identity lives on Solana — connect any wallet to load it instantly.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="font-display text-xs text-zinc-500 uppercase tracking-widest">I am a...</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'freelancer', label: 'Freelancer', icon: 'code' },
                { value: 'client', label: 'Client', icon: 'business_center' },
                { value: 'both', label: 'Both', icon: 'swap_horiz' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm({ ...form, role: opt.value })}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all text-center ${
                    form.role === opt.value
                      ? 'border-[#e63b2e] bg-[#e63b2e]/10 text-white'
                      : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: form.role === opt.value ? "'FILL' 1" : "'FILL' 0" }}>{opt.icon}</span>
                  <span className="font-display text-xs uppercase tracking-wider">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-display text-xs text-zinc-500 uppercase tracking-widest">Display Name *</label>
            <input
              className={inputClass}
              value={form.displayName}
              onChange={(e) => setForm({ ...form, displayName: e.target.value })}
              placeholder="Your name or alias"
              maxLength={50}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-display text-xs text-zinc-500 uppercase tracking-widest">Bio</label>
            <textarea
              className={`${inputClass} min-h-[80px] resize-none`}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder={form.role === 'client' ? 'Tell freelancers about your company or projects' : 'Tell clients about your expertise and experience'}
              maxLength={200}
            />
            <span className="text-[10px] text-zinc-600">{form.bio.length}/200</span>
          </div>

          {form.role !== 'client' && (
            <div className="space-y-1.5">
              <label className="font-display text-xs text-zinc-500 uppercase tracking-widest">Skills (comma-separated)</label>
              <input
                className={inputClass}
                value={form.skills}
                onChange={(e) => setForm({ ...form, skills: e.target.value })}
                placeholder="Rust, React, Solidity, Design"
              />
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="submit" variant="brand" disabled={minting || !form.displayName.trim()} className="flex-1">
              {minting ? 'Minting...' : 'Mint Profile NFT'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} disabled={minting}>
              Skip
            </Button>
          </div>
        </form>

        <p className="text-[10px] text-zinc-600 mt-4 text-center">
          Costs ~0.005 SOL for on-chain rent. Non-transferable. You can update anytime.
        </p>
      </div>
    </div>
  )
}
