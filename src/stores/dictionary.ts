import { ref } from 'vue'
import { defineStore } from 'pinia'
import * as metaApi from '@/api/meta'
import type { MetaOptions } from '@/api/types'

export const useDictionaryStore = defineStore('dictionary', () => {
  const options = ref<MetaOptions | null>(null)
  let loading: Promise<void> | null = null

  function load(force = false) {
    if (options.value && !force) return Promise.resolve()
    if (loading && !force) return loading
    loading = metaApi
      .getOptions()
      .then((data) => {
        options.value = data
      })
      .catch(() => {
        /* 字典失败不阻塞页面，labelOf 回退原始值 */
      })
      .finally(() => {
        loading = null
      })
    return loading
  }

  function labelOf(group: keyof MetaOptions, value: string | number | boolean): string {
    const list = options.value?.[group]
    if (!Array.isArray(list)) return String(value)
    const hit = list.find((x) => String(x.value) === String(value))
    return hit?.label ?? String(value)
  }

  return { options, load, labelOf }
})
