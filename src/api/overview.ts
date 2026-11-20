import { get } from './client'
import type { Overview } from './types'

export const getOverview = () => get<Overview>('/admin/stats/overview')
