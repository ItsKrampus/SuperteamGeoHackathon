import { useState, useEffect, useRef } from 'react'
import { PublicKey } from '@solana/web3.js'
import { useConnection } from '@solana/wallet-adapter-react'
import { fetchProfileNft } from '@/lib/nft/fetchProfileNft'

const cache = new Map()

export function useOnChainProfiles(walletAddresses) {
  const { connection } = useConnection()
  const [profiles, setProfiles] = useState({})
  const [loading, setLoading] = useState(false)
  const prevRef = useRef('')

  const key = (walletAddresses || []).filter(Boolean).sort().join(',')

  useEffect(() => {
    const addrs = (walletAddresses || []).filter(Boolean)
    if (key === prevRef.current || addrs.length === 0) return
    prevRef.current = key

    const initial = {}
    const uncached = []
    for (const addr of addrs) {
      if (cache.has(addr)) {
        initial[addr] = cache.get(addr)
      } else {
        uncached.push(addr)
      }
    }
    setProfiles(initial)

    if (uncached.length === 0) return

    setLoading(true)
    Promise.all(
      uncached.map((addr) =>
        fetchProfileNft(connection, new PublicKey(addr))
          .then((result) => {
            const p = result?.profile || null
            cache.set(addr, p)
            return [addr, p]
          })
          .catch(() => {
            cache.set(addr, null)
            return [addr, null]
          })
      )
    ).then((results) => {
      const merged = { ...initial }
      for (const [addr, p] of results) {
        merged[addr] = p
      }
      setProfiles(merged)
      setLoading(false)
    })
  }, [key, connection])

  return { profiles, loading }
}
