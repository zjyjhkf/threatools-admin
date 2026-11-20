<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  Odometer,
  Document,
  ChatDotSquare,
  User,
  CollectionTag,
  Reading,
  Box,
  Filter,
  Avatar,
  Tickets,
  UserFilled,
  Fold,
} from '@element-plus/icons-vue'
import { routes } from '@/router/routes'
import { useAuthStore } from '@/stores/auth'

defineProps<{ collapsed?: boolean }>()

const route = useRoute()
const auth = useAuthStore()

const iconMap: Record<string, unknown> = {
  dashboard: Odometer,
  posts: Document,
  comments: ChatDotSquare,
  users: User,
  topics: CollectionTag,
  courses: Reading,
  products: Box,
  'meta-items': Filter,
  admins: Avatar,
  'audit-logs': Tickets,
  profile: UserFilled,
}

interface MenuItem {
  name: string
  title: string
  path: string
  icon: unknown
  group: string
}

const adminRoute = routes.find((r) => r.path === '/')

const items = computed<MenuItem[]>(() =>
  (adminRoute?.children ?? [])
    .filter((r) => !r.meta?.hidden)
    .filter((r) => auth.hasPerm(r.meta?.permission))
    .sort((a, b) => (a.meta?.order ?? 99) - (b.meta?.order ?? 99))
    .map((r) => ({
      name: String(r.name ?? r.path),
      title: r.meta?.title ?? '',
      path: `/${r.path}`,
      icon: iconMap[String(r.name)] ?? Document,
      group: r.meta?.group ?? '',
    })),
)

const blocks = computed(() => {
  const out: Array<{ label: string; items: MenuItem[] }> = []
  items.value.forEach((item) => {
    const last = out[out.length - 1]
    if (last && last.label === item.group) last.items.push(item)
    else out.push({ label: item.group, items: [item] })
  })
  return out
})

const isActive = (path: string) => route.path === path || route.path.startsWith(`${path}/`)
</script>

<template>
  <aside class="sidebar" :class="{ collapsed }">
    <div class="brand">
      <div class="logo">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#fff" stroke-width="2">
          <path d="M3 12h4l2-6 4 12 2-6h6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
      <span v-if="!collapsed" class="brand-name">健衡运动社区</span>
    </div>

    <nav class="menu">
      <template v-for="(block, bi) in blocks" :key="bi">
        <div v-if="block.label && !collapsed" class="group-label">{{ block.label }}</div>
        <div v-else-if="block.label && collapsed" class="group-divider" />
        <router-link
          v-for="item in block.items"
          :key="item.name"
          :to="item.path"
          class="menu-item"
          :class="{ active: isActive(item.path), 'with-group': !!block.label }"
          :title="collapsed ? item.title : ''"
        >
          <span class="bar" />
          <el-icon :size="16"><component :is="item.icon" /></el-icon>
          <span v-if="!collapsed" class="label">{{ item.title }}</span>
        </router-link>
      </template>
    </nav>

    <div class="sidebar-footer">
      <span v-if="!collapsed" class="version">v1.0.0</span>
      <el-icon v-else :size="16" class="muted"><Fold /></el-icon>
    </div>
  </aside>
</template>

<style scoped lang="scss">
.sidebar {
  width: var(--sidebar-w);
  flex: 0 0 var(--sidebar-w);
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-card);
  border-right: 1px solid var(--line-200);
  transition: width 0.18s ease;

  &.collapsed {
    width: var(--sidebar-w-collapsed);
    flex-basis: var(--sidebar-w-collapsed);
  }
}

.brand {
  height: 56px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 16px;
  flex: 0 0 auto;
}

.logo {
  width: 28px;
  height: 28px;
  flex: 0 0 28px;
  border-radius: 8px;
  background: var(--brand-600);
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--ink-900);
  white-space: nowrap;
}

.menu {
  flex: 1;
  overflow-y: auto;
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.group-label {
  padding: 12px 12px 6px;
  font-size: 12px;
  font-weight: 500;
  color: var(--ink-400);
  letter-spacing: 0.5px;
}

.group-divider {
  height: 1px;
  margin: 8px 8px;
  background: var(--line-200);
}

.menu-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  height: 40px;
  padding: 0 12px;
  border-radius: 8px;
  color: var(--ink-700);
  font-size: 14px;
  white-space: nowrap;

  &.with-group {
    height: 36px;
    padding-left: 12px;
    font-size: 13px;
    margin-left: 24px;
  }

  .bar {
    position: absolute;
    left: 0;
    top: 10px;
    width: 3px;
    height: 20px;
    border-radius: 2px;
    background: transparent;
  }

  &:hover {
    background: var(--bg-hover);
  }

  &.active {
    background: var(--sidebar-active-bg, #e8f8ef);
    color: var(--brand-700);
    font-weight: 500;

    .bar {
      background: var(--brand-600);
    }

    .el-icon {
      color: var(--brand-700);
    }
  }
}

.collapsed .menu-item {
  justify-content: center;
  padding: 0;
  margin-left: 0;

  .bar {
    display: none;
  }
}

.sidebar-footer {
  height: 56px;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-top: 1px solid var(--line-200);

  .version {
    font-size: 12px;
    color: var(--ink-400);
    font-family: var(--font-mono);
  }

  .muted {
    color: var(--ink-400);
  }
}

.collapsed .sidebar-footer {
  justify-content: center;
  padding: 0;
}
</style>
