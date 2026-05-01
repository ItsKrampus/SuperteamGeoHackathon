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
  createUpdateAuthorityInstruction as createMetadataUpdateAuthorityInstruction,
  pack as packTokenMetadata,
} from '@solana/spl-token-metadata'

export async function mintReviewNft(wallet, connection, review) {
  const { freelancerPubkey, rating, comment, jobId, clientWallet } = review
  const payer = wallet.publicKey

  const mintKeypair = Keypair.generate()
  const mint = mintKeypair.publicKey

  const name = `Review #${jobId.toString().slice(-6)}`
  const symbol = 'REV'
  const uri = ''
  const additionalMetadata = [
    ['rating', String(rating)],
    ['comment', comment || ''],
    ['jobId', String(jobId)],
    ['client', clientWallet],
    ['freelancer', freelancerPubkey.toBase58()],
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

  const lamports = await connection.getMinimumBalanceForRentExemption(
    mintLen + metadataLen
  )

  const tx = new Transaction()

  // 1. Create the mint account
  tx.add(
    SystemProgram.createAccount({
      fromPubkey: payer,
      newAccountPubkey: mint,
      space: mintLen,
      lamports,
      programId: TOKEN_2022_PROGRAM_ID,
    })
  )

  // 2. NonTransferable extension (MUST be before InitializeMint)
  tx.add(
    createInitializeNonTransferableMintInstruction(mint, TOKEN_2022_PROGRAM_ID)
  )

  // 3. MetadataPointer extension — metadata lives on the mint itself
  tx.add(
    createInitializeMetadataPointerInstruction(
      mint,
      payer,
      mint,
      TOKEN_2022_PROGRAM_ID
    )
  )

  // 4. Initialize the mint (decimals=0, supply will be 1)
  tx.add(
    createInitializeMintInstruction(
      mint,
      0,
      payer,
      null,
      TOKEN_2022_PROGRAM_ID
    )
  )

  // 5. Initialize on-mint metadata
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

  // 6. Add review fields to metadata
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

  // 7. Create freelancer's ATA for Token-2022 mint
  const ata = getAssociatedTokenAddressSync(
    mint,
    freelancerPubkey,
    false,
    TOKEN_2022_PROGRAM_ID
  )
  tx.add(
    createAssociatedTokenAccountInstruction(
      payer,
      ata,
      freelancerPubkey,
      mint,
      TOKEN_2022_PROGRAM_ID
    )
  )

  // 8. Mint 1 token to freelancer
  tx.add(
    createMintToInstruction(mint, ata, payer, 1, [], TOKEN_2022_PROGRAM_ID)
  )

  // 9. Remove mint authority — locks supply at 1 forever
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

  // 10. Remove metadata update authority — makes metadata immutable
  tx.add(
    createMetadataUpdateAuthorityInstruction({
      programId: TOKEN_2022_PROGRAM_ID,
      metadata: mint,
      oldAuthority: payer,
      newAuthority: null,
    })
  )

  tx.feePayer = payer
  const { blockhash } = await connection.getLatestBlockhash()
  tx.recentBlockhash = blockhash

  tx.partialSign(mintKeypair)
  const signed = await wallet.signTransaction(tx)
  const txSig = await connection.sendRawTransaction(signed.serialize())
  await connection.confirmTransaction(txSig, 'confirmed')

  return { mintAddress: mint.toBase58(), txSig }
}
