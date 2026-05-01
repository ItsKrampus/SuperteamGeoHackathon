import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { FreelanceEscrow } from "../target/types/freelance_escrow";
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { expect } from "chai";

describe("freelance_escrow", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.FreelanceEscrow as Program<FreelanceEscrow>;

  const client = provider.wallet;
  const freelancer = Keypair.generate();
  const jobId = new anchor.BN(1);
  const amount = new anchor.BN(LAMPORTS_PER_SOL); // 1 SOL

  function getJobPda(clientKey: PublicKey, id: anchor.BN): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("job"), clientKey.toBuffer(), id.toArrayLike(Buffer, "le", 8)],
      program.programId
    );
  }

  before(async () => {
    // fund freelancer
    const sig = await provider.connection.requestAirdrop(
      freelancer.publicKey,
      2 * LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(sig);
  });

  it("creates a job with SOL escrow", async () => {
    const [jobPda] = getJobPda(client.publicKey, jobId);

    await program.methods
      .createJob(jobId, amount)
      .accounts({
        client: client.publicKey,
        jobAccount: jobPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const job = await program.account.jobAccount.fetch(jobPda);
    expect(job.client.toBase58()).to.equal(client.publicKey.toBase58());
    expect(job.freelancer).to.be.null;
    expect(job.amount.toNumber()).to.equal(LAMPORTS_PER_SOL);
    expect(JSON.stringify(job.status)).to.equal(JSON.stringify({ funded: {} }));
  });

  it("accepts a freelancer", async () => {
    const [jobPda] = getJobPda(client.publicKey, jobId);

    await program.methods
      .acceptFreelancer()
      .accounts({
        client: client.publicKey,
        freelancer: freelancer.publicKey,
        jobAccount: jobPda,
      })
      .rpc();

    const job = await program.account.jobAccount.fetch(jobPda);
    expect(job.freelancer.toBase58()).to.equal(freelancer.publicKey.toBase58());
    expect(JSON.stringify(job.status)).to.equal(JSON.stringify({ inProgress: {} }));
  });

  it("freelancer submits work", async () => {
    const [jobPda] = getJobPda(client.publicKey, jobId);

    await program.methods
      .submitWork()
      .accounts({
        freelancer: freelancer.publicKey,
        jobAccount: jobPda,
      })
      .signers([freelancer])
      .rpc();

    const job = await program.account.jobAccount.fetch(jobPda);
    expect(JSON.stringify(job.status)).to.equal(JSON.stringify({ submitted: {} }));
  });

  it("client releases payment to freelancer", async () => {
    const [jobPda] = getJobPda(client.publicKey, jobId);
    const freelancerBefore = await provider.connection.getBalance(freelancer.publicKey);

    await program.methods
      .release()
      .accounts({
        client: client.publicKey,
        freelancer: freelancer.publicKey,
        jobAccount: jobPda,
      })
      .rpc();

    const job = await program.account.jobAccount.fetch(jobPda);
    expect(JSON.stringify(job.status)).to.equal(JSON.stringify({ released: {} }));

    const freelancerAfter = await provider.connection.getBalance(freelancer.publicKey);
    expect(freelancerAfter - freelancerBefore).to.equal(LAMPORTS_PER_SOL);
  });

  // -- Dispute flow (new job) --

  const disputeJobId = new anchor.BN(2);

  it("creates a second job, accepts, then disputes", async () => {
    const [jobPda] = getJobPda(client.publicKey, disputeJobId);

    await program.methods
      .createJob(disputeJobId, amount)
      .accounts({
        client: client.publicKey,
        jobAccount: jobPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    await program.methods
      .acceptFreelancer()
      .accounts({
        client: client.publicKey,
        freelancer: freelancer.publicKey,
        jobAccount: jobPda,
      })
      .rpc();

    await program.methods
      .dispute()
      .accounts({
        caller: client.publicKey,
        jobAccount: jobPda,
      })
      .rpc();

    const job = await program.account.jobAccount.fetch(jobPda);
    expect(JSON.stringify(job.status)).to.equal(JSON.stringify({ disputed: {} }));
  });

  // -- Cancel flow --

  const cancelJobId = new anchor.BN(3);

  it("creates and cancels an unfilled job", async () => {
    const [jobPda] = getJobPda(client.publicKey, cancelJobId);

    await program.methods
      .createJob(cancelJobId, amount)
      .accounts({
        client: client.publicKey,
        jobAccount: jobPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const clientBefore = await provider.connection.getBalance(client.publicKey);

    await program.methods
      .cancel()
      .accounts({
        client: client.publicKey,
        jobAccount: jobPda,
      })
      .rpc();

    // account should be closed
    const acc = await provider.connection.getAccountInfo(jobPda);
    expect(acc).to.be.null;

    const clientAfter = await provider.connection.getBalance(client.publicKey);
    // client gets back escrow + rent (minus tx fee)
    expect(clientAfter).to.be.greaterThan(clientBefore);
  });
});
