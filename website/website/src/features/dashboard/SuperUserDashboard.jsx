import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { hospitalsAPI, dashboardAPI, usersAPI } from '../../api/axiosClient'
import { useAuthStore } from '../../store/authStore'

export default function SuperUserDashboard() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ totalHospitals: 0, totalTickets: 0 })
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [hospRes, statsRes] = await Promise.all([
        hospitalsAPI.getAll(),
        dashboardAPI.getStats()
      ])
      
      if (hospRes.data) {
        setHospitals(Array.isArray(hospRes.data) ? hospRes.data : [])
      }
      
      if (statsRes.data) {
        setStats(statsRes.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const filteredHospitals = hospitals.filter(h => {
    const matchesSearch = h.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          h.city?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || h.type === filterType
    return matchesSearch && matchesType
  })

  const getTypeColor = (type) => {
    const colors = {
      gov: 'bg-blue-100 text-blue-700',
      private: 'bg-green-100 text-green-700',
      semi: 'bg-yellow-100 text-yellow-700',
    }
    return colors[type] || 'bg-gray-100 text-gray-700'
  }

  const getTypeLabel = (type) => {
    const labels = {
      gov: 'Government',
      private: 'Private',
      semi: 'Semi-Gov',
    }
    return labels[type] || type
  }

  const handleAddHospital = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const data = {
      name: formData.get('name'),
      type: formData.get('type'),
      city: formData.get('city'),
      address: formData.get('address'),
    }
    
    try {
      await hospitalsAPI.create(data)
      setShowAddModal(false)
      fetchData()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteHospital = async (id) => {
    if (!window.confirm('Are you sure you want to delete this hospital?')) return
    try {
      await hospitalsAPI.delete(id)
      fetchData()
    } catch (err) {
      console.error(err)
    }
  }

  const handleAssignAdmin = async (hospitalId) => {
    const name = prompt('Admin Name:')
    const email = prompt('Admin Email:')
    const password = prompt('Admin Password:')
    
    if (!name || !email || !password) return
    
    try {
      await usersAPI.assignAdmin({ name, email, password, hospitalId })
      alert('Admin assigned successfully!')
    } catch (err) {
      alert('Error assigning admin')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold">Super User Portal</h1>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/settings" className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </Link>
              <button onClick={handleLogout} className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg">
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
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-card">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalHospitals || hospitals.length}</p>
                    <p className="text-sm text-gray-500">Total Hospitals</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-card">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalTickets || 0}</p>
                    <p className="text-sm text-gray-500">Total Tickets</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-card">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.activeAdmins || 0}</p>
                    <p className="text-sm text-gray-500">Active Admins</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-card">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalUsers || 0}</p>
                    <p className="text-sm text-gray-500">Total Users</p>
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">Hospital Management</h2>
            
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="Search hospitals by name or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
              />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
              >
                <option value="all">All Types</option>
                <option value="gov">Government</option>
                <option value="private">Private</option>
                <option value="semi">Semi-Government</option>
              </select>
            </div>

            {filteredHospitals.length === 0 ? (
              <div className="bg-white rounded-xl p-12 shadow-card text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Hospitals Found</h3>
                <p className="text-gray-500">
                  {filterType === 'all' ? 'No hospitals have been added yet.' : 'No hospitals found for this type.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredHospitals.map((hospital) => (
                  <div key={hospital._id || hospital.id} className="bg-white rounded-xl p-6 shadow-card border border-gray-100">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${getTypeColor(hospital.type).split(' ')[0]}`}>
                        <svg className={`w-7 h-7 ${getTypeColor(hospital.type).split(' ')[1]}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{hospital.name}</h3>
                        <div className="flex gap-2 mt-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(hospital.type)}`}>
                            {getTypeLabel(hospital.type)}
                          </span>
                          <span className="px-2 py-1 text-xs text-gray-500 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {hospital.city}
                          </span>
                        </div>
                        {hospital.address && (
                          <p className="text-sm text-gray-500 mt-2">{hospital.address}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleAssignAdmin(hospital._id || hospital.id)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Assign Admin">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                          </svg>
                        </button>
                        <button onClick={() => handleDeleteHospital(hospital._id || hospital.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="Delete Hospital">
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
          </>
        )}
      </main>

      <button onClick={() => setShowAddModal(true)} className="fixed bottom-6 right-6 bg-primary text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:bg-primary-dark transition flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Hospital
      </button>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Add New Hospital</h3>
            <form onSubmit={handleAddHospital}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Name</label>
                  <input name="name" required className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select name="type" required className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none">
                    <option value="gov">Government</option>
                    <option value="private">Private</option>
                    <option value="semi">Semi-Government</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input name="city" required className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input name="address" className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">Save Hospital</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}