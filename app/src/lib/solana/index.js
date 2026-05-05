import { PublicKey } from '@solana/web3.js'

export const ADMIN_PUBKEY = new PublicKey(
  import.meta.env.VITE_ADMIN_PUBKEY || 'AXmQfo1Gi9Cbxn64kcrNbQoMPkjedXLfSzENv5oVAYMa'
)

export const SOLANA_NETWORK = import.meta.env.VITE_SOLANA_NETWORK || 'devnet'

export const RPC_URL =
  import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.devnet.solana.com'

export const USDC_DEV_MINT = new PublicKey(
  '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'
)

export function shortenAddress(address, chars = 4) {
  const str = typeof address === 'string' ? address : address.toBase58()
  return `${str.slice(0, chars)}...${str.slice(-chars)}`
}

export function lamportsToSol(lamports) {
  return Number(lamports) / 1e9
}

export function solToLamports(sol) {
  return Math.round(sol * 1e9)
}
