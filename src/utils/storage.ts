const PREFIX = 'jh_admin_'

export const storage = {
  get(key: string): string {
    try {
      return localStorage.getItem(PREFIX + key) ?? ''
    } catch {
      return ''
    }
  },

  set(key: string, value: string) {
    try {
      localStorage.setItem(PREFIX + key, value)
    } catch {
      /* 隐私模式写入失败时静默 */
    }
  },

  getJSON<T>(key: string): T | null {
    const raw = this.get(key)
    if (!raw) return null
    try {
      return JSON.parse(raw) as T
    } catch {
      return null
    }
  },

  setJSON(key: string, value: unknown) {
    try {
      this.set(key, JSON.stringify(value))
    } catch {
      /* ignore */
    }
  },

  remove(key: string) {
    try {
      localStorage.removeItem(PREFIX + key)
    } catch {
      /* ignore */
    }
  },
}

export const TOKEN_KEY = 'jh_admin_token'
export const PROFILE_KEY = 'jh_admin_profile'
