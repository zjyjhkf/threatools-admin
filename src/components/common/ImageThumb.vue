<script setup lang="ts">
import { Picture, Box, VideoPlay } from '@element-plus/icons-vue'

withDefaults(
  defineProps<{
    src?: string
    variant?: 'square' | 'cover' | 'dark'
    width?: number
    height?: number
    icon?: 'picture' | 'box' | 'play'
    radius?: number
  }>(),
  { src: '', variant: 'square', width: 56, height: 56, icon: 'picture', radius: 8 },
)
</script>

<template>
  <div
    class="thumb"
    :class="variant"
    :style="{ width: `${width}px`, height: `${height}px`, borderRadius: `${radius}px` }"
  >
    <img v-if="src" :src="src" alt="" loading="lazy" />
    <el-icon v-else :size="variant === 'cover' ? 18 : 16">
      <Box v-if="icon === 'box'" />
      <VideoPlay v-else-if="icon === 'play'" />
      <Picture v-else />
    </el-icon>
  </div>
</template>

<style scoped lang="scss">
.thumb {
  flex: 0 0 auto;
  overflow: hidden;
  background: var(--brand-100);
  color: var(--brand-600);
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &.dark {
    background: linear-gradient(135deg, var(--dark-tile-1), var(--dark-tile-2));
    color: var(--dark-icon);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}
</style>
