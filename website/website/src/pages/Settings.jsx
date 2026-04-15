import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'

export default function Settings() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const { isDarkMode, toggleTheme } = useThemeStore()

  const handleThemeToggle = () => {
    toggleTheme()
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link to="/" className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 mr-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Name</span>
                <span className="text-gray-900 font-medium">{user?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Email</span>
                <span className="text-gray-900 font-medium">{user?.email || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Role</span>
                <span className="text-gray-900 font-medium capitalize">{user?.role || 'N/A'}</span>
              </div>
              {user?.hospitalId && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Hospital</span>
                  <span className="text-gray-900 font-medium">{user.hospitalId}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-900 font-medium">Dark Mode</p>
                <p className="text-sm text-gray-500">Switch between light and dark theme</p>
              </div>
              <button
                onClick={handleThemeToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${isDarkMode ? 'bg-primary' : 'bg-gray-200'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">App Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Version</span>
                <span className="text-gray-900">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Build</span>
                <span className="text-gray-900">2024.1</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-card">
            <button onClick={handleLogout} className="w-full px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}