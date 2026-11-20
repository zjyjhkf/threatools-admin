import { get, patch } from './client'
import type { PageResult } from '@/types/api'
import type { UserDetail, UserListItem, UserStatusRequest, UserStatusResponse } from './types'

export interface UserQuery {
  keyword?: string
  status?: number | ''
  startDate?: string
  endDate?: string
  page?: number
  size?: number
}

export const listUsers = (params: UserQuery) =>
  get<PageResult<UserListItem>>('/admin/users', params)

export const getUser = (id: string) => get<UserDetail>(`/admin/users/${id}`)

export const setUserStatus = (id: string, body: UserStatusRequest) =>
  patch<UserStatusResponse>(`/admin/users/${id}/status`, body)
