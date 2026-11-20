import { get, post, patch, put, del } from './client'
import type { PageResult } from '@/types/api'
import type {
  ChaptersReplaceResponse,
  ChapterInput,
  CourseCreateRequest,
  CourseDetail,
  CourseListItem,
  CourseMutationResponse,
  CourseUpdateRequest,
  StatusRequest,
  StatusResponse,
} from './types'

export interface CourseQuery {
  keyword?: string
  category?: string
  difficulty?: string
  status?: number | ''
  isMain?: boolean | ''
  page?: number
  size?: number
}

export const listCourses = (params: CourseQuery) =>
  get<PageResult<CourseListItem>>('/admin/courses', params)

export const getCourse = (id: string) => get<CourseDetail>(`/admin/courses/${id}`)

export const createCourse = (body: CourseCreateRequest) =>
  post<CourseMutationResponse>('/admin/courses', body)

export const updateCourse = (id: string, body: CourseUpdateRequest) =>
  patch<CourseMutationResponse>(`/admin/courses/${id}`, body)

export const setCourseStatus = (id: string, body: StatusRequest) =>
  patch<StatusResponse>(`/admin/courses/${id}/status`, body)

export const replaceChapters = (id: string, chapters: ChapterInput[]) =>
  put<ChaptersReplaceResponse>(`/admin/courses/${id}/chapters`, { chapters })

/** 删除课程：需先下架，否则后端返回「请先下架该课程，再执行删除」 */
export const deleteCourse = (id: string) =>
  del<{ courseId: string; deleted: true }>(`/admin/courses/${id}`)
