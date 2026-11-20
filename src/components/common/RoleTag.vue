<script setup lang="ts">
import { computed } from 'vue'
import type { AdminRole } from '@/api/types'

const props = defineProps<{ role: AdminRole }>()

const conf = computed(() =>
  props.role === 'super'
    ? { text: '超级管理员', cls: 'purple' }
    : { text: '管理员', cls: 'brand' },
)
</script>

<template>
  <span class="role-tag" :class="conf.cls">{{ conf.text }}</span>
</template>

<style scoped lang="scss">
.role-tag {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;

  &.purple {
    background: var(--role-super-bg);
    color: var(--role-super-text);
  }
  &.brand {
    background: var(--bg-input);
    color: var(--ink-700);
  }
}
</style>
