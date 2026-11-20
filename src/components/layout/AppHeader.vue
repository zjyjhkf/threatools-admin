<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { Expand, Fold, Refresh, ArrowDown } from '@element-plus/icons-vue'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'

const app = useAppStore()
const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const breadcrumb = computed(() => {
  const group = route.meta.group
  const list = route.matched.filter((r) => r.meta?.title)
  const title = String(route.meta.title ?? '')
  return group ? [group, title] : [title]
})

const nickname = computed(() => auth.profile?.nickname || auth.profile?.username || '管理员')
const initial = computed(() => nickname.value.slice(0, 1))

function refresh() {
  window.location.reload()
}

async function logout() {
  try {
    await ElMessageBox.confirm('退出后需要重新登录，确定退出？', '退出登录', {
      type: 'warning',
      confirmButtonText: '退出',
      cancelButtonText: '取消',
    })
  } catch {
    return
  }
  auth.reset()
  router.replace({ name: 'login' })
}

function onCommand(cmd: string) {
  if (cmd === 'profile') router.push({ name: 'profile' })
  if (cmd === 'password') router.push({ name: 'change-password' })
  if (cmd === 'logout') logout()
}
</script>

<template>
  <header class="header">
    <div class="left">
      <button class="icon-btn" type="button" @click="app.toggleSidebar()">
        <el-icon :size="16"><Expand v-if="app.sidebarCollapsed" /><Fold v-else /></el-icon>
      </button>
      <nav class="breadcrumb">
        <template v-for="(item, i) in breadcrumb" :key="i">
          <span v-if="i > 0" class="sep">/</span>
          <span :class="{ current: i === breadcrumb.length - 1 }">{{ item }}</span>
        </template>
      </nav>
    </div>

    <div class="right">
      <button class="icon-btn" type="button" title="刷新" @click="refresh">
        <el-icon :size="16"><Refresh /></el-icon>
      </button>
      <span class="divider" />
      <el-dropdown trigger="click" @command="onCommand">
        <button class="user" type="button">
          <span class="avatar">{{ initial }}</span>
          <span class="name">{{ nickname }}</span>
          <el-icon :size="14" class="muted"><ArrowDown /></el-icon>
        </button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">个人中心</el-dropdown-item>
            <el-dropdown-item command="password">修改密码</el-dropdown-item>
            <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </header>
</template>

<style scoped lang="scss">
.header {
  height: var(--header-h);
  flex: 0 0 var(--header-h);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: var(--bg-card);
  border-bottom: 1px solid var(--line-200);
}

.left,
.right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-btn {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  border-radius: 6px;
  color: var(--ink-700);
  cursor: pointer;

  &:hover {
    background: var(--bg-hover);
  }
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--ink-500);

  .sep {
    color: var(--ink-400);
  }

  .current {
    color: var(--ink-900);
    font-weight: 500;
  }
}

.divider {
  width: 1px;
  height: 20px;
  background: var(--line-200);
}

.user {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  padding: 0 8px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;

  &:hover {
    background: var(--bg-hover);
  }
}

.avatar {
  width: 28px;
  height: 28px;
  border-radius: 999px;
  background: var(--brand-100);
  color: var(--brand-600);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
}

.name {
  font-size: 14px;
  color: var(--ink-900);
}

.muted {
  color: var(--ink-400);
}
</style>
