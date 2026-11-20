import { post } from './client'
import type { UploadResponse } from './types'

export function uploadImages(files: File[], onProgress?: (percent: number) => void) {
  const form = new FormData()
  files.forEach((file) => form.append('files', file))
  return post<UploadResponse>('/admin/upload/images', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
    onUploadProgress: (e) =>
      onProgress?.(e.total ? Math.round((e.loaded / e.total) * 100) : 0),
  })
}
