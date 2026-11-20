<script setup lang="ts">
import { computed } from 'vue'

type Kind = 'success' | 'warning' | 'danger' | 'info' | 'brand' | 'purple'

const props = defineProps<{
  status: string | number | boolean
  label?: string
}>()

const map: Record<string, { text: string; kind: Kind }> = {
  published: { text: '已发布', kind: 'success' },
  approved: { text: '已通过', kind: 'success' },
  pending: { text: '待审核', kind: 'warning' },
  rejected: { text: '已驳回', kind: 'danger' },
  hidden: { text: '已隐藏', kind: 'danger' },
  deleted: { text: '已删除', kind: 'danger' },
  normal: { text: '正常', kind: 'success' },
  active: { text: '启用', kind: 'success' },
  disabled: { text: '已禁用', kind: 'danger' },
  on: { text: '上架', kind: 'success' },
  off: { text: '下架', kind: 'danger' },
  hot: { text: '热门', kind: 'warning' },
  cool: { text: '普通', kind: 'info' },
  yes: { text: '是', kind: 'warning' },
  no: { text: '否', kind: 'info' },
}

const key = computed(() => {
  if (typeof props.status === 'boolean') return props.status ? 'active' : 'disabled'
  return String(props.status)
})

const conf = computed(() => map[key.value] ?? { text: String(props.status ?? '—'), kind: 'info' as Kind })
const text = computed(() => props.label ?? conf.value.text)
</script>

<template>
  <span class="status-tag" :class="conf.kind">{{ text }}</span>
</template>

<style scoped lang="scss">
.status-tag {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;

  &.success {
    background: var(--brand-100);
    color: var(--brand-700);
  }
  &.warning {
    background: var(--warning-50);
    color: #b45309;
    border: 1px solid var(--warning-border);
  }
  &.danger {
    background: var(--danger-50);
    color: #b42318;
  }
  &.info {
    background: var(--bg-input);
    color: var(--ink-700);
  }
  &.brand {
    background: var(--brand-100);
    color: var(--brand-700);
  }
  &.purple {
    background: var(--role-super-bg);
    color: var(--role-super-text);
  }
}
</style>
