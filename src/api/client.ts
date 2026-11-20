import axios, {
  AxiosError,
  getAdapter,
  type AxiosAdapter,
  type AxiosRequestConfig,
} from 'axios'
import { ElMessage } from 'element-plus'
import { storage, TOKEN_KEY, PROFILE_KEY } from '@/utils/storage'
import { mockAdapter } from '@/mock'

export class ApiError extends Error {
  constructor(
    public code: number,
    message: string,
    public requestId = '',
    public httpStatus = 0,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

/**
 * 开发环境仍可用 Mock 演示未实装的运营页面，但以下“真实落库链路”必须直连 FastAPI：
 * 登录、产品、课程、上传、字典、概览。
 *
 * 关闭 Mock：VITE_USE_MOCK=false，全部请求走真实后端。
 */
const REAL_ADMIN_PREFIXES = [
  '/admin/auth',
  '/admin/posts',
  '/admin/products',
  '/admin/courses',
  '/admin/upload',
  '/admin/meta',
  '/admin/topics',
  '/admin/tags',
  '/admin/comments',
  '/admin/stats',
]

function isRealAdminRequest(config: AxiosRequestConfig) {
  const url = String(config.url || '')
  return REAL_ADMIN_PREFIXES.some((prefix) => url === prefix || url.startsWith(`${prefix}/`))
}

if (import.meta.env.VITE_USE_MOCK === 'true') {
  const nativeAdapter = getAdapter(['xhr', 'http', 'fetch'])
  const mixedAdapter: AxiosAdapter = (config) =>
    isRealAdminRequest(config) ? nativeAdapter(config) : mockAdapter(config)
  http.defaults.adapter = mixedAdapter
}

http.interceptors.request.use((config) => {
  const token = storage.get(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    config.headers['X-Request-Id'] = crypto.randomUUID().replace(/-/g, '').slice(0, 16)
  }
  return config
})

let redirecting = false

function appUrl(path: string) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  return `${base}${path}`
}

function currentRoutePath() {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  const path = window.location.pathname + window.location.search
  return base && path.startsWith(base) ? path.slice(base.length) || '/' : path
}

export function toLogin() {
  if (redirecting) return
  redirecting = true
  storage.remove(TOKEN_KEY)
  storage.remove(PROFILE_KEY)
  window.location.replace(appUrl(`/login?redirect=${encodeURIComponent(currentRoutePath())}`))
  setTimeout(() => {
    redirecting = false
  }, 1500)
}

function silentOf(config?: AxiosRequestConfig) {
  return Boolean((config as Record<string, unknown> | undefined)?.silent)
}

http.interceptors.response.use(
  (res) => {
    const body = res.data
    if (body && body.code === 0) return body.data
    const err = new ApiError(
      body?.code ?? -1,
      body?.message ?? '请求失败',
      body?.requestId ?? '',
      res.status,
    )
    if (!silentOf(res.config)) ElMessage.error(err.message)
    return Promise.reject(err)
  },
  async (error: AxiosError) => {
    const status = error.response?.status ?? 0
    const body = error.response?.data as
      | { code?: number; message?: string; requestId?: string }
      | undefined
    const requestId =
      body?.requestId ||
      (error.response?.headers?.['x-request-id'] as string | undefined) ||
      ''
    const message = body?.message || '网络开小差了，请稍后重试'
    const code = body?.code ?? 0

    if (status === 401) {
      toLogin()
      return Promise.reject(new ApiError(40101, '登录已失效', requestId, 401))
    }
    if (status === 403 && code === 40303) {
      window.location.replace(appUrl('/change-password?forced=1'))
      return Promise.reject(new ApiError(code, message, requestId, 403))
    }
    if (status === 429) ElMessage.warning(message || '操作太频繁，请稍后再试')
    else if (!silentOf(error.config)) ElMessage.error(message)

    return Promise.reject(new ApiError(code, message, requestId, status))
  },
)

export async function get<T>(url: string, params?: object, config?: AxiosRequestConfig): Promise<T> {
  return http.get(url, { params, ...config }) as unknown as Promise<T>
}
export async function post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  return http.post(url, data, config) as unknown as Promise<T>
}
export async function put<T>(url: string, data?: unknown): Promise<T> {
  return http.put(url, data) as unknown as Promise<T>
}
export async function patch<T>(url: string, data?: unknown): Promise<T> {
  return http.patch(url, data) as unknown as Promise<T>
}
export async function del<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  return http.delete(url, config) as unknown as Promise<T>
}

export { http }
