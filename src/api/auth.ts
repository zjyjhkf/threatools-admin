import { get, post, put } from './client'
import type {
  AdminProfile,
  ChangePasswordRequest,
  ChangePasswordResponse,
  LoginResponse,
} from './types'

export const login = (username: string, password: string) =>
  post<LoginResponse>(
    '/admin/auth/login',
    { username, password },
    { silent: true },
  )

export const me = () => get<AdminProfile>('/admin/auth/me')

export const changePassword = (oldPassword: string, newPassword: string) =>
  put<ChangePasswordResponse>('/admin/auth/password', {
    oldPassword,
    newPassword,
  } satisfies ChangePasswordRequest)
