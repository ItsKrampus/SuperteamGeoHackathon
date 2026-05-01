import { Program, AnchorProvider } from '@coral-xyz/anchor'
import { Connection, PublicKey } from '@solana/web3.js'
import idl from './idl.json'

export const PROGRAM_ID = new PublicKey(idl.address)

export function getProvider(wallet, connection) {
  return new AnchorProvider(connection, wallet, {
    commitment: 'confirmed',
  })
}

export function getProgram(wallet, connection) {
  const provider = getProvider(wallet, connection)
  return new Program(idl, provider)
}

export function getJobPda(clientPubkey, jobId) {
  const jobIdBuffer = Buffer.alloc(8)
  jobIdBuffer.writeBigUInt64LE(BigInt(jobId))
  return PublicKey.findProgramAddressSync(
    [Buffer.from('job'), clientPubkey.toBuffer(), jobIdBuffer],
    PROGRAM_ID
  )
}
