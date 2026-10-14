import { useEffect, useState } from 'react'

/**
 * Re-renders once a minute. Used by the now marker so "today" and the countdown stay honest without
 * polling the network.
 */
export function useMinuteTick(): void {
  const [, setTick] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setTick((value) => value + 1), 60_000)
    return () => clearInterval(timer)
  }, [])
}
