import { useEffect, useState } from 'react'
import type { TurnSpec } from '../components/Turntable'

/**
 * Which products have a real frame-sequence turntable available.
 * Populated from public/turns/manifest.json — empty by default, so the site
 * falls back to the live three.js stage until frames are dropped in.
 */
export type TurnIndex = Record<string, TurnSpec>

let cached: TurnIndex | null = null

export function useTurns(): TurnIndex {
  const [turns, setTurns] = useState<TurnIndex>(cached ?? {})

  useEffect(() => {
    if (cached) return
    let cancelled = false
    fetch('/turns/manifest.json')
      .then((r) => (r.ok ? r.json() : {}))
      .then((json: TurnIndex) => {
        cached = json ?? {}
        if (!cancelled) setTurns(cached)
      })
      .catch(() => {
        cached = {}
      })
    return () => {
      cancelled = true
    }
  }, [])

  return turns
}
