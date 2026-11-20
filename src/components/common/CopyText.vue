<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { CopyDocument } from '@element-plus/icons-vue'

const props = defineProps<{ text: string; label?: string }>()

async function copy() {
  try {
    await navigator.clipboard.writeText(props.text)
    ElMessage.success('已复制')
  } catch {
    ElMessage.error('复制失败，请手动选择')
  }
}
</script>

<template>
  <button class="copy" type="button" :title="label || '复制'" @click="copy">
    <el-icon :size="14"><CopyDocument /></el-icon>
  </button>
</template>

<style scoped>
.copy {
  border: none;
  background: transparent;
  color: var(--ink-400);
  cursor: pointer;
  padding: 2px;
  border-radius: 4px;
  display: inline-flex;
}
.copy:hover {
  color: var(--brand-600);
  background: var(--bg-hover);
}
</style>
