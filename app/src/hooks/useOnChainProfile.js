import { useState, useEffect, useRef } from 'react'
import { PublicKey } from '@solana/web3.js'
import { useConnection } from '@solana/wallet-adapter-react'
import { fetchProfileNft } from '@/lib/nft/fetchProfileNft'

const cache = new Map()

export function useOnChainProfile(walletAddress) {
  const { connection } = useConnection()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const fetchedRef = useRef(null)

  useEffect(() => {
    if (!walletAddress) {
      setProfile(null)
      return
    }

    if (fetchedRef.current === walletAddress && cache.has(walletAddress)) {
      setProfile(cache.get(walletAddress))
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    fetchProfileNft(connection, new PublicKey(walletAddress))
      .then((result) => {
        if (cancelled) return
        const p = result?.profile || null
        cache.set(walletAddress, p)
        fetchedRef.current = walletAddress
        setProfile(p)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [walletAddress, connection])

  return { profile, loading, error }
}
