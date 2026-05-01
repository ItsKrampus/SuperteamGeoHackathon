import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AnchorProvider } from '@/contexts/AnchorContext'
import NavBar from '@/components/NavBar'
import Home from '@/pages/Home'
import Jobs from '@/pages/Jobs'
import NewJob from '@/pages/NewJob'
import JobDetail from '@/pages/JobDetail'
import Profile from '@/pages/Profile'
import AdminDisputes from '@/pages/AdminDisputes'
import Dashboard from '@/pages/Dashboard'

function App() {
  return (
    <AnchorProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-background text-foreground">
          <NavBar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/new" element={<NewJob />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
            <Route path="/profile/:wallet" element={<Profile />} />
            <Route path="/admin/disputes" element={<AdminDisputes />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AnchorProvider>
  )
}

export default App
