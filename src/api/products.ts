import { get, post, patch, put, del } from './client'
import type { PageResult } from '@/types/api'
import type {
  ProductCreateRequest,
  ProductDetail,
  ProductImagesResponse,
  ProductListItem,
  ProductMutationResponse,
  ProductUpdateRequest,
  StatusRequest,
  StatusResponse,
} from './types'

export interface ProductQuery {
  keyword?: string
  category?: string
  status?: number | ''
  page?: number
  size?: number
}

export const listProducts = (params: ProductQuery) =>
  get<PageResult<ProductListItem>>('/admin/products', params)

export const getProduct = (id: string) => get<ProductDetail>(`/admin/products/${id}`)

export const createProduct = (body: ProductCreateRequest) =>
  post<ProductMutationResponse>('/admin/products', body)

export const updateProduct = (id: string, body: ProductUpdateRequest) =>
  patch<ProductMutationResponse>(`/admin/products/${id}`, body)

export const setProductStatus = (id: string, body: StatusRequest) =>
  patch<StatusResponse>(`/admin/products/${id}/status`, body)

export const replaceProductImages = (id: string, images: string[]) =>
  put<ProductImagesResponse>(`/admin/products/${id}/images`, { images })

/** 删除产品：需先下架，否则后端返回「请先下架该产品，再执行删除」 */
export const deleteProduct = (id: string) =>
  del<{ productId: string; deleted: true }>(`/admin/products/${id}`)
