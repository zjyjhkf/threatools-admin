<script setup lang="ts">
import { ArrowLeft } from '@element-plus/icons-vue'

defineProps<{
  title: string
  subtitle?: string
  back?: boolean
}>()

const emit = defineEmits<{ (e: 'back'): void }>()
</script>

<template>
  <div class="page-header" :class="{ compact: back }">
    <div class="left">
      <button v-if="back" class="back" type="button" @click="emit('back')">
        <el-icon :size="18"><ArrowLeft /></el-icon>
      </button>
      <div class="titles">
        <h1 class="title">{{ title }}</h1>
        <p v-if="subtitle" class="subtitle">{{ subtitle }}</p>
      </div>
    </div>
    <div class="actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 56px;

  &.compact .title {
    font-size: 20px;
    line-height: 28px;
  }
}

.left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.back {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  border-radius: 6px;
  color: var(--ink-700);
  cursor: pointer;

  &:hover {
    background: var(--bg-hover);
  }
}

.titles {
  min-width: 0;
}

.title {
  font-size: 24px;
  line-height: 32px;
  font-weight: 600;
  color: var(--ink-900);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.subtitle {
  margin: 2px 0 0;
  font-size: 14px;
  line-height: 22px;
  color: var(--ink-500);
}

.compact .subtitle {
  font-size: 13px;
}

.actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
}
</style>
