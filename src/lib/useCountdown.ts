import { useEffect, useState } from 'react'

function secondsUntil(deadline?: number): number {
  if (!deadline) return 0
  return Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
}

export function useCountdown(deadline?: number): number {
  const [remaining, setRemaining] = useState(() => secondsUntil(deadline))
  const [prevDeadline, setPrevDeadline] = useState(deadline)

  if (deadline !== prevDeadline) {
    setPrevDeadline(deadline)
    setRemaining(secondsUntil(deadline))
  }

  useEffect(() => {
    if (!deadline) {
      setRemaining(0)
      return
    }
    const timer = setInterval(() => {
      const next = secondsUntil(deadline)
      setRemaining(next)
      if (next === 0) clearInterval(timer)
    }, 1000)
    setRemaining(secondsUntil(deadline))
    return () => clearInterval(timer)
  }, [deadline])

  return remaining
}

export function formatWait(seconds: number): string {
  if (seconds > 90) {
    const minutes = Math.ceil(seconds / 60)
    return `about ${minutes} minute${minutes === 1 ? '' : 's'}`
  }
  return `${seconds} second${seconds === 1 ? '' : 's'}`
}
