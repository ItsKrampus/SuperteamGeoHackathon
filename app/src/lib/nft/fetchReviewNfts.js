import { PublicKey } from '@solana/web3.js'
import {
  TOKEN_2022_PROGRAM_ID,
  AccountLayout,
  getTokenMetadata,
} from '@solana/spl-token'
import { REV_SYMBOL } from './constants'

export async function fetchReviewNfts(connection, walletPubkey) {
  const tokenAccounts = await connection.getTokenAccountsByOwner(walletPubkey, {
    programId: TOKEN_2022_PROGRAM_ID,
  })

  if (tokenAccounts.value.length === 0) return []

  const nftMints = []
  for (const { account } of tokenAccounts.value) {
    const decoded = AccountLayout.decode(account.data)
    if (decoded.amount === 1n) {
      nftMints.push(new PublicKey(decoded.mint))
    }
  }

  if (nftMints.length === 0) return []

  const reviews = []

  for (const mintPubkey of nftMints) {
    try {
      const metadata = await getTokenMetadata(
        connection,
        mintPubkey,
        'confirmed',
        TOKEN_2022_PROGRAM_ID
      )
      if (metadata && metadata.symbol === REV_SYMBOL) {
        const fields = Object.fromEntries(metadata.additionalMetadata || [])
        reviews.push({
          rating: Number(fields.rating) || 0,
          comment: fields.comment || '',
          jobId: fields.jobId || '',
          clientWallet: fields.client || '',
          freelancerWallet: fields.freelancer || '',
          mintAddress: mintPubkey.toBase58(),
          onChain: true,
        })
      }
    } catch {}
  }

  return reviews
}
