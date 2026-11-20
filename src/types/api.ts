export interface ApiEnvelope<T> {
  code: number
  message: string
  data: T
  requestId: string
}

export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  size: number
  hasMore: boolean
}

export interface Option<V = string> {
  label: string
  value: V
}
