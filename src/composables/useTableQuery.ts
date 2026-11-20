import { reactive, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

type Primitive = string | number | boolean | undefined | null

function pick<T extends Record<string, Primitive>>(query: Record<string, unknown>, defaults: T): Partial<T> {
  const out: Record<string, Primitive> = {}
  Object.keys(defaults).forEach((key) => {
    const raw = query[key]
    if (raw === undefined) return
    const fallback = defaults[key]
    if (typeof fallback === 'number') {
      const n = Number(raw)
      if (Number.isFinite(n)) out[key] = n
    } else if (typeof fallback === 'boolean') {
      out[key] = raw === true || raw === 'true'
    } else {
      out[key] = String(raw)
    }
  })
  return out as Partial<T>
}

function clean<T extends Record<string, Primitive>>(state: T) {
  const out: Record<string, string> = {}
  Object.entries(state).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    out[key] = String(value)
  })
  return out
}

/**
 * 列表筛选与 URL 同步：
 * - 筛选变化 → page 重置 1 → router.replace
 * - 翻页 → apply({ page }, false)
 * - 刷新页面 → 从 query 恢复
 */
export function useTableQuery<T extends Record<string, Primitive>>(defaults: T) {
  const route = useRoute()
  const router = useRouter()
  const state = reactive<T>({ ...defaults, ...pick(route.query, defaults) } as T)

  function apply(patch: Partial<T> = {}, resetPage = true) {
    Object.assign(state, patch)
    if (resetPage && 'page' in state) (state as Record<string, Primitive>).page = 1
    router.replace({ query: clean(state) }).catch(() => undefined)
  }

  function reset() {
    Object.assign(state, defaults)
    router.replace({ query: clean(state) }).catch(() => undefined)
  }

  watch(
    () => route.query,
    (q) => {
      if (route.name !== router.currentRoute.value.name) return
      Object.assign(state, pick(q, defaults))
    },
  )

  return { state, apply, reset }
}
