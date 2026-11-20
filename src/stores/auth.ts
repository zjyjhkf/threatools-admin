import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import * as authApi from '@/api/auth'
import type { AdminProfile } from '@/api/types'
import { storage, TOKEN_KEY, PROFILE_KEY } from '@/utils/storage'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string>(storage.get(TOKEN_KEY) || '')
  const profile = ref<AdminProfile | null>(storage.getJSON<AdminProfile>(PROFILE_KEY))
  const loaded = ref(false)

  const permissions = computed(() => profile.value?.permissions ?? [])
  const mustChangePassword = computed(() => Boolean(profile.value?.mustChangePassword))
  const isSuper = computed(() => profile.value?.role === 'super')

  function hasPerm(perm?: string) {
    return !perm || permissions.value.includes(perm)
  }

  async function login(username: string, password: string) {
    const data = await authApi.login(username, password)
    setSession(data.token, data.admin)
    loaded.value = true
    return data
  }

  async function fetchMe() {
    const data = await authApi.me()
    profile.value = data
    loaded.value = true
    storage.setJSON(PROFILE_KEY, data)
    return data
  }

  async function changePassword(oldPassword: string, newPassword: string) {
    const data = await authApi.changePassword(oldPassword, newPassword)
    token.value = data.token
    storage.set(TOKEN_KEY, data.token)
    if (profile.value) profile.value.mustChangePassword = false
    return data
  }

  function setSession(nextToken: string, nextProfile: AdminProfile) {
    token.value = nextToken
    profile.value = nextProfile
    storage.set(TOKEN_KEY, nextToken)
    storage.setJSON(PROFILE_KEY, nextProfile)
  }

  function reset() {
    token.value = ''
    profile.value = null
    loaded.value = false
    storage.remove(TOKEN_KEY)
    storage.remove(PROFILE_KEY)
  }

  return {
    token,
    profile,
    loaded,
    permissions,
    mustChangePassword,
    isSuper,
    hasPerm,
    login,
    fetchMe,
    changePassword,
    setSession,
    reset,
  }
})
