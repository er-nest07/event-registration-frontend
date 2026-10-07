import { useEffect } from 'react'
import { useState } from 'react'

type Theme = 'light' | 'dark'

function currentTheme(): Theme {
  const stored = localStorage.getItem('css-theme')
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  localStorage.setItem('css-theme', theme)
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => currentTheme())

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const next = theme === 'dark' ? 'light' : 'dark'

  return (
    <button
      type="button"
      aria-label={`Switch to ${next} mode`}
      onClick={() => setTheme(next)}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface-raised text-heading transition-colors hover:bg-surface-inset focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {theme === 'dark' ? (
          <circle cx="12" cy="12" r="4" />
        ) : (
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        )}
      </svg>
    </button>
  )
}
