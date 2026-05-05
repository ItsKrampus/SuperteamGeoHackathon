import { useState, useEffect, useRef } from 'react'
import { PublicKey } from '@solana/web3.js'
import { useConnection } from '@solana/wallet-adapter-react'
import { fetchReviewNfts } from '@/lib/nft/fetchReviewNfts'

const cache = new Map()

export function useOnChainReviews(walletAddress) {
  const { connection } = useConnection()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const fetchedRef = useRef(null)

  useEffect(() => {
    if (!walletAddress) {
      setReviews([])
      return
    }

    if (fetchedRef.current === walletAddress && cache.has(walletAddress)) {
      setReviews(cache.get(walletAddress))
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    fetchReviewNfts(connection, new PublicKey(walletAddress))
      .then((result) => {
        if (cancelled) return
        cache.set(walletAddress, result)
        fetchedRef.current = walletAddress
        setReviews(result)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err)
        setReviews([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [walletAddress, connection])

  return { reviews, loading, error }
}
