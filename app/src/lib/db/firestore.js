import { fireDb } from './firebase'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore'

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function stripUndefined(obj) {
  const clean = {}
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) clean[k] = v
  }
  return clean
}

export const firestoreDb = {
  jobs: {
    async list(filters = {}) {
      const snap = await getDocs(collection(fireDb, 'jobs'))
      let jobs = snap.docs.map((d) => d.data())
      if (filters.status) {
        jobs = jobs.filter((j) => j.status === filters.status)
      }
      if (filters.clientWallet) {
        jobs = jobs.filter((j) => j.clientWallet === filters.clientWallet)
      }
      if (filters.freelancerWallet) {
        jobs = jobs.filter((j) => j.freelancerWallet === filters.freelancerWallet)
      }
      return jobs.sort((a, b) => b.createdAt - a.createdAt)
    },

    async get(clientWallet, jobId) {
      const docRef = doc(fireDb, 'jobs', `${clientWallet}_${jobId}`)
      const snap = await getDoc(docRef)
      return snap.exists() ? snap.data() : null
    },

    async create(data) {
      const key = `${data.clientWallet}_${data.jobId}`
      const record = stripUndefined({
        ...data,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
      await setDoc(doc(fireDb, 'jobs', key), record)
      return record
    },

    async update(clientWallet, jobId, patch) {
      const key = `${clientWallet}_${jobId}`
      const docRef = doc(fireDb, 'jobs', key)
      const snap = await getDoc(docRef)
      if (!snap.exists()) return null
      const updates = stripUndefined({ ...patch, updatedAt: Date.now() })
      await updateDoc(docRef, updates)
      return { ...snap.data(), ...updates }
    },

    subscribeByClient(wallet, callback) {
      const q = query(collection(fireDb, 'jobs'), where('clientWallet', '==', wallet))
      return onSnapshot(q, (snap) => {
        const jobs = snap.docs.map((d) => d.data()).sort((a, b) => b.createdAt - a.createdAt)
        callback(jobs)
      }, (err) => console.error('Jobs client subscription error:', err))
    },

    subscribeByFreelancer(wallet, callback) {
      const q = query(collection(fireDb, 'jobs'), where('freelancerWallet', '==', wallet))
      return onSnapshot(q, (snap) => {
        const jobs = snap.docs.map((d) => d.data()).sort((a, b) => b.createdAt - a.createdAt)
        callback(jobs)
      }, (err) => console.error('Jobs freelancer subscription error:', err))
    },

    subscribeOne(clientWallet, jobId, callback) {
      const docRef = doc(fireDb, 'jobs', `${clientWallet}_${jobId}`)
      return onSnapshot(docRef, (snap) => {
        callback(snap.exists() ? snap.data() : null)
      }, (err) => console.error('Job subscription error:', err))
    },
  },

  applications: {
    async listForJob(clientWallet, jobId) {
      const snap = await getDocs(collection(fireDb, 'applications'))
      return snap.docs
        .map((d) => d.data())
        .filter((a) => a.clientWallet === clientWallet && a.jobId === String(jobId))
        .sort((a, b) => b.createdAt - a.createdAt)
    },

    async create(data) {
      const id = generateId()
      const record = stripUndefined({
        ...data,
        id,
        status: 'pending',
        createdAt: Date.now(),
      })
      await setDoc(doc(fireDb, 'applications', id), record)
      await updateDoc(doc(fireDb, 'jobs', `${data.clientWallet}_${data.jobId}`), { updatedAt: Date.now() })
      return record
    },

    async updateStatus(id, status) {
      const docRef = doc(fireDb, 'applications', id)
      const snap = await getDoc(docRef)
      if (!snap.exists()) return null
      const updates = { status, updatedAt: Date.now() }
      await updateDoc(docRef, updates)
      return { ...snap.data(), ...updates }
    },

    subscribeForJob(clientWallet, jobId, callback) {
      const q = query(collection(fireDb, 'applications'))
      return onSnapshot(q, (snap) => {
        const apps = snap.docs
          .map((d) => d.data())
          .filter((a) => a.clientWallet === clientWallet && a.jobId === String(jobId))
          .sort((a, b) => b.createdAt - a.createdAt)
        callback(apps)
      }, (err) => console.error('Applications subscription error:', err))
    },
  },

  messages: {
    async send(data) {
      const id = generateId()
      const record = stripUndefined({
        ...data,
        id,
        createdAt: Date.now(),
      })
      await setDoc(doc(fireDb, 'messages', id), record)
      return record
    },

    subscribe(jobKey, callback) {
      const q = query(
        collection(fireDb, 'messages'),
        where('jobKey', '==', jobKey)
      )
      return onSnapshot(q, (snap) => {
        const msgs = snap.docs
          .map((d) => d.data())
          .sort((a, b) => a.createdAt - b.createdAt)
        callback(msgs)
      }, (err) => {
        console.error('Messages subscription error:', err)
      })
    },
  },
}
