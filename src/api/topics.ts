import { get, post, patch, del } from './client'
import type { PageResult } from '@/types/api'
import type {
  TopicCreateRequest,
  TopicDeleteResponse,
  TopicListItem,
  TopicMutationResponse,
  TopicUpdateRequest,
} from './types'

export interface TopicQuery {
  keyword?: string
  isHot?: boolean | ''
  page?: number
  size?: number
}

export const listTopics = (params: TopicQuery) =>
  get<PageResult<TopicListItem>>('/admin/topics', params)

export const createTopic = (body: TopicCreateRequest) =>
  post<TopicMutationResponse>('/admin/topics', body)

export const updateTopic = (id: string, body: TopicUpdateRequest) =>
  patch<TopicMutationResponse>(`/admin/topics/${id}`, body)

export const deleteTopic = (id: string) => del<TopicDeleteResponse>(`/admin/topics/${id}`)
