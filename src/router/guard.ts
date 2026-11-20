import type { Router } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useDictionaryStore } from '@/stores/dictionary'

export function setupGuard(router: Router) {
  router.beforeEach(async (to) => {
    const auth = useAuthStore()
    const dict = useDictionaryStore()

    if (!auth.token) {
      if (to.meta.public) return true
      return { name: 'login', query: { redirect: to.fullPath } }
    }

    if (to.name === 'login') return { name: 'dashboard' }

    if (!auth.loaded) {
      try {
        await auth.fetchMe()
      } catch {
        auth.reset()
        return { name: 'login', query: { redirect: to.fullPath } }
      }
    }

    if (auth.mustChangePassword && to.name !== 'change-password') {
      return { name: 'change-password', query: { forced: '1' } }
    }

    if (to.meta.permission && !auth.hasPerm(to.meta.permission)) {
      return { name: 'forbidden' }
    }

    dict.load()
    return true
  })

  router.afterEach((to) => {
    document.title = to.meta.title ? `${to.meta.title} · 健衡管理端` : '健衡管理端'
  })
}
