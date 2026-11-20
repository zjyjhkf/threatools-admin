import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    title: string
    permission?: string
    hidden?: boolean
    order?: number
    group?: string
    layout?: 'admin' | 'blank'
    public?: boolean
  }
}
