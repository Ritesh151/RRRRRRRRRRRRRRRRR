import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useThemeStore = create(
  persist(
    (set, get) => ({
      isDarkMode: false,

      toggleTheme: () => {
        const newMode = !get().isDarkMode
        set({ isDarkMode: newMode })
        
        if (newMode) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      },

      initializeTheme: () => {
        const { isDarkMode } = get()
        if (isDarkMode) {
          document.documentElement.classList.add('dark')
        }
      },
    }),
    {
      name: 'theme-storage',
    }
  )
)