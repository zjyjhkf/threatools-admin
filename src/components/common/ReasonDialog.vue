<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Warning } from '@element-plus/icons-vue'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title: string
    description?: string
    summaryTitle?: string
    summaryMeta?: string
    placeholder?: string
    templates?: string[]
    maxLength?: number
    confirmText?: string
    danger?: boolean
    loading?: boolean
  }>(),
  {
    description: '',
    summaryTitle: '',
    summaryMeta: '',
    placeholder: '请填写具体原因（2–100 字）',
    templates: () => [],
    maxLength: 100,
    confirmText: '确认',
    danger: true,
    loading: false,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', reason: string): void
}>()

const reason = ref('')
const error = ref('')

const count = computed(() => reason.value.length)

watch(
  () => props.modelValue,
  (visible) => {
    if (visible) {
      reason.value = ''
      error.value = ''
    }
  },
)

function close() {
  emit('update:modelValue', false)
}

function submit() {
  const value = reason.value.trim()
  if (value.length < 2) {
    error.value = '请填写至少 2 个字的原因'
    return
  }
  error.value = ''
  emit('confirm', value)
}

function useTemplate(text: string) {
  reason.value = reason.value ? `${reason.value}；${text}` : text
  if (reason.value.length > props.maxLength) reason.value = reason.value.slice(0, props.maxLength)
}
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    :title="title"
    width="560px"
    :close-on-click-modal="false"
    destroy-on-close
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="reason-body">
      <p v-if="description" class="desc">{{ description }}</p>

      <div v-if="summaryTitle" class="summary">
        <div class="summary-title">{{ summaryTitle }}</div>
        <div v-if="summaryMeta" class="summary-meta">{{ summaryMeta }}</div>
      </div>

      <div class="field">
        <label class="label">原因 <span class="required">*</span></label>
        <el-input
          v-model="reason"
          type="textarea"
          :rows="4"
          :maxlength="maxLength"
          :placeholder="placeholder"
          :class="{ 'is-error': !!error }"
          @input="error = ''"
        />
        <div class="meta-row">
          <span class="error">{{ error }}</span>
          <span class="count">{{ count }}/{{ maxLength }}</span>
        </div>
      </div>

      <div v-if="templates.length" class="templates">
        <button
          v-for="item in templates"
          :key="item"
          type="button"
          class="chip"
          @click="useTemplate(item)"
        >
          {{ item }}
        </button>
      </div>
    </div>

    <template #footer>
      <el-button @click="close">取消</el-button>
      <el-button :type="danger ? 'danger' : 'primary'" :loading="loading" @click="submit">
        {{ confirmText }}
      </el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.reason-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.desc {
  margin: 0;
  font-size: 13px;
  line-height: 20px;
  color: var(--ink-500);
}

.summary {
  padding: 10px 12px;
  border-radius: 8px;
  background: var(--bg-input);
}

.summary-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--ink-900);
}

.summary-meta {
  margin-top: 2px;
  font-size: 12px;
  color: var(--ink-500);
}

.label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  color: var(--ink-700);
}

.required {
  color: var(--danger-600);
}

.is-error :deep(.el-textarea__inner) {
  box-shadow: 0 0 0 1px var(--danger-600) inset;
}

.meta-row {
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
  font-size: 12px;
}

.error {
  color: var(--danger-600);
}

.count {
  color: var(--ink-400);
  font-variant-numeric: tabular-nums;
}

.templates {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  height: 28px;
  padding: 0 10px;
  border: none;
  border-radius: 6px;
  background: var(--bg-input);
  color: var(--ink-700);
  font-size: 12px;
  cursor: pointer;

  &:hover {
    background: var(--brand-50);
    color: var(--brand-600);
  }
}
</style>
