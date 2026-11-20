<script setup lang="ts">
import { Key } from '@element-plus/icons-vue'
import CopyText from '@/components/common/CopyText.vue'

defineProps<{
  modelValue: boolean
  username: string
  password: string
}>()

const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void }>()
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    width="480px"
    :show-close="false"
    :close-on-click-modal="false"
    align-center
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="panel">
      <span class="icon"><el-icon :size="24"><Key /></el-icon></span>
      <h3>密码已重置</h3>
      <p class="user">管理员 <b>{{ username }}</b></p>

      <div class="password">
        <span class="value">{{ password }}</span>
        <CopyText :text="password" />
      </div>

      <p class="warning">仅显示一次，请通过安全渠道转交 · 首次登录后必须修改密码</p>
    </div>

    <template #footer>
      <el-button type="primary" style="width: 100%" @click="emit('update:modelValue', false)">
        我已保存
      </el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-align: center;
}

.icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--success-50);
  color: var(--success-600);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--ink-900);
}

.user {
  margin: 0;
  font-size: 13px;
  color: var(--ink-500);

  b {
    color: var(--ink-900);
    font-weight: 500;
  }
}

.password {
  width: 100%;
  height: 48px;
  margin-top: 4px;
  padding: 0 12px 0 16px;
  border-radius: 8px;
  background: var(--bg-input);
  display: flex;
  align-items: center;
  justify-content: space-between;

  .value {
    font-family: var(--font-mono);
    font-size: 18px;
    font-weight: 600;
    color: var(--ink-900);
    letter-spacing: 1px;
  }
}

.warning {
  margin: 0;
  font-size: 12px;
  color: var(--warning-600);
}
</style>
