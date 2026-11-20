<script setup lang="ts">
import { computed } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'
import type { Spec } from '@/api/types'

const props = withDefaults(defineProps<{ modelValue: Spec[]; max?: number }>(), { max: 12 })
const emit = defineEmits<{ (e: 'update:modelValue', value: Spec[]): void }>()

const rows = computed(() => props.modelValue)

function update(next: Spec[]) {
  emit('update:modelValue', next)
}

function patch(index: number, key: keyof Spec, value: string) {
  update(rows.value.map((row, i) => (i === index ? { ...row, [key]: value } : row)))
}

function add() {
  if (rows.value.length >= props.max) return
  update([...rows.value, { label: '', value: '' }])
}

function remove(index: number) {
  update(rows.value.filter((_, i) => i !== index))
}
</script>

<template>
  <div class="editor">
    <div v-for="(row, index) in rows" :key="index" class="row">
      <el-input
        class="label"
        :model-value="row.label"
        placeholder="参数名"
        maxlength="20"
        @update:model-value="(v: string) => patch(index, 'label', v)"
      />
      <el-input
        class="value"
        :model-value="row.value"
        placeholder="参数值"
        maxlength="40"
        @update:model-value="(v: string) => patch(index, 'value', v)"
      />
      <el-button link type="danger" :icon="Delete" @click="remove(index)" />
    </div>

    <el-button link type="primary" :icon="Plus" :disabled="rows.length >= max" @click="add">
      添加参数
    </el-button>
  </div>
</template>

<style scoped lang="scss">
.editor {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--line-200);
}

.label {
  width: 240px;
  flex: 0 0 240px;
}

.value {
  flex: 1;
}
</style>
