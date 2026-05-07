import { useEffect, useRef } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { toast } from 'sonner'
import { db } from '@/lib/db'
import { lamportsToSol } from '@/lib/solana'

export function useNotifications() {
  const { publicKey, connected } = useWallet()
  const prevClientJobs = useRef(null)
  const prevFreelancerJobs = useRef(null)
  const initialLoad = useRef({ client: false, freelancer: false })

  useEffect(() => {
    if (!connected || !publicKey) {
      prevClientJobs.current = null
      prevFreelancerJobs.current = null
      initialLoad.current = { client: false, freelancer: false }
      return
    }

    const wallet = publicKey.toBase58()

    const unsubClient = db.jobs.subscribeByClient(wallet, (jobs) => {
      const jobMap = new Map(jobs.map((j) => [`${j.clientWallet}_${j.jobId}`, j]))

      if (!initialLoad.current.client) {
        initialLoad.current.client = true
        prevClientJobs.current = jobMap
        return
      }

      const prev = prevClientJobs.current
      for (const [key, job] of jobMap) {
        const old = prev?.get(key)
        if (!old) continue

        if (old.status === 'funded' && job.status === 'funded' && old.updatedAt !== job.updatedAt) {
          toast('New Application', {
            description: `Someone applied to "${job.title}"`,
            action: { label: 'Review', onClick: () => { window.location.href = `/jobs/${key}` } },
          })
        }
        if (old.status === 'inProgress' && job.status === 'submitted') {
          toast('Work Submitted', {
            description: `"${job.title}" — ready for your review`,
            action: { label: 'View', onClick: () => { window.location.href = `/jobs/${key}` } },
          })
        }
        if (old.status === 'submitted' && job.status === 'released') {
          toast.success('Payment Released', {
            description: `${lamportsToSol(job.amount)} SOL for "${job.title}"`,
          })
        }
        if (old.status !== 'disputed' && job.status === 'disputed') {
          toast.error('Job Disputed', {
            description: `"${job.title}" has been disputed`,
            action: { label: 'View', onClick: () => { window.location.href = `/jobs/${key}` } },
          })
        }
      }

      prevClientJobs.current = jobMap
    })

    const unsubFreelancer = db.jobs.subscribeByFreelancer(wallet, (jobs) => {
      const jobMap = new Map(jobs.map((j) => [`${j.clientWallet}_${j.jobId}`, j]))

      if (!initialLoad.current.freelancer) {
        initialLoad.current.freelancer = true
        prevFreelancerJobs.current = jobMap
        return
      }

      const prev = prevFreelancerJobs.current
      for (const [key, job] of jobMap) {
        if (!prev?.has(key)) {
          toast.success('You were selected!', {
            description: `Chosen for "${job.title}" (${lamportsToSol(job.amount)} SOL)`,
            action: { label: 'View Job', onClick: () => { window.location.href = `/jobs/${key}` } },
            duration: 8000,
          })
        } else {
          const old = prev.get(key)
          if (old.status === 'submitted' && job.status === 'released') {
            toast.success('Payment Received!', {
              description: `${lamportsToSol(job.amount)} SOL for "${job.title}"`,
              action: { label: 'View', onClick: () => { window.location.href = `/jobs/${key}` } },
              duration: 8000,
            })
          }
          if (old.status !== 'disputed' && job.status === 'disputed') {
            toast.error('Job Disputed', {
              description: `"${job.title}" has been disputed`,
              action: { label: 'View', onClick: () => { window.location.href = `/jobs/${key}` } },
            })
          }
        }
      }

      prevFreelancerJobs.current = jobMap
    })

    return () => {
      unsubClient()
      unsubFreelancer()
    }
  }, [connected, publicKey])
}
