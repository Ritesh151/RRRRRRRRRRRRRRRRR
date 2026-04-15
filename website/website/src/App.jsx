import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './store/authStore'
import Login from './features/auth/Login'
import Register from './features/auth/Register'
import PatientDashboard from './features/dashboard/PatientDashboard'
import AdminDashboard from './features/dashboard/AdminDashboard'
import SuperUserDashboard from './features/dashboard/SuperUserDashboard'
import Settings from './pages/Settings'
import TicketDetails from './features/tickets/TicketDetails'
import TicketReply from './features/tickets/TicketReply'
import TicketCreate from './features/tickets/TicketCreate'

function PrivateRoute({ children, allowedRoles }) {
  const { user, isLoading } = useAuthStore()
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  // FIX: Allow multiple roles (e.g., ['admin', 'super'] can both access admin dashboard)
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }
  
  return children
}

function DashboardRouter() {
  const { user } = useAuthStore()
  
  if (!user) return <Navigate to="/login" replace />
  
  // FIX: Both admin and super users go to admin dashboard (matching Flutter behavior)
  switch (user.role) {
    case 'admin':
    case 'super':
      return <Navigate to="/admin" replace />
    default:
      return <Navigate to="/patient" replace />
  }
}

function App() {
  const initialize = useAuthStore((state) => state.initialize)
  
  useEffect(() => {
    initialize()
  }, [initialize])
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/" element={<DashboardRouter />} />
        
        <Route 
          path="/patient" 
          element={
            <PrivateRoute allowedRoles={['patient']}>
              <PatientDashboard />
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/admin" 
          element={
            <PrivateRoute allowedRoles={['admin', 'super']}>
              <AdminDashboard />
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/super" 
          element={
            <PrivateRoute allowedRoles={['super']}>
              <SuperUserDashboard />
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/settings" 
          element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/ticket-details" 
          element={
            <PrivateRoute>
              <TicketDetails />
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/ticket-reply" 
          element={
            <PrivateRoute allowedRoles={['admin', 'super']}>
              <TicketReply />
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/ticket-create" 
          element={
            <PrivateRoute allowedRoles={['patient']}>
              <TicketCreate />
            </PrivateRoute>
          } 
        />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App