import { BN } from '@coral-xyz/anchor'
import { SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { getProgram, getJobPda } from './program'

export async function createJob(wallet, connection, { jobId, amountSol }) {
  const program = getProgram(wallet, connection)
  const [jobPda] = getJobPda(wallet.publicKey, jobId)
  const amount = new BN(amountSol * LAMPORTS_PER_SOL)

  const tx = await program.methods
    .createJob(new BN(jobId), amount)
    .accounts({
      client: wallet.publicKey,
      jobAccount: jobPda,
      systemProgram: SystemProgram.programId,
    })
    .rpc()

  return { tx, jobPda }
}

export async function acceptFreelancer(wallet, connection, { jobPda, freelancerPubkey }) {
  const program = getProgram(wallet, connection)

  const tx = await program.methods
    .acceptFreelancer()
    .accounts({
      client: wallet.publicKey,
      freelancer: freelancerPubkey,
      jobAccount: jobPda,
    })
    .rpc()

  return { tx }
}

export async function submitWork(wallet, connection, { jobPda }) {
  const program = getProgram(wallet, connection)

  const tx = await program.methods
    .submitWork()
    .accounts({
      freelancer: wallet.publicKey,
      jobAccount: jobPda,
    })
    .rpc()

  return { tx }
}

export async function releasePayment(wallet, connection, { jobPda, freelancerPubkey }) {
  const program = getProgram(wallet, connection)

  const tx = await program.methods
    .release()
    .accounts({
      client: wallet.publicKey,
      freelancer: freelancerPubkey,
      jobAccount: jobPda,
    })
    .rpc()

  return { tx }
}

export async function disputeJob(wallet, connection, { jobPda }) {
  const program = getProgram(wallet, connection)

  const tx = await program.methods
    .dispute()
    .accounts({
      caller: wallet.publicKey,
      jobAccount: jobPda,
    })
    .rpc()

  return { tx }
}

export async function resolveDispute(wallet, connection, { jobPda, clientPubkey, freelancerPubkey, awardToFreelancer }) {
  const program = getProgram(wallet, connection)

  const tx = await program.methods
    .resolveDispute(awardToFreelancer)
    .accounts({
      arbitrator: wallet.publicKey,
      client: clientPubkey,
      freelancer: freelancerPubkey,
      jobAccount: jobPda,
    })
    .rpc()

  return { tx }
}

export async function cancelJob(wallet, connection, { jobPda }) {
  const program = getProgram(wallet, connection)

  const tx = await program.methods
    .cancel()
    .accounts({
      client: wallet.publicKey,
      jobAccount: jobPda,
    })
    .rpc()

  return { tx }
}

export async function fetchJobAccount(wallet, connection, jobPda) {
  const program = getProgram(wallet, connection)
  return program.account.jobAccount.fetch(jobPda)
}

export async function fetchAllJobs(wallet, connection) {
  const program = getProgram(wallet, connection)
  return program.account.jobAccount.all()
}
