import { get, post, patch, del } from './client'
import type {
  MetaItem,
  MetaItemCreateRequest,
  MetaItemListResponse,
  MetaItemUpdateRequest,
  MetaOptions,
  TagSuggestResponse,
} from './types'

export const getOptions = () => get<MetaOptions>('/admin/meta/options')

export interface MetaItemQuery {
  group?: string
  keyword?: string
}

/** 筛选条目（产品/课程分类、难度、标签候选）列表 */
export const listMetaItems = (params: MetaItemQuery = {}) =>
  get<MetaItemListResponse>('/admin/meta/items', params)

export const createMetaItem = (body: MetaItemCreateRequest) =>
  post<MetaItem>('/admin/meta/items', body)

export const updateMetaItem = (id: string, body: MetaItemUpdateRequest) =>
  patch<MetaItem>(`/admin/meta/items/${id}`, body)

export const deleteMetaItem = (id: string) =>
  del<{ id: string; deleted: true }>(`/admin/meta/items/${id}`)

/** 标签联想：字典候选 + 已上架内容用过的标签 */
export const suggestTags = (group: 'product_tag' | 'course_tag', q = '', limit = 10) =>
  get<TagSuggestResponse>('/admin/tags/suggest', { group, q, limit })
