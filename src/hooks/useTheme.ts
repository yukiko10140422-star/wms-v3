import { useState, useEffect } from 'react'

const THEME_KEY = 'wms-theme'

export type Theme = 'light' | 'dark' | 'system'

function getSystemDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function applyTheme(theme: Theme) {
  const isDark = theme === 'dark' || (theme === 'system' && getSystemDark())
  document.documentElement.classList.toggle('dark', isDark)
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      return (localStorage.getItem(THEME_KEY) as Theme) || 'light'
    } catch {
      return 'light'
    }
  })

  useEffect(() => {
    applyTheme(theme)
    try {
      localStorage.setItem(THEME_KEY, theme)
    } catch { /* ignore */ }
  }, [theme])

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyTheme('system')
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  const setTheme = (t: Theme) => setThemeState(t)

  return { theme, setTheme }
}
