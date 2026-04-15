import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ticketsAPI } from '../../api/axiosClient'
import { useAuthStore } from '../../store/authStore'

export default function AdminDashboard() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false)

  useEffect(() => {
    fetchTickets()
  }, [])

  // FIX: Pull-to-refresh functionality matching Flutter RefreshIndicator
  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchTickets()
    setRefreshing(false)
  }, [])

  const fetchTickets = async () => {
    try {
      const res = await ticketsAPI.getAdmin()
      setTickets(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      console.error('Error fetching admin tickets:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const filteredTickets = tickets.filter(t => 
    t.issueTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.patientId?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700',
      assigned: 'bg-blue-100 text-blue-700',
      // FIX: Correct status format for backend (in_progress, not in-progress)
      in_progress: 'bg-blue-100 text-blue-700',
      resolved: 'bg-green-100 text-green-700',
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  // FIX: Show status modal like Flutter bottom sheet
  const showUpdateStatusModal = (ticket) => {
    setSelectedTicket(ticket)
    setShowStatusModal(true)
  }

  // FIX: Correct status values - backend expects 'in_progress' not 'in-progress'
  const handleUpdateStatus = async (status, assignCaseNumber) => {
    if (!selectedTicket) return
    
    setStatusUpdateLoading(true)
    try {
      await ticketsAPI.update(selectedTicket._id || selectedTicket.id, { 
        status,
        assignCaseNumber
      })
      setShowStatusModal(false)
      setSelectedTicket(null)
      await fetchTickets()
    } catch (err) {
      console.error('Error updating status:', err)
      alert('Error updating ticket status')
    } finally {
      setStatusUpdateLoading(false)
    }
  }

  const handleDelete = async (ticketId) => {
    if (!window.confirm('Are you sure you want to delete this ticket?')) return
    try {
      await ticketsAPI.delete(ticketId)
      fetchTickets()
    } catch (err) {
      console.error('Error deleting ticket:', err)
    }
  }

  // FIX: Calculate stats for analytics chart (matching Flutter TicketStatusChart)
  const ticketStats = {
    pending: tickets.filter(t => t.status === 'pending').length,
    assigned: tickets.filter(t => t.status === 'assigned').length,
    in_progress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    total: tickets.length
  }

  const maxStat = Math.max(ticketStats.pending, ticketStats.assigned, ticketStats.in_progress, ticketStats.resolved, 1)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Status Update Modal - FIX: Matches Flutter bottom sheet */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div className="bg-white w-full max-w-lg rounded-t-2xl p-6 animate-slide-up">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Ticket Status</h3>
            <div className="space-y-2">
              <button
                onClick={() => handleUpdateStatus('in_progress', true)}
                disabled={statusUpdateLoading}
                className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-blue-50 transition"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <span className="font-medium text-gray-900">In Progress</span>
              </button>
              <button
                onClick={() => handleUpdateStatus('resolved', false)}
                disabled={statusUpdateLoading}
                className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-green-50 transition"
              >
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="font-medium text-gray-900">Resolved</span>
              </button>
            </div>
            <button
              onClick={() => setShowStatusModal(false)}
              className="w-full mt-4 py-3 text-gray-500 hover:text-gray-700 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-secondary rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              {/* FIX: Show hospitalId in header like Flutter */}
              <h1 className="text-xl font-semibold text-gray-900">
                Admin: {user?.hospitalId || 'Hospital'}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/settings" className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </Link>
              <button onClick={handleLogout} className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-secondary"></div>
          </div>
        ) : (
          <>
            {/* FIX: Ticket Analytics Chart Section (matching Flutter TicketStatusChart) */}
            <div className="bg-white rounded-xl p-6 shadow-card mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Ticket Analytics</h2>
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-yellow-600 font-medium">Pending</span>
                    <span className="text-gray-500">{ticketStats.pending}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-500 rounded-full transition-all"
                      style={{ width: `${(ticketStats.pending / maxStat) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-600 font-medium">Assigned</span>
                    <span className="text-gray-500">{ticketStats.assigned}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: `${(ticketStats.assigned / maxStat) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary font-medium">In Progress</span>
                    <span className="text-gray-500">{ticketStats.in_progress}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-secondary rounded-full transition-all"
                      style={{ width: `${(ticketStats.in_progress / maxStat) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600 font-medium">Resolved</span>
                    <span className="text-gray-500">{ticketStats.resolved}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full transition-all"
                      style={{ width: `${(ticketStats.resolved / maxStat) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Search Section */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search tickets by title or patient ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition"
              />
            </div>

            {/* Tickets Header */}
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Recent Tickets</h2>
              <span className="px-3 py-1 bg-secondary/10 text-secondary font-medium rounded-full">
                {filteredTickets.length} ticket{filteredTickets.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* FIX: Pull-to-refresh wrapper */}
            <div className="min-h-[200px]">
              {refreshing && (
                <div className="flex justify-center py-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-secondary"></div>
                </div>
              )}
              
              {filteredTickets.length === 0 ? (
                <div className="bg-white rounded-xl p-12 shadow-card text-center">
                  <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Tickets Assigned</h3>
                  <p className="text-gray-500">Tickets assigned to you will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredTickets.map((ticket) => (
                    <div key={ticket._id || ticket.id} className="bg-white rounded-xl p-4 shadow-card border border-gray-100 hover:shadow-md transition">
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg ${getStatusColor(ticket.status).split(' ')[0]}`}>
                          <svg className={`w-5 h-5 ${getStatusColor(ticket.status).split(' ')[1]}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <Link to={`/ticket-details?id=${ticket._id || ticket.id}`} className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{ticket.issueTitle}</h3>
                          <p className="text-sm text-gray-500">Patient ID: {ticket.patientId}</p>
                          <div className="flex gap-2 mt-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ticket.status)}`}>
                              {ticket.status?.replace('_', '-').toUpperCase()}
                            </span>
                          </div>
                        </Link>
                        <div className="flex gap-1">
                          <Link to={`/ticket-reply?id=${ticket._id || ticket.id}`} className="p-2 text-primary hover:bg-primary-light rounded-lg" title="Chat & Reply">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                          </Link>
                          <button 
                            onClick={() => showUpdateStatusModal(ticket)} 
                            className="p-2 text-secondary hover:bg-secondary-light rounded-lg" 
                            title="Update Status"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => handleDelete(ticket._id || ticket.id)} 
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg" 
                            title="Delete Ticket"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
