<script setup lang="ts">
import { computed } from 'vue'
import { Plus, Top, Bottom, Delete } from '@element-plus/icons-vue'
import type { ChapterInput } from '@/api/types'
import { formatDuration } from '@/utils/format'

const props = withDefaults(
  defineProps<{ modelValue: ChapterInput[]; max?: number }>(),
  { max: 30 },
)

const emit = defineEmits<{ (e: 'update:modelValue', value: ChapterInput[]): void }>()

const chapters = computed(() => props.modelValue)

const totalDuration = computed(() =>
  chapters.value.reduce((sum, item) => sum + Number(item.duration || 0), 0),
)

function update(next: ChapterInput[]) {
  emit('update:modelValue', next)
}

function patch(index: number, key: keyof ChapterInput, value: string | number) {
  const next = chapters.value.map((item, i) => (i === index ? { ...item, [key]: value } : item))
  update(next)
}

function add() {
  if (chapters.value.length >= props.max) return
  update([...chapters.value, { title: '', duration: 0, videoUrl: '' }])
}

function remove(index: number) {
  update(chapters.value.filter((_, i) => i !== index))
}

function move(index: number, offset: number) {
  const target = index + offset
  if (target < 0 || target >= chapters.value.length) return
  const next = [...chapters.value]
  const [item] = next.splice(index, 1)
  next.splice(target, 0, item)
  update(next)
}
</script>

<template>
  <div class="chapter-editor">
    <div class="chapter-head">
      <span class="col-index">序号</span>
      <span class="col-title">标题</span>
      <span class="col-duration">时长（秒）</span>
      <span class="col-url">视频 URL</span>
      <span class="col-actions">操作</span>
    </div>

    <div v-for="(chapter, index) in chapters" :key="index" class="chapter-row">
      <span class="col-index muted">{{ String(index + 1).padStart(2, '0') }}</span>
      <el-input
        class="col-title"
        :model-value="chapter.title"
        placeholder="章节标题"
        maxlength="40"
        @update:model-value="(v: string) => patch(index, 'title', v)"
      />
      <el-input-number
        class="col-duration"
        :model-value="chapter.duration"
        :min="0"
        :max="7200"
        controls-position="right"
        @update:model-value="(v: number | undefined) => patch(index, 'duration', v ?? 0)"
      />
      <el-input
        class="col-url"
        :model-value="chapter.videoUrl"
        placeholder="https://"
        @update:model-value="(v: string) => patch(index, 'videoUrl', v)"
      />
      <span class="col-actions">
        <el-button link :icon="Top" :disabled="index === 0" @click="move(index, -1)" />
        <el-button
          link
          :icon="Bottom"
          :disabled="index === chapters.length - 1"
          @click="move(index, 1)"
        />
        <el-button link type="danger" :icon="Delete" @click="remove(index)" />
      </span>
    </div>

    <div v-if="chapters.length === 0" class="empty">还没有章节，添加第一节</div>

    <div class="chapter-footer">
      <el-button link type="primary" :icon="Plus" :disabled="chapters.length >= max" @click="add">
        新增章节
      </el-button>
      <span class="summary">
        共 {{ chapters.length }} 节 · 总时长 {{ formatDuration(totalDuration) }}
      </span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.chapter-editor {
  display: flex;
  flex-direction: column;
}

.chapter-head,
.chapter-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chapter-head {
  height: 36px;
  font-size: 13px;
  font-weight: 600;
  color: var(--ink-700);
  border-bottom: 1px solid var(--line-200);
}

.chapter-row {
  padding: 10px 0;
  border-bottom: 1px solid var(--line-200);
}

.col-index {
  width: 48px;
  text-align: center;
  font-family: var(--font-mono);
  font-size: 12px;
}

.col-title {
  flex: 1;
  min-width: 220px;
}

.col-duration {
  width: 130px;
  flex: 0 0 130px;
}

.col-url {
  flex: 1;
  min-width: 220px;
}

.col-actions {
  width: 96px;
  flex: 0 0 96px;
  display: flex;
  justify-content: flex-end;
  gap: 2px;
}

.muted {
  color: var(--ink-400);
}

.empty {
  padding: 32px;
  text-align: center;
  color: var(--ink-500);
  font-size: 13px;
}

.chapter-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
}

.summary {
  font-size: 12px;
  color: var(--ink-500);
}
</style>
