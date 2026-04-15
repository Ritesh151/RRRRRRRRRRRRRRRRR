import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../../api/axiosClient'
import { useAuthStore } from '../../store/authStore'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [hospitalId, setHospitalId] = useState('')
  const [cities, setCities] = useState([])
  const [hospitals, setHospitals] = useState([])
  const [selectedCity, setSelectedCity] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { user, register } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    authAPI.getAll()
      .then(res => {
        setHospitals(res.data)
        const uniqueCities = [...new Set(res.data.map(h => h.city).filter(Boolean))]
        setCities(uniqueCities)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (user) navigate('/patient')
  }, [user, navigate])

  const filteredHospitals = selectedCity 
    ? hospitals.filter(h => h.city === selectedCity)
    : []

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!hospitalId) {
      setError('Please select a hospital')
      return
    }
    setError('')
    setLoading(true)
    try {
      await register(name, email, password, hospitalId)
    } catch (err) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-card">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900">Create Account</h2>
          <p className="text-gray-500 mt-2">Join MediTrack Pro to manage your health</p>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-card border border-gray-100">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                placeholder="Enter your full name"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                placeholder="Create a strong password"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select City</label>
              <select
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value)
                  setHospitalId('')
                }}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
              >
                <option value="">Choose your city</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Hospital</label>
              <select
                value={hospitalId}
                onChange={(e) => setHospitalId(e.target.value)}
                disabled={!selectedCity}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition disabled:opacity-50"
              >
                <option value="">
                  {selectedCity ? 'Choose your hospital' : 'Select a city first'}
                </option>
                {filteredHospitals.map(h => (
                  <option key={h._id || h.id} value={h._id || h.id}>{h.name}</option>
                ))}
              </select>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-dark transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  Create Account
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </form>
          
          <p className="mt-6 text-center text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}