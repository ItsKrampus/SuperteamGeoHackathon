import { PublicKey, Transaction } from '@solana/web3.js'
import { TOKEN_2022_PROGRAM_ID } from '@solana/spl-token'
import { createUpdateFieldInstruction } from '@solana/spl-token-metadata'

export async function updateProfileNft(wallet, connection, { mintAddress, updates }) {
  const payer = wallet.publicKey
  const mint = new PublicKey(mintAddress)

  const fields = []
  if (updates.displayName !== undefined) fields.push(['displayName', updates.displayName])
  if (updates.bio !== undefined) fields.push(['bio', (updates.bio || '').slice(0, 200)])
  if (updates.skills !== undefined) {
    const skillsStr = Array.isArray(updates.skills) ? updates.skills.join(',') : updates.skills
    fields.push(['skills', skillsStr])
  }
  if (updates.role !== undefined) fields.push(['role', updates.role])

  if (fields.length === 0) return null

  const tx = new Transaction()

  for (const [key, value] of fields) {
    tx.add(
      createUpdateFieldInstruction({
        programId: TOKEN_2022_PROGRAM_ID,
        metadata: mint,
        updateAuthority: payer,
        field: key,
        value,
      })
    )
  }

  tx.feePayer = payer
  const { blockhash } = await connection.getLatestBlockhash()
  tx.recentBlockhash = blockhash

  const signed = await wallet.signTransaction(tx)
  const txSig = await connection.sendRawTransaction(signed.serialize())
  await connection.confirmTransaction(txSig, 'confirmed')

  return { txSig }
}
