import { useEffect, useRef, useState, type ReactNode } from 'react'

declare global {
  interface Window {
    YT?: { Player: new (el: HTMLElement | string, opts: Record<string, unknown>) => YTPlayerInstance }
    onYouTubeIframeAPIReady?: () => void
  }
}

interface YTPlayerInstance {
  unMute: () => void
  mute: () => void
  setVolume: (n: number) => void
  playVideo: () => void
  pauseVideo: () => void
  destroy: () => void
}

let apiPromise: Promise<Window['YT']> | null = null

function loadYouTubeAPI(): Promise<Window['YT']> {
  if (typeof window === 'undefined') return Promise.reject(new Error('SSR'))
  if (window.YT?.Player) return Promise.resolve(window.YT)
  if (apiPromise) return apiPromise

  apiPromise = new Promise((resolve, reject) => {
    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      prev?.()
      if (window.YT) resolve(window.YT)
      else reject(new Error('YT API failed to load'))
    }
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    tag.async = true
    tag.onerror = () => reject(new Error('Failed to load YT API script'))
    document.head.appendChild(tag)
  })

  return apiPromise
}

export interface HeroVideoPlayerProps {
  videoId: string
  children?: ReactNode
  minHeight?: string
  className?: string
}

export function HeroVideoPlayer({
  videoId,
  children,
  minHeight = 'min-h-[78vh]',
  className = '',
}: HeroVideoPlayerProps) {
  const playerTargetRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<YTPlayerInstance | null>(null)
  const [muted, setMuted] = useState(true)
  const [apiReady, setApiReady] = useState(false)

  const src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&modestbranding=1&showinfo=0&rel=0&playsinline=1&disablekb=1&fs=0&iv_load_policy=3&loop=1&playlist=${videoId}&enablejsapi=1`

  useEffect(() => {
    let cancelled = false
    loadYouTubeAPI()
      .then((YT) => {
        if (cancelled || !YT) return
        const node = playerTargetRef.current
        if (!node) return
        try {
          playerRef.current = new YT.Player(node, {
            videoId,
            playerVars: {
              autoplay: 1,
              mute: 1,
              controls: 0,
              modestbranding: 1,
              showinfo: 0,
              rel: 0,
              playsinline: 1,
              disablekb: 1,
              fs: 0,
              iv_load_policy: 3,
              loop: 1,
              playlist: videoId,
            },
            events: {
              onReady: () => setApiReady(true),
            },
          })
        } catch (e) {
          console.error('[HeroVideoPlayer] YT.Player init failed:', e)
        }
      })
      .catch((err) => console.error('[HeroVideoPlayer] YT API load failed:', err))

    return () => {
      cancelled = true
      try {
        playerRef.current?.destroy?.()
      } catch {
        /* ignore */
      }
      playerRef.current = null
    }
  }, [videoId])

  const toggleMute = () => {
    const p = playerRef.current
    if (!p) {
      setMuted((m) => !m)
      return
    }
    if (muted) {
      p.unMute()
      p.setVolume(50)
    } else {
      p.mute()
    }
    setMuted(!muted)
  }

  return (
    <section
      className={`relative w-full ${minHeight} overflow-hidden bg-black ${className}`}
      aria-label="Eiger Marvel hero video"
    >
      <iframe
        src={src}
        title="Eiger Marvel hero video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        className="absolute inset-0 w-full h-full border-0 object-cover"
        style={{ pointerEvents: 'none' }}
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background:
            'linear-gradient(to top, rgba(7,8,15,0.92) 0%, rgba(7,8,15,0.55) 35%, rgba(7,8,15,0.25) 65%, transparent 100%)',
        }}
      />

      <div
        ref={playerTargetRef}
        className="absolute inset-0 pointer-events-none opacity-0"
        aria-hidden="true"
      />

      <button
        type="button"
        onClick={toggleMute}
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

      <div className="absolute bottom-2 right-4 z-20 text-[10px] uppercase tracking-[0.2em] text-white/40 pointer-events-none select-none">
        {apiReady ? '' : 'YouTube'}
      </div>

      <div className="relative z-20 h-full flex items-end pb-16 sm:pb-20 pointer-events-none">
        <div className="max-w-5xl mx-auto px-6 sm:px-10 text-white w-full">{children}</div>
      </div>
    </section>
  )
}