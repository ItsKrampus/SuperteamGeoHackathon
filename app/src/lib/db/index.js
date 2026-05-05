import { localDb } from './localStorage'
import { firestoreDb } from './firestore'

export const db = {
  profiles: localDb.profiles,
  jobs: firestoreDb.jobs,
  applications: firestoreDb.applications,
  reviews: localDb.reviews,
  disputes: localDb.disputes,
}
