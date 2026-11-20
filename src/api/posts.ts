import { get, post, patch, del } from './client'
import type { PageResult } from '@/types/api'
import type {
  PostDetail,
  PostListItem,
  PostUpdateRequest,
  PostUpdateResponse,
  ReviewRequest,
  ReviewResponse,
} from './types'

export interface PostQuery {
  reviewStatus?: string
  status?: string
  keyword?: string
  authorId?: string
  topicId?: string
  startDate?: string
  endDate?: string
  sort?: 'newest' | 'oldest' | 'hot'
  page?: number
  size?: number
}

export const listPosts = (params: PostQuery) =>
  get<PageResult<PostListItem>>('/admin/posts', params)

export const getPost = (id: string) => get<PostDetail>(`/admin/posts/${id}`)

export const reviewPost = (id: string, body: ReviewRequest) =>
  post<ReviewResponse>(`/admin/posts/${id}/review`, body)

export const deletePost = (id: string) =>
  del<{ deleted: true; affectedComments: number }>(`/admin/posts/${id}`)

/** 编辑作品内容：标题、正文、封面、图片、话题、可见性、运动摘要 */
export const updatePost = (id: string, body: PostUpdateRequest) =>
  patch<PostUpdateResponse>(`/admin/posts/${id}`, body)
