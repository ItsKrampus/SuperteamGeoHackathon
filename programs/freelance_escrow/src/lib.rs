use anchor_lang::prelude::*;
use anchor_lang::system_program;

declare_id!("E9jCj4PbqrAjgJozagmhuXBaLWyzXmwVqTZxpkEGJu4p");

pub const ARBITRATOR: Pubkey = pubkey!("AXmQfo1Gi9Cbxn64kcrNbQoMPkjedXLfSzENv5oVAYMa");

#[program]
pub mod freelance_escrow {
    use super::*;

    pub fn create_job(ctx: Context<CreateJob>, job_id: u64, amount: u64) -> Result<()> {
        require!(amount > 0, EscrowError::InvalidAmount);

        let job = &mut ctx.accounts.job_account;
        job.client = ctx.accounts.client.key();
        job.freelancer = None;
        job.amount = amount;
        job.token_mint = Pubkey::default();
        job.status = JobStatus::Funded;
        job.job_id = job_id;
        job.created_at = Clock::get()?.unix_timestamp;
        job.bump = ctx.bumps.job_account;

        system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: ctx.accounts.client.to_account_info(),
                    to: ctx.accounts.job_account.to_account_info(),
                },
            ),
            amount,
        )?;

        Ok(())
    }

    pub fn accept_freelancer(ctx: Context<AcceptFreelancer>) -> Result<()> {
        let job = &mut ctx.accounts.job_account;
        require!(job.status == JobStatus::Funded, EscrowError::WrongStatus);
        require!(job.freelancer.is_none(), EscrowError::AlreadyAccepted);

        job.freelancer = Some(ctx.accounts.freelancer.key());
        job.status = JobStatus::InProgress;
        Ok(())
    }

    pub fn submit_work(ctx: Context<SubmitWork>) -> Result<()> {
        let job = &mut ctx.accounts.job_account;
        require!(job.status == JobStatus::InProgress, EscrowError::WrongStatus);

        job.status = JobStatus::Submitted;
        Ok(())
    }

    pub fn release(ctx: Context<Release>) -> Result<()> {
        let job = &mut ctx.accounts.job_account;
        require!(job.status == JobStatus::Submitted, EscrowError::WrongStatus);

        let amount = job.amount;
        **job.to_account_info().try_borrow_mut_lamports()? -= amount;
        **ctx.accounts.freelancer.to_account_info().try_borrow_mut_lamports()? += amount;

        job.status = JobStatus::Released;
        Ok(())
    }

    pub fn dispute(ctx: Context<Dispute>) -> Result<()> {
        let job = &mut ctx.accounts.job_account;
        require!(
            job.status == JobStatus::InProgress || job.status == JobStatus::Submitted,
            EscrowError::WrongStatus
        );

        job.status = JobStatus::Disputed;
        Ok(())
    }

    pub fn resolve_dispute(ctx: Context<ResolveDispute>, award_to_freelancer: bool) -> Result<()> {
        let job = &mut ctx.accounts.job_account;
        require!(job.status == JobStatus::Disputed, EscrowError::WrongStatus);

        let amount = job.amount;
        if award_to_freelancer {
            **job.to_account_info().try_borrow_mut_lamports()? -= amount;
            **ctx.accounts.freelancer.to_account_info().try_borrow_mut_lamports()? += amount;
            job.status = JobStatus::Released;
        } else {
            **job.to_account_info().try_borrow_mut_lamports()? -= amount;
            **ctx.accounts.client.to_account_info().try_borrow_mut_lamports()? += amount;
            job.status = JobStatus::Cancelled;
        }

        Ok(())
    }

    pub fn cancel(ctx: Context<Cancel>) -> Result<()> {
        let job = &ctx.accounts.job_account;
        require!(job.status == JobStatus::Funded, EscrowError::WrongStatus);
        require!(job.freelancer.is_none(), EscrowError::AlreadyAccepted);
        Ok(())
    }
}

// -- State --

#[account]
pub struct JobAccount {
    pub client: Pubkey,
    pub freelancer: Option<Pubkey>,
    pub amount: u64,
    pub token_mint: Pubkey,
    pub status: JobStatus,
    pub job_id: u64,
    pub created_at: i64,
    pub bump: u8,
}

impl JobAccount {
    pub const SIZE: usize = 8 + 32 + (1 + 32) + 8 + 32 + 1 + 8 + 8 + 1;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum JobStatus {
    Funded,
    InProgress,
    Submitted,
    Released,
    Disputed,
    Cancelled,
}

// -- Accounts --

#[derive(Accounts)]
#[instruction(job_id: u64)]
pub struct CreateJob<'info> {
    #[account(mut)]
    pub client: Signer<'info>,
    #[account(
        init,
        payer = client,
        space = JobAccount::SIZE,
        seeds = [b"job", client.key().as_ref(), &job_id.to_le_bytes()],
        bump,
    )]
    pub job_account: Account<'info, JobAccount>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AcceptFreelancer<'info> {
    #[account(address = job_account.client @ EscrowError::Unauthorized)]
    pub client: Signer<'info>,
    /// CHECK: Freelancer being accepted, validated by client's choice
    pub freelancer: UncheckedAccount<'info>,
    #[account(
        mut,
        seeds = [b"job", job_account.client.as_ref(), &job_account.job_id.to_le_bytes()],
        bump = job_account.bump,
    )]
    pub job_account: Account<'info, JobAccount>,
}

#[derive(Accounts)]
pub struct SubmitWork<'info> {
    #[account(
        constraint = Some(freelancer.key()) == job_account.freelancer @ EscrowError::Unauthorized
    )]
    pub freelancer: Signer<'info>,
    #[account(
        mut,
        seeds = [b"job", job_account.client.as_ref(), &job_account.job_id.to_le_bytes()],
        bump = job_account.bump,
    )]
    pub job_account: Account<'info, JobAccount>,
}

#[derive(Accounts)]
pub struct Release<'info> {
    #[account(address = job_account.client @ EscrowError::Unauthorized)]
    pub client: Signer<'info>,
    /// CHECK: Must match stored freelancer
    #[account(
        mut,
        constraint = Some(freelancer.key()) == job_account.freelancer @ EscrowError::Unauthorized
    )]
    pub freelancer: UncheckedAccount<'info>,
    #[account(
        mut,
        seeds = [b"job", job_account.client.as_ref(), &job_account.job_id.to_le_bytes()],
        bump = job_account.bump,
    )]
    pub job_account: Account<'info, JobAccount>,
}

#[derive(Accounts)]
pub struct Dispute<'info> {
    #[account(
        constraint = (
            caller.key() == job_account.client ||
            Some(caller.key()) == job_account.freelancer
        ) @ EscrowError::Unauthorized
    )]
    pub caller: Signer<'info>,
    #[account(
        mut,
        seeds = [b"job", job_account.client.as_ref(), &job_account.job_id.to_le_bytes()],
        bump = job_account.bump,
    )]
    pub job_account: Account<'info, JobAccount>,
}

#[derive(Accounts)]
pub struct ResolveDispute<'info> {
    #[account(address = ARBITRATOR @ EscrowError::Unauthorized)]
    pub arbitrator: Signer<'info>,
    /// CHECK: Validated against stored client
    #[account(mut, address = job_account.client @ EscrowError::Unauthorized)]
    pub client: UncheckedAccount<'info>,
    /// CHECK: Validated against stored freelancer
    #[account(
        mut,
        constraint = Some(freelancer.key()) == job_account.freelancer @ EscrowError::Unauthorized
    )]
    pub freelancer: UncheckedAccount<'info>,
    #[account(
        mut,
        seeds = [b"job", job_account.client.as_ref(), &job_account.job_id.to_le_bytes()],
        bump = job_account.bump,
    )]
    pub job_account: Account<'info, JobAccount>,
}

#[derive(Accounts)]
pub struct Cancel<'info> {
    #[account(mut, address = job_account.client @ EscrowError::Unauthorized)]
    pub client: Signer<'info>,
    #[account(
        mut,
        close = client,
        seeds = [b"job", job_account.client.as_ref(), &job_account.job_id.to_le_bytes()],
        bump = job_account.bump,
    )]
    pub job_account: Account<'info, JobAccount>,
}

// -- Errors --

#[error_code]
pub enum EscrowError {
    #[msg("Wrong job status for this action")]
    WrongStatus,
    #[msg("Job already has a freelancer accepted")]
    AlreadyAccepted,
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Amount must be greater than zero")]
    InvalidAmount,
}
