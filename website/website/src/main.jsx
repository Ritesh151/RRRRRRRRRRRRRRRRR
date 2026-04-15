import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { useThemeStore } from './store/themeStore'

function ThemeInitializer() {
  const initializeTheme = useThemeStore((state) => state.initializeTheme)
  React.useEffect(() => {
    initializeTheme()
  }, [initializeTheme])
  return null
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeInitializer />
    <App />
  </React.StrictMode>,
)