import { get, post, patch } from './client'
import type { PageResult } from '@/types/api'
import type {
  AdminCreateRequest,
  AdminCreateResponse,
  AdminDetail,
  AdminListItem,
  AdminResetPasswordResponse,
  AdminUpdateRequest,
} from './types'

export interface AdminQuery {
  keyword?: string
  role?: string
  status?: number | ''
  page?: number
  size?: number
}

export const listAdmins = (params: AdminQuery) =>
  get<PageResult<AdminListItem>>('/admin/admins', params)

export const getAdmin = (id: string) => get<AdminDetail>(`/admin/admins/${id}`)

export const createAdmin = (body: AdminCreateRequest) =>
  post<AdminCreateResponse>('/admin/admins', body)

export const updateAdmin = (id: string, body: AdminUpdateRequest) =>
  patch<AdminDetail>(`/admin/admins/${id}`, body)

export const resetAdminPassword = (id: string) =>
  post<AdminResetPasswordResponse>(`/admin/admins/${id}/reset-password`)
