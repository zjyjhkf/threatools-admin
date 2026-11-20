import { get, del } from './client'
import type { PageResult } from '@/types/api'
import type { CommentDeleteResponse, CommentListItem } from './types'

export interface CommentQuery {
  keyword?: string
  status?: string
  postId?: string
  userId?: string
  startDate?: string
  endDate?: string
  page?: number
  size?: number
}

export const listComments = (params: CommentQuery) =>
  get<PageResult<CommentListItem>>('/admin/comments', params)

export const deleteComment = (id: string) =>
  del<CommentDeleteResponse>(`/admin/comments/${id}`)
