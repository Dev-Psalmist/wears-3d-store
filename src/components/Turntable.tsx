import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Frame-sequence turntable.
 *
 * Drop a folder of evenly spaced views at `public/turns/<slug>/` and list it in
 * `public/turns/manifest.json`; this component then plays a real 0-360 spin that
 * the shopper can scrub by dragging. If a slug has no entry, the caller renders
 * its fallback (the live three.js stage) instead.
 *
 * Frames are drawn to a canvas so scrubbing never flashes between images.
 */
export interface TurnSpec {
  frames: number
  /** File name builder, e.g. "frame-{i}.webp" -> frame-00.webp */
  pattern?: string
  /** Degrees between frames (360 / frames if omitted). */
  step?: number
}

interface TurntableProps {
  slug: string
  spec: TurnSpec
  /** Where the frames live. */
  basePath?: string
  className?: string
  /** Pixels of drag per frame step. */
  sensitivity?: number
}

const pad = (i: number) => String(i).padStart(2, '0')

export function frameUrl(slug: string, spec: TurnSpec, i: number, basePath = '/turns') {
  const pattern = spec.pattern ?? 'frame-{i}.webp'
  return `${basePath}/${slug}/${pattern.replace('{i}', pad(i))}`
}

export function Turntable({ slug, spec, basePath = '/turns', className = '', sensitivity = 14 }: TurntableProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const images = useRef<HTMLImageElement[]>([])
  const [ready, setReady] = useState(false)
  const [index, setIndex] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [spinning, setSpinning] = useState(true)

  const frame = useRef(0)
  const drag = useRef({ startX: 0, startFrame: 0 })
  const idle = useRef(0)
  const raf = useRef(0)

  /* ---------------------------------------------------------- preload ---- */
  useEffect(() => {
    let cancelled = false
    const list: HTMLImageElement[] = []
    let loaded = 0

    for (let i = 0; i < spec.frames; i += 1) {
      const img = new Image()
      img.decoding = 'async'
      img.src = frameUrl(slug, spec, i, basePath)
      img.onload = () => {
        loaded += 1
        if (!cancelled && loaded === spec.frames) {
          images.current = list
          setReady(true)
        }
      }
      img.onerror = () => {
        if (!cancelled) setReady(false)
      }
      list.push(img)
    }

    return () => {
      cancelled = true
    }
  }, [slug, spec, basePath])

  /* ------------------------------------------------------------ paint ---- */
  const paint = useCallback((i: number) => {
    const canvas = canvasRef.current
    const img = images.current[i]
    if (!canvas || !img) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const rect = canvas.getBoundingClientRect()
    const w = Math.max(1, Math.round(rect.width * dpr))
    const h = Math.max(1, Math.round(rect.height * dpr))
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w
      canvas.height = h
    }
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, w, h)
    const scale = Math.min(w / img.width, h / img.height)
    const dw = img.width * scale
    const dh = img.height * scale
    ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh)
  }, [])

  useEffect(() => {
    if (!ready) return
    paint(frame.current)
  }, [ready, paint])

  /* --------------------------------------------------- idle auto-spin ---- */
  useEffect(() => {
    if (!ready || !spinning || dragging) return
    let last = performance.now()

    const tick = (now: number) => {
      const dt = now - last
      last = now
      idle.current += dt
      if (idle.current > 900) {
        frame.current = (frame.current + 1) % spec.frames
        paint(frame.current)
        setIndex(frame.current)
      }
      raf.current = requestAnimationFrame(tick)
    }

    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [ready, spinning, dragging, spec.frames, paint])

  /* ---------------------------------------------------------- pointer ---- */
  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragging(true)
    idle.current = 0
    drag.current = { startX: e.clientX, startFrame: frame.current }
  }

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragging) return
    const steps = Math.round((e.clientX - drag.current.startX) / sensitivity)
    const next = (((drag.current.startFrame - steps) % spec.frames) + spec.frames) % spec.frames
    frame.current = next
    idle.current = 0
    paint(next)
    setIndex(next)
  }

  const endDrag = () => setDragging(false)

  const nudge = (delta: number) => {
    frame.current = (frame.current + delta + spec.frames) % spec.frames
    idle.current = 0
    paint(frame.current)
    setIndex(frame.current)
  }

  if (!ready) return null

  const degrees = Math.round(index * (spec.step ?? 360 / spec.frames))

  return (
    <div className={`relative ${className}`} data-testid="turntable">
      <canvas
        ref={canvasRef}
        className="h-full w-full cursor-grab touch-pan-y active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
        tabIndex={0}
        role="img"
        aria-label={`${slug} turntable, ${spec.frames} views`}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') nudge(-1)
          if (e.key === 'ArrowRight') nudge(1)
        }}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between px-1 text-[9px] uppercase tracking-[0.28em] text-ash/70">
        <span>Drag to spin</span>
        <span data-testid="turntable-angle">{String(degrees).padStart(3, '0')}°</span>
      </div>
      <button
        type="button"
        onClick={() => setSpinning((s) => !s)}
        className="absolute right-0 top-0 border border-white/10 px-2 py-1 text-[9px] uppercase tracking-[0.24em] text-ash/70 transition-colors hover:border-ember/50 hover:text-bone"
        aria-label={spinning ? 'Pause rotation' : 'Play rotation'}
      >
        {spinning ? 'Pause' : 'Spin'}
      </button>
    </div>
  )
}
