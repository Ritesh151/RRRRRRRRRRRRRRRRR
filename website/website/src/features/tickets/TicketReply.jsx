import { useEffect, useState, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { ticketsAPI, chatAPI } from '../../api/axiosClient'
import { useAuthStore } from '../../store/authStore'

const specializations = [
  'Dentist', 'Bone Specialist', 'Cardiologist', 'Neurologist', 'Dermatologist',
  'Orthopedic', 'Pediatrician', 'Gynecologist', 'Psychiatrist', 'General Physician',
  'Oncologist', 'Radiologist'
]

export default function TicketReply() {
  const [searchParams] = useSearchParams()
  const ticketId = searchParams.get('id')
  const navigate = useNavigate()
  const { user } = useAuthStore()
  
  const [ticket, setTicket] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('chat')
  
  const [doctorName, setDoctorName] = useState('')
  const [doctorPhone, setDoctorPhone] = useState('')
  const [specialization, setSpecialization] = useState('')
  const [replyMessage, setReplyMessage] = useState('')
  const [chatMessage, setChatMessage] = useState('')
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

  const sendChatMessage = async (e) => {
    e.preventDefault()
    if (!chatMessage.trim()) return
    
    setSending(true)
    try {
      await chatAPI.sendMessage(ticketId, chatMessage.trim())
      setChatMessage('')
      fetchMessages()
    } catch (err) {
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  const submitReply = async (e) => {
    e.preventDefault()
    if (!doctorName || !doctorPhone || !specialization || !replyMessage) {
      alert('Please fill all fields')
      return
    }
    
    setSending(true)
    try {
      await ticketsAPI.reply(ticketId, {
        doctorName,
        doctorPhone,
        specialization,
        replyMessage
      })
      alert('Reply sent successfully!')
      navigate('/admin')
    } catch (err) {
      console.error(err)
      alert('Error sending reply')
    } finally {
      setSending(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700',
      assigned: 'bg-blue-100 text-blue-700',
      resolved: 'bg-green-100 text-green-700',
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  const formatTime = (date) => {
    if (!date) return ''
    return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
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
          <button onClick={() => navigate(-1)} className="text-primary hover:underline">Go back</button>
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
            <h1 className="text-xl font-semibold text-gray-900">Ticket: {ticket.issueTitle}</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-card mb-6">
          <div className="border-b border-gray-100">
            <div className="flex">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 px-6 py-4 text-center font-medium ${activeTab === 'chat' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Chat
                </span>
              </button>
              <button
                onClick={() => setActiveTab('reply')}
                className={`flex-1 px-6 py-4 text-center font-medium ${activeTab === 'reply' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                  Form Reply
                </span>
              </button>
            </div>
          </div>

          <div className="p-4 bg-gray-50">
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Issue: {ticket.issueTitle}</h3>
              <p className="text-gray-600 text-sm mb-3">{ticket.description}</p>
              <div className="flex gap-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ticket.status)}`}>
                  {ticket.status?.toUpperCase()}
                </span>
                <span className="px-2 py-1 text-xs text-gray-500">
                  ID: {ticket._id || ticket.id}
                </span>
              </div>
            </div>
          </div>

          {activeTab === 'chat' ? (
            <div>
              <div className="p-4 max-h-96 overflow-y-auto">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <p className="text-gray-500">No messages yet</p>
                    <p className="text-sm text-gray-400">Start the conversation below</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((msg) => {
                      const isMe = msg.senderId === user?.id || msg.senderId === user?._id
                      return (
                        <div key={msg._id || msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className="flex items-end gap-2 max-w-[75%]">
                            {!isMe && (
                              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">
                                {msg.senderName?.[0]?.toUpperCase() || '?'}
                              </div>
                            )}
                            <div className={`rounded-2xl px-4 py-2 ${isMe ? 'bg-primary text-white' : 'bg-gray-100 text-gray-900'}`}>
                              {!isMe && <p className="text-xs font-medium text-gray-500 mb-1">{msg.senderName}</p>}
                              <p className="text-sm">{msg.text}</p>
                              <p className={`text-xs mt-1 ${isMe ? 'text-white/70' : 'text-gray-400'}`}>
                                {formatTime(msg.createdAt)}
                              </p>
                            </div>
                            {isMe && (
                              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-sm font-medium text-white">
                                Me
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
              
              <form onSubmit={sendChatMessage} className="p-4 border-t border-gray-100">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                  <button
                    type="submit"
                    disabled={sending || !chatMessage.trim()}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <form onSubmit={submitReply} className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Doctor Name</label>
                  <input
                    type="text"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Doctor Phone Number</label>
                  <input
                    type="tel"
                    value={doctorPhone}
                    onChange={(e) => setDoctorPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    required
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                <select
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  required
                >
                  <option value="">Select specialization</option>
                  {specializations.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Reply Message</label>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={sending}
                className="w-full mt-6 bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-dark disabled:opacity-50"
              >
                {sending ? 'Sending...' : 'Send Reply'}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  )
}