import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import OrganiserDashboard from './pages/OrganiserDashboard'
import StartupDashboard from './pages/StartupDashboard'
import InvestorDashboard from './pages/InvestorDashboard'
import EventDetails from './pages/EventDetails'
import Unauthorized from './pages/Unauthorized'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-900">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/organiser/dashboard"
              element={
                <ProtectedRoute allowedRoles={['organiser']}>
                  <OrganiserDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/startup/dashboard"
              element={
                <ProtectedRoute allowedRoles={['startup']}>
                  <StartupDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/investor/dashboard"
              element={
                <ProtectedRoute allowedRoles={['investor']}>
                  <InvestorDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/events/:eventName" element={<EventDetails />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App

