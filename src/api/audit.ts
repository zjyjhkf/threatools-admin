import { get } from './client'
import type { PageResult } from '@/types/api'
import type { AuditLog } from './types'

export interface AuditQuery {
  adminId?: string
  module?: string
  action?: string
  targetType?: string
  targetId?: string
  startDate?: string
  endDate?: string
  page?: number
  size?: number
}

export const listAuditLogs = (params: AuditQuery) =>
  get<PageResult<AuditLog>>('/admin/audit-logs', params)
