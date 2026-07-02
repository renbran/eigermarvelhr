/**
 * Simple KV store with localStorage fallback.
 * Replaces spark.kv which is no longer available at runtime.
 * Attempts spark.kv first; falls back to localStorage.
 */

declare const spark: { kv: SparkKV } | undefined

interface SparkKV {
  get<T>(key: string): Promise<T | null>
  set(key: string, value: unknown): Promise<void>
  delete(key: string): Promise<void>
  keys(): Promise<string[]>
}

function tryKV<T>(fn: () => T): T | null {
  try {
    return fn()
  } catch {
    return null
  }
}

async function sparkGet<T>(key: string): Promise<T | null> {
  const result = tryKV(() => typeof spark !== 'undefined' && spark?.kv)
  if (result && spark) {
    return await spark.kv.get<T>(key)
  }
  throw new Error('spark not available')
}

async function sparkSet(key: string, value: unknown): Promise<void> {
  if (tryKV(() => typeof spark !== 'undefined' && spark?.kv) && spark) {
    await spark.kv.set(key, value)
    return
  }
  throw new Error('spark not available')
}

async function sparkDelete(key: string): Promise<void> {
  if (tryKV(() => typeof spark !== 'undefined' && spark?.kv) && spark) {
    await spark.kv.delete(key)
    return
  }
  throw new Error('spark not available')
}

async function sparkKeys(): Promise<string[]> {
  if (tryKV(() => typeof spark !== 'undefined' && spark?.kv) && spark) {
    return await spark.kv.keys()
  }
  throw new Error('spark not available')
}

export const kv = {
  async get<T>(key: string): Promise<T | null> {
    try {
      return await sparkGet<T>(key)
    } catch {
      const val = localStorage.getItem(`kv:${key}`)
      return val ? JSON.parse(val) : null
    }
  },

  async set(key: string, value: unknown): Promise<void> {
    try {
      await sparkSet(key, value)
      return
    } catch {
      localStorage.setItem(`kv:${key}`, JSON.stringify(value))
    }
  },

  async delete(key: string): Promise<void> {
    try {
      await sparkDelete(key)
      return
    } catch {
      localStorage.removeItem(`kv:${key}`)
    }
  },

  async keys(): Promise<string[]> {
    try {
      const sparkResult = await sparkKeys()
      if (sparkResult.length > 0) return sparkResult
    } catch {
      // fall through to localStorage
    }
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('kv:')) {
        keys.push(key.slice(3))
      }
    }
    return keys
  },
}
