function getStore(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || '{}')
  } catch {
    return {}
  }
}

function setStore(key, data) {
  localStorage.setItem(key, JSON.stringify(data))
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export const localDb = {
  profiles: {
    async get(wallet) {
      const store = getStore('profiles')
      return store[wallet] || null
    },
    async upsert(wallet, data) {
      const store = getStore('profiles')
      store[wallet] = { ...store[wallet], ...data, wallet, updatedAt: Date.now() }
      setStore('profiles', store)
      return store[wallet]
    },
  },

  jobs: {
    async list(filters = {}) {
      const store = getStore('jobs')
      let jobs = Object.values(store)
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
      const store = getStore('jobs')
      return store[`${clientWallet}_${jobId}`] || null
    },
    async create(data) {
      const store = getStore('jobs')
      const key = `${data.clientWallet}_${data.jobId}`
      store[key] = { ...data, createdAt: Date.now(), updatedAt: Date.now() }
      setStore('jobs', store)
      return store[key]
    },
    async update(clientWallet, jobId, patch) {
      const store = getStore('jobs')
      const key = `${clientWallet}_${jobId}`
      if (!store[key]) return null
      store[key] = { ...store[key], ...patch, updatedAt: Date.now() }
      setStore('jobs', store)
      return store[key]
    },
  },

  applications: {
    async listForJob(clientWallet, jobId) {
      const store = getStore('applications')
      return Object.values(store)
        .filter((a) => a.clientWallet === clientWallet && a.jobId === String(jobId))
        .sort((a, b) => b.createdAt - a.createdAt)
    },
    async create(data) {
      const store = getStore('applications')
      const id = generateId()
      store[id] = { ...data, id, status: 'pending', createdAt: Date.now() }
      setStore('applications', store)
      return store[id]
    },
    async updateStatus(id, status) {
      const store = getStore('applications')
      if (!store[id]) return null
      store[id] = { ...store[id], status, updatedAt: Date.now() }
      setStore('applications', store)
      return store[id]
    },
  },

  disputes: {
    async list() {
      const store = getStore('disputes')
      return Object.values(store).sort((a, b) => b.createdAt - a.createdAt)
    },
    async get(clientWallet, jobId) {
      const store = getStore('disputes')
      return store[`${clientWallet}_${jobId}`] || null
    },
    async create(data) {
      const store = getStore('disputes')
      const key = `${data.clientWallet}_${data.jobId}`
      store[key] = { ...data, createdAt: Date.now() }
      setStore('disputes', store)
      return store[key]
    },
    async resolve(clientWallet, jobId, resolution) {
      const store = getStore('disputes')
      const key = `${clientWallet}_${jobId}`
      if (!store[key]) return null
      store[key] = { ...store[key], resolution, resolvedAt: Date.now() }
      setStore('disputes', store)
      return store[key]
    },
  },

  reviews: {
    async create(data) {
      const store = getStore('reviews')
      const id = generateId()
      store[id] = { ...data, id, createdAt: Date.now() }
      setStore('reviews', store)
      return store[id]
    },
    async listForFreelancer(wallet) {
      const store = getStore('reviews')
      return Object.values(store)
        .filter((r) => r.freelancerWallet === wallet)
        .sort((a, b) => b.createdAt - a.createdAt)
    },
  },
}
