<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Location } from '@element-plus/icons-vue'

const router = useRouter()
</script>

<template>
  <div class="blank">
    <div class="brand">
      <div class="logo">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" stroke-width="2">
          <path d="M3 12h4l2-6 4 12 2-6h6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
      <span>健衡管理端</span>
    </div>

    <div class="result">
      <span class="icon"><el-icon :size="48"><Location /></el-icon></span>
      <h1>页面不存在</h1>
      <p>链接可能已失效，或页面已被移动。</p>
      <div class="actions">
        <el-button type="primary" @click="router.replace({ name: 'dashboard' })">返回概览</el-button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.blank {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-page);
}

.brand {
  position: absolute;
  top: 32px;
  left: 32px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--ink-900);
}

.logo {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--brand-600);
  display: flex;
  align-items: center;
  justify-content: center;
}

.result {
  width: 480px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  h1 {
    margin: 24px 0 0;
    font-size: 24px;
    font-weight: 600;
    color: var(--ink-900);
  }

  p {
    margin: 8px 0 0;
    font-size: 14px;
    line-height: 22px;
    color: var(--ink-500);
  }
}

.icon {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: var(--brand-50);
  color: var(--brand-600);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.actions {
  margin-top: 24px;
}
</style>
