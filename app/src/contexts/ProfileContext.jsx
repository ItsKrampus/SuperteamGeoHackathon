import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { fetchProfileNft } from '@/lib/nft/fetchProfileNft'
import { mintProfileNft } from '@/lib/nft/mintProfileNft'
import { updateProfileNft } from '@/lib/nft/updateProfileNft'
import { localDb } from '@/lib/db/localStorage'

const ProfileContext = createContext(null)

export function ProfileProvider({ children }) {
  const { connection } = useConnection()
  const wallet = useWallet()
  const { publicKey, connected } = wallet

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)
  const [mintAddress, setMintAddress] = useState(null)

  const loadProfile = useCallback(async () => {
    if (!publicKey || !connected) {
      setProfile(null)
      setMintAddress(null)
      setNeedsOnboarding(false)
      return
    }

    setLoading(true)
    try {
      const result = await fetchProfileNft(connection, publicKey)
      if (result) {
        setProfile(result.profile)
        setMintAddress(result.mintAddress)
        setNeedsOnboarding(false)
        await localDb.profiles.upsert(publicKey.toBase58(), result.profile)
      } else {
        const cached = await localDb.profiles.get(publicKey.toBase58())
        if (cached) {
          setProfile(cached)
          setNeedsOnboarding(false)
        } else {
          setProfile(null)
          setNeedsOnboarding(true)
        }
        setMintAddress(null)
      }
    } catch {
      const cached = await localDb.profiles.get(publicKey.toBase58())
      if (cached) {
        setProfile(cached)
        setNeedsOnboarding(false)
      } else {
        setNeedsOnboarding(true)
      }
    } finally {
      setLoading(false)
    }
  }, [publicKey, connected, connection])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const createProfile = useCallback(async (data) => {
    const { mintAddress: newMint } = await mintProfileNft(wallet, connection, data)
    setMintAddress(newMint)
    const profileData = {
      ...data,
      wallet: publicKey.toBase58(),
      skills: Array.isArray(data.skills)
        ? data.skills
        : data.skills.split(',').map((s) => s.trim()).filter(Boolean),
      mintAddress: newMint,
      onChain: true,
    }
    setProfile(profileData)
    setNeedsOnboarding(false)
    await localDb.profiles.upsert(publicKey.toBase58(), profileData)
    return { mintAddress: newMint }
  }, [wallet, connection, publicKey])

  const updateProfile = useCallback(async (updates) => {
    if (!mintAddress) throw new Error('No profile NFT to update')
    await updateProfileNft(wallet, connection, { mintAddress, updates })
    const updatedProfile = { ...profile, ...updates }
    if (typeof updates.skills === 'string') {
      updatedProfile.skills = updates.skills.split(',').map((s) => s.trim()).filter(Boolean)
    }
    setProfile(updatedProfile)
    await localDb.profiles.upsert(publicKey.toBase58(), updatedProfile)
  }, [wallet, connection, mintAddress, profile, publicKey])

  const value = {
    profile,
    loading,
    needsOnboarding,
    mintAddress,
    refreshProfile: loadProfile,
    createProfile,
    updateProfile,
  }

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  )
}

export function useProfile() {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error('useProfile must be inside ProfileProvider')
  return ctx
}
