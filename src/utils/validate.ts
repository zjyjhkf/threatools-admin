/** 密码：10–32 位，至少 3 类字符 */
export function checkPasswordStrength(password: string): { level: 0 | 1 | 2 | 3; label: string } {
  if (!password) return { level: 0, label: '' }
  const kinds = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((r) => r.test(password)).length
  if (password.length < 10 || kinds <= 1) return { level: 1, label: '弱' }
  if (kinds === 2) return { level: 2, label: '中等' }
  return { level: 3, label: '强' }
}

export function isStrongPassword(password: string): boolean {
  return password.length >= 10 && password.length <= 32 &&
    [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((r) => r.test(password)).length >= 3
}

export function isUrl(value: string): boolean {
  if (!value) return false
  return /^https?:\/\/[^\s]+$/i.test(value)
}

export function charLength(value: string): number {
  return Array.from(value ?? '').length
}
