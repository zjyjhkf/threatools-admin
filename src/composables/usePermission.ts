import { useAuthStore } from '@/stores/auth'

export function usePermission() {
  const auth = useAuthStore()
  const can = (perm?: string) => auth.hasPerm(perm)
  return { can, isSuper: auth.isSuper }
}
