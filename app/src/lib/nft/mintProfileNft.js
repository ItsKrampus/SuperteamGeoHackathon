import {
  Keypair,
  SystemProgram,
  Transaction,
} from '@solana/web3.js'
import {
  TOKEN_2022_PROGRAM_ID,
  createInitializeMintInstruction,
  createInitializeMetadataPointerInstruction,
  createInitializeNonTransferableMintInstruction,
  createMintToInstruction,
  createSetAuthorityInstruction,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddressSync,
  getMintLen,
  AuthorityType,
  ExtensionType,
} from '@solana/spl-token'
import {
  createInitializeInstruction as createMetadataInitInstruction,
  createUpdateFieldInstruction,
  pack as packTokenMetadata,
} from '@solana/spl-token-metadata'
import { PROF_SYMBOL } from './constants'

export async function mintProfileNft(wallet, connection, profileData) {
  const { displayName, bio, skills, role } = profileData
  const payer = wallet.publicKey

  const mintKeypair = Keypair.generate()
  const mint = mintKeypair.publicKey

  const name = `Profile: ${displayName}`
  const symbol = PROF_SYMBOL
  const uri = ''
  const additionalMetadata = [
    ['displayName', displayName || ''],
    ['bio', (bio || '').slice(0, 200)],
    ['skills', Array.isArray(skills) ? skills.join(',') : (skills || '')],
    ['role', role || 'both'],
    ['createdAt', String(Date.now())],
  ]

  const mintLen = getMintLen([
    ExtensionType.NonTransferable,
    ExtensionType.MetadataPointer,
  ])

  const metadataLen = packTokenMetadata({
    name,
    symbol,
    uri,
    mint,
    updateAuthority: payer,
    additionalMetadata,
  }).length

  // Token-2022 stores metadata as a TLV entry: 2 bytes type + 2 bytes length + content
  // Add extra buffer for TLV overhead and potential reallocation padding
  const lamports = await connection.getMinimumBalanceForRentExemption(
    mintLen + metadataLen + 68
  )

  const tx = new Transaction()

  tx.add(
    SystemProgram.createAccount({
      fromPubkey: payer,
      newAccountPubkey: mint,
      space: mintLen,
      lamports,
      programId: TOKEN_2022_PROGRAM_ID,
    })
  )

  tx.add(
    createInitializeNonTransferableMintInstruction(mint, TOKEN_2022_PROGRAM_ID)
  )

  tx.add(
    createInitializeMetadataPointerInstruction(
      mint,
      payer,
      mint,
      TOKEN_2022_PROGRAM_ID
    )
  )

  tx.add(
    createInitializeMintInstruction(
      mint,
      0,
      payer,
      null,
      TOKEN_2022_PROGRAM_ID
    )
  )

  tx.add(
    createMetadataInitInstruction({
      programId: TOKEN_2022_PROGRAM_ID,
      metadata: mint,
      updateAuthority: payer,
      mint,
      mintAuthority: payer,
      name,
      symbol,
      uri,
    })
  )

  for (const [key, value] of additionalMetadata) {
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

  const ata = getAssociatedTokenAddressSync(
    mint,
    payer,
    false,
    TOKEN_2022_PROGRAM_ID
  )
  tx.add(
    createAssociatedTokenAccountInstruction(
      payer,
      ata,
      payer,
      mint,
      TOKEN_2022_PROGRAM_ID
    )
  )

  tx.add(
    createMintToInstruction(mint, ata, payer, 1, [], TOKEN_2022_PROGRAM_ID)
  )

  // Revoke mint authority — locks supply at 1 forever
  tx.add(
    createSetAuthorityInstruction(
      mint,
      payer,
      AuthorityType.MintTokens,
      null,
      [],
      TOKEN_2022_PROGRAM_ID
    )
  )

  // NOTE: We do NOT revoke metadata update authority — user keeps it for profile edits

  tx.feePayer = payer
  const { blockhash } = await connection.getLatestBlockhash()
  tx.recentBlockhash = blockhash

  tx.partialSign(mintKeypair)
  const signed = await wallet.signTransaction(tx)
  const txSig = await connection.sendRawTransaction(signed.serialize())
  await connection.confirmTransaction(txSig, 'confirmed')

  return { mintAddress: mint.toBase58(), txSig }
}
