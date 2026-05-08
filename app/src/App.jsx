import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Toaster, toast } from 'sonner'
import { useWallet } from '@solana/wallet-adapter-react'
import { AnchorProvider } from '@/contexts/AnchorContext'
import { ProfileProvider } from '@/contexts/ProfileContext'
import { useNotifications } from '@/hooks/useNotifications'
import { ADMIN_PUBKEY } from '@/lib/solana'
import NavBar from '@/components/NavBar'
import Home from '@/pages/Home'
import Jobs from '@/pages/Jobs'
import NewJob from '@/pages/NewJob'
import JobDetail from '@/pages/JobDetail'
import Profile from '@/pages/Profile'
import AdminDisputes from '@/pages/AdminDisputes'
import Dashboard from '@/pages/Dashboard'
import Lookup from '@/pages/Lookup'
import NotFound from '@/pages/NotFound'

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/new" element={<ProtectedRoute><NewJob /></ProtectedRoute>} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/profile/:wallet" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/lookup" element={<Lookup />} />
          <Route path="/admin/disputes" element={<AdminRoute><AdminDisputes /></AdminRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

function ProtectedRoute({ children }) {
  const { connected } = useWallet()
  if (!connected) {
    toast('Connect your wallet to access this page', { id: 'auth-guard' })
    return <Navigate to="/" replace />
  }
  return children
}

function AdminRoute({ children }) {
  const { publicKey, connected } = useWallet()
  if (!connected || !publicKey?.equals(ADMIN_PUBKEY)) {
    return <Navigate to="/" replace />
  }
  return children
}

function GlobalNotifications() {
  useNotifications()
  return null
}

function App() {
  return (
    <AnchorProvider>
      <ProfileProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-background text-foreground">
            <NavBar />
            <AnimatedRoutes />
          </div>
          <GlobalNotifications />
          <Toaster
            theme="dark"
            position="top-right"
            toastOptions={{
              style: {
                background: '#1a1a1a',
                border: '1px solid #2a2a2a',
                color: '#fff',
                fontFamily: 'var(--font-display)',
              },
            }}
          />
        </BrowserRouter>
      </ProfileProvider>
    </AnchorProvider>
  )
}

export default App
