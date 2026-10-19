import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

interface IntroValue {
  introDone: boolean
  completeIntro: () => void
}

const INTRO_PLAYED_KEY = 'css-intro-played'

function introPlayed(): boolean {
  try {
    return window.sessionStorage.getItem(INTRO_PLAYED_KEY) === '1'
  } catch {
    return false
  }
}

function markIntroPlayed(): void {
  try {
    window.sessionStorage.setItem(INTRO_PLAYED_KEY, '1')
  } catch {
    return
  }
}

const IntroContext = createContext<IntroValue>({ introDone: true, completeIntro: () => {} })

export function IntroProvider({ active, children }: { active: boolean; children: ReactNode }) {
  const [introDone, setIntroDone] = useState(() => !active || introPlayed())
  const completeIntro = useCallback(() => {
    markIntroPlayed()
    setIntroDone(true)
  }, [])

  useEffect(() => {
    if (!active) setIntroDone(true)
  }, [active])

  const value = useMemo(() => ({ introDone, completeIntro }), [introDone, completeIntro])

  return <IntroContext.Provider value={value}>{children}</IntroContext.Provider>
}

export function useIntro(): IntroValue {
  return useContext(IntroContext)
}
