<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { UploadRequestOptions } from 'element-plus'
import { uploadImages } from '@/api/uploads'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    width?: number
    height?: number
    hint?: string
    maxSizeMB?: number
  }>(),
  { modelValue: '', width: 120, height: 120, hint: '', maxSizeMB: 5 },
)

const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>()

const uploading = ref(0)

const preview = computed(() => (props.modelValue ? [props.modelValue] : []))

async function customUpload(options: UploadRequestOptions) {
  const file = options.file
  if (file.size > props.maxSizeMB * 1024 * 1024) {
    ElMessage.error(`图片不能超过 ${props.maxSizeMB}MB`)
    return
  }
  uploading.value = 1
  try {
    const res = await uploadImages([file], (p) => (uploading.value = p))
    const url = res.items[0]?.url ?? ''
    emit('update:modelValue', url)
  } finally {
    uploading.value = 0
  }
}

function remove() {
  emit('update:modelValue', '')
}
</script>

<template>
  <div class="uploader">
    <el-upload
      :show-file-list="false"
      :http-request="customUpload"
      :disabled="uploading > 0"
      accept="image/jpeg,image/png,image/webp"
    >
      <div v-if="modelValue" class="preview" :style="{ width: `${width}px`, height: `${height}px` }">
        <el-image :src="modelValue" fit="cover" :preview-src-list="preview" preview-teleported />
        <span class="remove" @click.stop="remove">删除</span>
      </div>
      <div v-else class="dropzone" :style="{ width: `${width}px`, height: `${height}px` }">
        <el-icon :size="20"><Plus /></el-icon>
        <span class="text">{{ uploading ? `上传中 ${uploading}%` : '上传图片' }}</span>
      </div>
    </el-upload>
    <p v-if="hint" class="hint">{{ hint }}</p>
  </div>
</template>

<style scoped lang="scss">
.uploader {
  display: inline-flex;
  flex-direction: column;
  gap: 6px;
}

.dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border: 1px solid var(--line-300);
  border-radius: 8px;
  background: var(--bg-hover);
  color: var(--ink-400);
  cursor: pointer;

  &:hover {
    border-color: var(--brand-500);
    color: var(--brand-600);
  }

  .text {
    font-size: 12px;
    color: var(--ink-500);
  }
}

.preview {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--line-200);

  :deep(img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .remove {
    position: absolute;
    inset: auto 0 0 0;
    height: 24px;
    line-height: 24px;
    text-align: center;
    font-size: 12px;
    color: #fff;
    background: rgba(16, 24, 40, 0.55);
    cursor: pointer;
  }
}

.hint {
  margin: 0;
  font-size: 12px;
  color: var(--ink-500);
}
</style>
