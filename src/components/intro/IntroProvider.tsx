import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

interface IntroValue {
  introDone: boolean
  completeIntro: () => void
}

const IntroContext = createContext<IntroValue>({ introDone: true, completeIntro: () => {} })

export function IntroProvider({ active, children }: { active: boolean; children: ReactNode }) {
  const [introDone, setIntroDone] = useState(!active)
  const completeIntro = useCallback(() => setIntroDone(true), [])

  useEffect(() => {
    if (!active) setIntroDone(true)
  }, [active])

  const value = useMemo(() => ({ introDone, completeIntro }), [introDone, completeIntro])

  return <IntroContext.Provider value={value}>{children}</IntroContext.Provider>
}

export function useIntro(): IntroValue {
  return useContext(IntroContext)
}
