import { ref } from 'vue'
import { defineStore } from 'pinia'
import { storage } from '@/utils/storage'

export const useAppStore = defineStore('app', () => {
  const sidebarCollapsed = ref(storage.get('sidebar') === '1')
  const online = ref(typeof navigator === 'undefined' ? true : navigator.onLine)

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
    storage.set('sidebar', sidebarCollapsed.value ? '1' : '0')
  }

  function bindNetwork() {
    window.addEventListener('online', () => (online.value = true))
    window.addEventListener('offline', () => (online.value = false))
  }

  return { sidebarCollapsed, online, toggleSidebar, bindNetwork }
})
