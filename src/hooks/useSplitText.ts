'use client'

import { useEffect, useRef, useState } from 'react'
import SplitType from 'split-type'

type SplitTypes = 'chars' | 'words' | 'lines'

interface UseSplitTextOptions {
  types?: SplitTypes | SplitTypes[]
  tagName?: string
}

interface SplitResult {
  chars: HTMLElement[]
  words: HTMLElement[]
  lines: HTMLElement[]
  instance: SplitType | null
}

export function useSplitText<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  { types = ['chars', 'words'], tagName = 'span' }: UseSplitTextOptions = {}
): SplitResult {
  const splitRef = useRef<SplitType | null>(null)
  const [result, setResult] = useState<SplitResult>({
    chars: [],
    words: [],
    lines: [],
    instance: null,
  })

  useEffect(() => {
    if (!ref.current) return
    const el = ref.current

    const typeStr = Array.isArray(types) ? types.join(',') : types
    splitRef.current = new SplitType(el, { types: typeStr as SplitTypes, tagName })

    setResult({
      chars: Array.from(el.querySelectorAll<HTMLElement>('.char')),
      words: Array.from(el.querySelectorAll<HTMLElement>('.word')),
      lines: Array.from(el.querySelectorAll<HTMLElement>('.line')),
      instance: splitRef.current,
    })

    const onResize = () => {
      splitRef.current?.split({ types: typeStr as SplitTypes })
      setResult({
        chars: Array.from(el.querySelectorAll<HTMLElement>('.char')),
        words: Array.from(el.querySelectorAll<HTMLElement>('.word')),
        lines: Array.from(el.querySelectorAll<HTMLElement>('.line')),
        instance: splitRef.current,
      })
    }

    window.addEventListener('resize', onResize, { passive: true })

    return () => {
      window.removeEventListener('resize', onResize)
      splitRef.current?.revert()
      splitRef.current = null
    }
  }, [ref]) // eslint-disable-line react-hooks/exhaustive-deps

  return result
}
