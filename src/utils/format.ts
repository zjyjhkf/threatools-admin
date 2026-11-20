import dayjs from 'dayjs'

export function formatDate(value?: string | null, template = 'YYYY-MM-DD HH:mm'): string {
  if (!value) return '—'
  const d = dayjs(value)
  return d.isValid() ? d.format(template) : value
}

export function formatTime(value?: string | null): string {
  return formatDate(value, 'HH:mm:ss')
}

/** 18500 → 1.85万；1200 → 1,200 */
export function formatCount(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—'
  if (value >= 10000) return `${(value / 10000).toFixed(1).replace(/\.0$/, '')}万`
  return value.toLocaleString('zh-CN')
}

/** 秒 → 04:21 */
export function formatDuration(seconds: number | null | undefined): string {
  if (!seconds || seconds < 0) return '00:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function excerpt(text: string, max = 60): string {
  if (!text) return ''
  const clean = text.replace(/\s+/g, ' ').trim()
  return clean.length > max ? `${clean.slice(0, max)}…` : clean
}

export function maskIp(ip: string): string {
  if (!ip) return '—'
  const parts = ip.split('.')
  if (parts.length !== 4) return ip
  return `${parts[0]}.${parts[1]}.*.*`
}
