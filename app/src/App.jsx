import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AnchorProvider } from '@/contexts/AnchorContext'
import { ProfileProvider } from '@/contexts/ProfileContext'
import NavBar from '@/components/NavBar'
import Home from '@/pages/Home'
import Jobs from '@/pages/Jobs'
import NewJob from '@/pages/NewJob'
import JobDetail from '@/pages/JobDetail'
import Profile from '@/pages/Profile'
import AdminDisputes from '@/pages/AdminDisputes'
import Dashboard from '@/pages/Dashboard'
import Lookup from '@/pages/Lookup'

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
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/new" element={<NewJob />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/profile/:wallet" element={<Profile />} />
          <Route path="/lookup" element={<Lookup />} />
          <Route path="/admin/disputes" element={<AdminDisputes />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
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
        </BrowserRouter>
      </ProfileProvider>
    </AnchorProvider>
  )
}

export default App
