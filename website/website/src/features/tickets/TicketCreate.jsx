import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ticketsAPI, hospitalsAPI } from '../../api/axiosClient'

export default function TicketCreate() {
  const navigate = useNavigate()
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [issueTitle, setIssueTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [category, setCategory] = useState('general_inquiry')
  const [hospitalId, setHospitalId] = useState('')

  useEffect(() => {
    hospitalsAPI.getAll()
      .then(res => {
        if (Array.isArray(res.data)) {
          setHospitals(res.data)
        }
      })
      .catch(() => {})
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      const data = {
        issueTitle,
        description,
        priority,
        category,
        ...(hospitalId && { hospitalId })
      }
      
      await ticketsAPI.create(data)
      navigate('/patient')
    } catch (err) {
      setError(err.message || 'Failed to create ticket')
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    { value: 'general_inquiry', label: 'General Inquiry' },
    { value: 'appointment', label: 'Appointment' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'prescription', label: 'Prescription' },
    { value: 'lab_report', label: 'Lab Report' },
    { value: 'billing', label: 'Billing' },
  ]

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'emergency', label: 'Emergency' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link to="/patient" className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 mr-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">Create New Ticket</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl p-6 shadow-card">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Issue Title</label>
                <input
                  type="text"
                  value={issueTitle}
                  onChange={(e) => setIssueTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="Enter a brief title for your issue"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="Describe your issue in detail"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  >
                    {priorities.map(p => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  >
                    {categories.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {hospitals.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hospital (Optional)</label>
                  <select
                    value={hospitalId}
                    onChange={(e) => setHospitalId(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  >
                    <option value="">Select a hospital</option>
                    {hospitals.map(h => (
                      <option key={h._id || h.id} value={h._id || h.id}>{h.name} - {h.city}</option>
                    ))}
                  </select>
                </div>
              )}
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-dark transition disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Ticket'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}