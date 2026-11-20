import { ElMessage } from 'element-plus'

const recent = new Map<string, number>()

/** 同文案 1.2s 内去重，避免并发错误刷屏 */
export function toast(
  message: string,
  type: 'success' | 'warning' | 'error' | 'info' = 'success',
) {
  const now = Date.now()
  const last = recent.get(message) ?? 0
  if (now - last < 1200) return
  recent.set(message, now)
  ElMessage({ message, type, duration: 2400, grouping: true })
}
