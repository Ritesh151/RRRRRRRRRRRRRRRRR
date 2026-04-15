import { useEffect, useState, useRef } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { ticketsAPI, chatAPI } from '../../api/axiosClient'
import { useAuthStore } from '../../store/authStore'

export default function TicketDetails() {
  const [searchParams] = useSearchParams()
  const ticketId = searchParams.get('id')
  const navigate = useNavigate()
  const { user } = useAuthStore()
  
  const [ticket, setTicket] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [messageInput, setMessageInput] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (ticketId) {
      fetchTicket()
      fetchMessages()
    }
  }, [ticketId])

  const fetchTicket = async () => {
    try {
      const res = await ticketsAPI.getById(ticketId)
      setTicket(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async () => {
    try {
      const res = await chatAPI.getMessages(ticketId)
      setMessages(Array.isArray(res.data) ? res.data : [])
      scrollToBottom()
    } catch (err) {
      console.error(err)
    }
  }

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!messageInput.trim()) return
    
    setSending(true)
    try {
      await chatAPI.sendMessage(ticketId, messageInput.trim())
      setMessageInput('')
      fetchMessages()
    } catch (err) {
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700',
      assigned: 'bg-blue-100 text-blue-700',
      in_progress: 'bg-blue-100 text-blue-700',
      resolved: 'bg-green-100 text-green-700',
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-green-100 text-green-700',
      medium: 'bg-blue-100 text-blue-700',
      high: 'bg-yellow-100 text-yellow-700',
      emergency: 'bg-red-100 text-red-700',
    }
    return colors[priority] || 'bg-gray-100 text-gray-700'
  }

  const formatDate = (date) => {
    if (!date) return 'Never'
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Ticket not found</h2>
          <Link to="/" className="text-primary hover:underline">Go back</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button onClick={() => navigate(-1)} className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 mr-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Ticket Details</h1>
            <div className="ml-auto">
              {user?.role === 'admin' && (
                <Link to={`/ticket-reply?id=${ticketId}`} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">
                  Open Chat
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl p-6 shadow-card mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-primary font-medium">Case: {ticket.caseNumber}</p>
              <h2 className="text-xl font-semibold text-gray-900 mt-1">{ticket.issueTitle}</h2>
            </div>
            <div className="flex gap-2">
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getPriorityColor(ticket.priority)}`}>
                {ticket.priority?.toUpperCase()}
              </span>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(ticket.status)}`}>
                {ticket.status?.toUpperCase()}
              </span>
            </div>
          </div>
          
          <p className="text-gray-600 mb-4">{ticket.description}</p>
          
          <div className="flex gap-4 text-sm text-gray-500">
            <span>Category: {ticket.category?.replace('_', ' ').toUpperCase()}</span>
            <span>Created: {formatDate(ticket.createdAt)}</span>
          </div>
        </div>

        {ticket.reply && (
          <div className="bg-green-50 rounded-xl p-6 shadow-card mb-6 border border-green-200">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-green-700">Doctor Recommendation</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-green-600 font-medium">Doctor:</span> {ticket.reply.doctorName}</div>
              <div><span className="text-green-600 font-medium">Specialization:</span> {ticket.reply.specialization}</div>
              <div><span className="text-green-600 font-medium">Phone:</span> {ticket.reply.doctorPhone}</div>
            </div>
            <div className="mt-4 pt-4 border-t border-green-200">
              <p className="text-green-600 font-medium">Message:</p>
              <p className="text-gray-700 mt-1">{ticket.reply.replyMessage}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-card">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Messages</h3>
          </div>
          
          <div className="p-4 max-h-96 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-gray-500">No messages yet</p>
                <p className="text-sm text-gray-400">Start the conversation</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => {
                  const isMe = msg.senderId === user?.id || msg.senderId === user?._id
                  return (
                    <div key={msg._id || msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${isMe ? 'bg-primary text-white' : 'bg-gray-100 text-gray-900'}`}>
                        {!isMe && <p className="text-xs font-medium text-gray-500 mb-1">{msg.senderName}</p>}
                        <p className="text-sm">{msg.text}</p>
                        <p className={`text-xs mt-1 ${isMe ? 'text-white/70' : 'text-gray-400'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          
          <form onSubmit={sendMessage} className="p-4 border-t border-gray-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              />
              <button
                type="submit"
                disabled={sending || !messageInput.trim()}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}