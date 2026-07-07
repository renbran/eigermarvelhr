import { useMemo, useState, useEffect, useRef, type ReactNode } from 'react'

export interface HeroVideoPlayerProps {
  videoId: string
  children?: ReactNode
  minHeight?: string
  className?: string
  /** Fallback image shown if YouTube embed fails to load */
  fallbackSrc?: string
}

const LOAD_TIMEOUT_MS = 15_000

export function HeroVideoPlayer({
  videoId,
  children,
  minHeight = 'min-h-[78vh]',
  className = '',
  fallbackSrc,
}: HeroVideoPlayerProps) {
  const [muted, setMuted] = useState(true)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const src = useMemo(
    () =>
      `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${muted ? 1 : 0}&controls=0&modestbranding=1&showinfo=0&rel=0&playsinline=1&disablekb=1&fs=0&iv_load_policy=3&loop=1&playlist=${videoId}`,
    [videoId, muted]
  )

  useEffect(() => {
    setStatus('loading')

    timeoutRef.current = setTimeout(() => {
      setStatus((s) => (s === 'loading' ? 'error' : s))
    }, LOAD_TIMEOUT_MS)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [videoId])

  const handleIframeLoad = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setStatus('ready')
  }

  const showFallback = status === 'error' && fallbackSrc
  const showVideo = status === 'ready'
  const mutedBtnVisible = showVideo || status === 'loading'

  return (
    <section
      className={`relative w-full ${minHeight} overflow-hidden bg-background ${className}`}
      aria-label="Eiger Marvel hero video"
    >
      {status === 'loading' && (
        <div
          aria-hidden="true"
          className="absolute inset-0 z-[1] animate-pulse"
          style={{
            background:
              'linear-gradient(135deg, color-mix(in srgb, var(--color-bg) 92%, transparent) 0%, color-mix(in srgb, var(--color-bg-inset) 92%, transparent) 50%, color-mix(in srgb, var(--color-bg) 92%, transparent) 100%)',
            backgroundSize: '200% 200%',
          }}
        />
      )}

      {showFallback && (
        <img
          src={fallbackSrc}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover z-[1]"
        />
      )}

      <iframe
        key={muted ? 'muted' : 'unmuted'}
        src={src}
        title="Eiger Marvel hero video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        className={`absolute inset-0 w-full h-full border-0 transition-opacity duration-500 ${
          showVideo ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ pointerEvents: 'none' }}
        onLoad={handleIframeLoad}
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background:
            'linear-gradient(to top, color-mix(in srgb, var(--color-bg) 92%, transparent) 0%, color-mix(in srgb, var(--color-bg) 55%, transparent) 35%, color-mix(in srgb, var(--color-bg) 25%, transparent) 65%, transparent 100%)',
        }}
      />

      {status === 'error' && !fallbackSrc && (
        <div
          aria-hidden="true"
          className="absolute inset-0 z-[1] flex items-center justify-center"
        >
          <div className="text-center text-white/40 text-sm">
            <svg viewBox="0 0 24 24" className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
            </svg>
            <span className="text-xs uppercase tracking-[0.15em]">Video unavailable</span>
          </div>
        </div>
      )}

      {mutedBtnVisible && (
        <button
          type="button"
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? 'Unmute hero video' : 'Mute hero video'}
          className="absolute top-6 right-6 z-30 flex items-center gap-2 rounded-full bg-black/55 hover:bg-black/75 backdrop-blur-md px-4 py-2 text-white text-xs uppercase tracking-[0.18em] font-semibold border border-white/15 transition-all hover:scale-105"
        >
          {muted ? (
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
          )}
          {muted ? 'Sound off' : 'Sound on'}
        </button>
      )}

      {status === 'ready' && (
        <div className="absolute bottom-2 right-4 z-20 text-[10px] uppercase tracking-[0.2em] text-white/40 pointer-events-none select-none">
          YouTube
        </div>
      )}

      <div className="relative z-20 h-full flex items-end pb-16 sm:pb-20 pointer-events-none">
        <div className="max-w-5xl mx-auto px-6 sm:px-10 text-white w-full">{children}</div>
      </div>
    </section>
  )
}