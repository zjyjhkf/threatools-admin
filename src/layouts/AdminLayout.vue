<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'

const app = useAppStore()
const collapsed = computed(() => app.sidebarCollapsed)
</script>

<template>
  <div class="layout" :class="{ collapsed }">
    <AppSidebar :collapsed="collapsed" />
    <div class="layout-main">
      <AppHeader />
      <el-alert
        v-if="!app.online"
        class="offline"
        type="warning"
        :closable="false"
        title="网络已断开，部分操作不可用"
        show-icon
      />
      <main class="layout-content">
        <router-view v-slot="{ Component }">
          <component :is="Component" />
        </router-view>
      </main>
    </div>
  </div>
</template>

<style scoped lang="scss">
.layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: var(--bg-page);
}

.layout-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.layout-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: var(--page-pad);
}

.offline {
  border-radius: 0;
}
</style>
