<script setup lang="ts">
import { computed } from 'vue'
import { Delete, Warning } from '@element-plus/icons-vue'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title: string
    description?: string
    type?: 'danger' | 'warning'
    confirmText?: string
    loading?: boolean
  }>(),
  { description: '', type: 'danger', confirmText: '确定', loading: false },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
}>()

const icon = computed(() => (props.type === 'danger' ? Delete : Warning))
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    width="480px"
    :show-close="false"
    :close-on-click-modal="false"
    align-center
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="body">
      <span class="icon" :class="type">
        <el-icon :size="20"><component :is="icon" /></el-icon>
      </span>
      <h3 class="title">{{ title }}</h3>
      <p v-if="description" class="desc">{{ description }}</p>
    </div>

    <template #footer>
      <el-button @click="emit('update:modelValue', false)">取消</el-button>
      <el-button :type="type === 'danger' ? 'danger' : 'primary'" :loading="loading" @click="emit('confirm')">
        {{ confirmText }}
      </el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  text-align: left;
}

.icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &.danger {
    background: var(--danger-50);
    color: var(--danger-600);
  }

  &.warning {
    background: var(--warning-50);
    color: var(--warning-600);
  }
}

.title {
  margin: 0;
  font-size: 18px;
  line-height: 26px;
  font-weight: 600;
  color: var(--ink-900);
}

.desc {
  margin: 0;
  font-size: 13px;
  line-height: 20px;
  color: var(--ink-500);
}
</style>
