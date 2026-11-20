<script setup lang="ts">
import { onMounted } from 'vue'
import { useAppStore } from '@/stores/app'

const app = useAppStore()

onMounted(() => app.bindNetwork())
</script>

<template>
  <el-config-provider>
    <router-view />
  </el-config-provider>
</template>
