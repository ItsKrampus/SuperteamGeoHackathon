import { PublicKey } from '@solana/web3.js'
import {
  TOKEN_2022_PROGRAM_ID,
  AccountLayout,
  getTokenMetadata,
} from '@solana/spl-token'
import { PROF_SYMBOL } from './constants'

const CACHE_KEY = 'profileNftCache'

function getCachedMint(wallet) {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}')
    return cache[wallet] || null
  } catch {
    return null
  }
}

function setCachedMint(wallet, mintAddress) {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}')
    cache[wallet] = mintAddress
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch {}
}

function parseProfileMetadata(metadata, mintAddress) {
  const fields = Object.fromEntries(metadata.additionalMetadata || [])
  return {
    wallet: fields.wallet || null,
    displayName: fields.displayName || metadata.name?.replace('Profile: ', '') || '',
    bio: fields.bio || '',
    skills: fields.skills ? fields.skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
    role: fields.role || 'both',
    createdAt: fields.createdAt ? Number(fields.createdAt) : null,
    mintAddress,
    onChain: true,
  }
}

export async function fetchProfileNft(connection, walletPubkey) {
  const walletStr = walletPubkey.toBase58()

  // Try cached mint first (single RPC call)
  const cachedMint = getCachedMint(walletStr)
  if (cachedMint) {
    try {
      const metadata = await getTokenMetadata(
        connection,
        new PublicKey(cachedMint),
        'confirmed',
        TOKEN_2022_PROGRAM_ID
      )
      if (metadata && metadata.symbol === PROF_SYMBOL) {
        const profile = parseProfileMetadata(metadata, cachedMint)
        profile.wallet = walletStr
        return { profile, mintAddress: cachedMint }
      }
    } catch {}
  }

  // Full scan: get all Token-2022 accounts for this wallet
  const tokenAccounts = await connection.getTokenAccountsByOwner(walletPubkey, {
    programId: TOKEN_2022_PROGRAM_ID,
  })

  if (tokenAccounts.value.length === 0) return null

  // Filter for NFTs (amount === 1)
  const nftMints = []
  for (const { account } of tokenAccounts.value) {
    const decoded = AccountLayout.decode(account.data)
    if (decoded.amount === 1n) {
      nftMints.push(new PublicKey(decoded.mint))
    }
  }

  if (nftMints.length === 0) return null

  // Batch fetch metadata for all NFT mints
  for (let i = 0; i < nftMints.length; i += 100) {
    const batch = nftMints.slice(i, i + 100)
    for (const mintPubkey of batch) {
      try {
        const metadata = await getTokenMetadata(
          connection,
          mintPubkey,
          'confirmed',
          TOKEN_2022_PROGRAM_ID
        )
        if (metadata && metadata.symbol === PROF_SYMBOL) {
          const mintStr = mintPubkey.toBase58()
          setCachedMint(walletStr, mintStr)
          const profile = parseProfileMetadata(metadata, mintStr)
          profile.wallet = walletStr
          return { profile, mintAddress: mintStr }
        }
      } catch {}
    }
  }

  return null
}
