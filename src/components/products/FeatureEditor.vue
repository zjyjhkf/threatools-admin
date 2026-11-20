<script setup lang="ts">
import { computed } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'
import type { Feature } from '@/api/types'

const props = withDefaults(defineProps<{ modelValue: Feature[]; max?: number }>(), { max: 3 })
const emit = defineEmits<{ (e: 'update:modelValue', value: Feature[]): void }>()

const rows = computed(() => props.modelValue)

const iconOptions = [
  { label: '分压 layers', value: 'layers' },
  { label: '定时 timer', value: 'timer' },
  { label: '轻量 feather', value: 'feather' },
  { label: '放松 activity', value: 'activity' },
  { label: '安全 shield', value: 'shield' },
]

function update(next: Feature[]) {
  emit('update:modelValue', next)
}

function patch(index: number, key: keyof Feature, value: string) {
  update(rows.value.map((row, i) => (i === index ? { ...row, [key]: value } : row)))
}

function add() {
  if (rows.value.length >= props.max) return
  update([...rows.value, { icon: 'layers', title: '', desc: '' }])
}

function remove(index: number) {
  update(rows.value.filter((_, i) => i !== index))
}
</script>

<template>
  <div class="editor">
    <div v-for="(row, index) in rows" :key="index" class="row">
      <el-select
        :model-value="row.icon"
        class="icon-select"
        @update:model-value="(v: string) => patch(index, 'icon', v)"
      >
        <el-option v-for="item in iconOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-input
        class="title"
        :model-value="row.title"
        placeholder="卖点标题"
        maxlength="12"
        @update:model-value="(v: string) => patch(index, 'title', v)"
      />
      <el-input
        class="desc"
        :model-value="row.desc"
        placeholder="一句话描述"
        maxlength="40"
        @update:model-value="(v: string) => patch(index, 'desc', v)"
      />
      <el-button link type="danger" :icon="Delete" @click="remove(index)" />
    </div>

    <el-button link type="primary" :icon="Plus" :disabled="rows.length >= max" @click="add">
      添加卖点
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

.icon-select {
  width: 160px;
  flex: 0 0 160px;
}

.title {
  width: 200px;
  flex: 0 0 200px;
}

.desc {
  flex: 1;
}
</style>
