import type { Directive } from 'vue'
import { useAuthStore } from '@/stores/auth'

/** v-perm="'admin:manage'" —— 无权限时移除元素（仅隐藏，后端仍需校验） */
export const vPerm: Directive<HTMLElement, string> = {
  mounted(el, binding) {
    if (!binding.value) return
    const auth = useAuthStore()
    if (!auth.hasPerm(binding.value)) el.parentNode?.removeChild(el)
  },
}
