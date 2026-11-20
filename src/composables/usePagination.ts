import { ref, type Ref } from 'vue'
import type { PageResult } from '@/types/api'

export function usePagination<T>(
  fetcher: (page: number, size: number) => Promise<PageResult<T>>,
  initialSize = 20,
) {
  const page = ref(1)
  const size = ref(initialSize)
  const total = ref(0)
  const list: Ref<T[]> = ref([]) as Ref<T[]>
  const loading = ref(false)
  let requestSeq = 0

  async function load() {
    const seq = ++requestSeq
    loading.value = true
    try {
      const res = await fetcher(page.value, size.value)
      if (seq !== requestSeq) return
      list.value = res.list
      total.value = res.total
    } finally {
      if (seq === requestSeq) loading.value = false
    }
  }

  function onPageChange(p: number) {
    page.value = p
    load()
  }

  function onSizeChange(s: number) {
    size.value = s
    page.value = 1
    load()
  }

  function resetPage() {
    page.value = 1
  }

  return { page, size, total, list, loading, load, onPageChange, onSizeChange, resetPage }
}
