import 'axios'

declare module 'axios' {
  interface AxiosRequestConfig {
    /** 请求失败时不自动弹 Toast，由调用方处理 */
    silent?: boolean
  }
}
