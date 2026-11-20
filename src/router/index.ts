import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './routes'
import { setupGuard } from './guard'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

setupGuard(router)
