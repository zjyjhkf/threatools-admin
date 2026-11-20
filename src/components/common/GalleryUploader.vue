<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Box } from '@element-plus/icons-vue'
import type { UploadRequestOptions } from 'element-plus'
import { uploadImages } from '@/api/uploads'

const props = withDefaults(
  defineProps<{ modelValue?: string[]; max?: number; size?: number; maxSizeMB?: number }>(),
  { modelValue: () => [], max: 4, size: 120, maxSizeMB: 5 },
)

const emit = defineEmits<{ (e: 'update:modelValue', value: string[]): void }>()

const uploading = ref(0)

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
    emit('update:modelValue', [...props.modelValue, url].slice(0, props.max))
  } finally {
    uploading.value = 0
  }
}

function remove(index: number) {
  const next = [...props.modelValue]
  next.splice(index, 1)
  emit('update:modelValue', next)
}
</script>

<template>
  <div class="gallery">
    <div
      v-for="(image, index) in modelValue"
      :key="`${image}-${index}`"
      class="tile"
      :style="{ width: `${size}px`, height: `${size}px` }"
    >
      <el-image
        v-if="image"
        :src="image"
        fit="cover"
        :preview-src-list="modelValue"
        :initial-index="index"
        preview-teleported
      />
      <div v-else class="placeholder">
        <el-icon :size="24"><Box /></el-icon>
        <span class="model">APM-200</span>
      </div>
      <span v-if="index === 0" class="badge">封面</span>
      <span class="remove" @click="remove(index)">删除</span>
    </div>

    <el-upload
      v-if="modelValue.length < max"
      :show-file-list="false"
      :http-request="customUpload"
      :disabled="uploading > 0"
      accept="image/jpeg,image/png,image/webp"
    >
      <div class="dropzone" :style="{ width: `${size}px`, height: `${size}px` }">
        <el-icon :size="20"><Plus /></el-icon>
        <span class="text">{{ uploading ? `${uploading}%` : '上传' }}</span>
      </div>
    </el-upload>
  </div>
</template>

<style scoped lang="scss">
.gallery {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.tile {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background: linear-gradient(135deg, var(--dark-tile-1), var(--dark-tile-2));
  color: var(--dark-icon);

  :deep(.el-image) {
    width: 100%;
    height: 100%;
    display: block;
    background: transparent;
  }

  .placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    color: var(--dark-icon);

    .model {
      font-size: 11px;
      font-family: var(--font-mono);
    }
  }

  .badge {
    position: absolute;
    top: 6px;
    left: 6px;
    height: 18px;
    padding: 0 6px;
    border-radius: 4px;
    background: var(--brand-600);
    color: #fff;
    font-size: 10px;
    line-height: 18px;
  }

  .remove {
    position: absolute;
    inset: auto 0 0 0;
    height: 22px;
    line-height: 22px;
    text-align: center;
    font-size: 11px;
    color: #fff;
    background: rgba(16, 24, 40, 0.55);
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.15s;
  }

  &:hover .remove {
    opacity: 1;
  }
}

.dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border: 1px dashed var(--line-300);
  border-radius: 8px;
  background: var(--bg-card);
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
</style>
