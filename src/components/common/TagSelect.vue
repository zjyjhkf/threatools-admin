<script setup lang="ts">
/**
 * 标签选择器：候选来自后台「筛选条目」字典 + 已上架内容用过的标签，
 * 支持输入联想，也允许直接回车新增自由标签。
 */
import { onMounted, ref } from 'vue'
import * as metaApi from '@/api/meta'

const props = withDefaults(
  defineProps<{
    modelValue: string[]
    group: 'product_tag' | 'course_tag'
    max?: number
    placeholder?: string
    width?: string
  }>(),
  { max: 5, placeholder: '输入关键词联想，回车可新增', width: '540px' },
)

const emit = defineEmits<{ (e: 'update:modelValue', value: string[]): void }>()

const options = ref<string[]>([])
let seq = 0

async function load(keyword = '') {
  const current = ++seq
  try {
    const res = await metaApi.suggestTags(props.group, keyword, 12)
    if (current === seq) options.value = res.tags
  } catch {
    /* 联想失败不阻塞手填 */
  }
}

onMounted(() => load())
</script>

<template>
  <el-select
    :model-value="modelValue"
    multiple
    filterable
    allow-create
    default-first-option
    remote
    :remote-method="load"
    :multiple-limit="max"
    :placeholder="placeholder"
    :style="{ width }"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <el-option v-for="tag in options" :key="tag" :label="tag" :value="tag" />
  </el-select>
</template>
