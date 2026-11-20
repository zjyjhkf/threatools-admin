<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import {
  Refresh,
  ArrowRight,
  Warning,
  User,
  Document,
  ChatDotSquare,
  CollectionTag,
  Reading,
  Box,
  Avatar,
  DocumentChecked,
  Tickets,
} from '@element-plus/icons-vue'
import PageHeader from '@/components/common/PageHeader.vue'
import TrendBars from '@/components/dashboard/TrendBars.vue'
import * as overviewApi from '@/api/overview'
import * as auditApi from '@/api/audit'
import type { AuditLog, Overview } from '@/api/types'
import { formatDate, formatCount, maskIp } from '@/utils/format'

const router = useRouter()
const loading = ref(true)
const overview = ref<Overview | null>(null)
const recent = ref<AuditLog[]>([])

const today = dayjs().format('YYYY-MM-DD') + ' ' + ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][dayjs().day()]

const statCards = computed(() => {
  const t = overview.value?.totals
  const today = overview.value?.today
  if (!t || !today) return []
  return [
    { icon: User, label: '用户总数', value: t.users, delta: `今日 +${today.newUsers}`, kind: 'up' },
    { icon: Document, label: '帖子总数', value: t.posts, delta: `今日 +${today.newPosts}`, kind: 'up' },
    { icon: ChatDotSquare, label: '评论总数', value: t.comments, delta: `今日 +${today.newComments}`, kind: 'up' },
    { icon: CollectionTag, label: '话题总数', value: t.topics, delta: '本周 +2', kind: 'up' },
    { icon: Reading, label: '课程总数', value: t.courses, delta: '上架 5', kind: 'flat' },
    { icon: Box, label: '产品总数', value: t.products, delta: '上架 4', kind: 'flat' },
    { icon: Avatar, label: '管理员', value: t.admins, delta: '启用 3', kind: 'flat' },
  ]
})

const pending = computed(() => overview.value?.pending.posts ?? 0)

const quickActions = [
  { icon: DocumentChecked, label: '去审核', to: { name: 'posts', query: { reviewStatus: 'pending' } }, count: pending },
  { icon: Reading, label: '新建课程', to: { name: 'course-create' } },
  { icon: Box, label: '新建产品', to: { name: 'product-create' } },
  { icon: Tickets, label: '查看操作日志', to: { name: 'audit-logs' } },
]

async function load() {
  loading.value = true
  try {
    const [data, logs] = await Promise.all([
      overviewApi.getOverview(),
      auditApi.listAuditLogs({ page: 1, size: 4 }).catch(() => null),
    ])
    overview.value = data
    recent.value = logs?.list ?? []
  } finally {
    loading.value = false
  }
}

function goAudit(row: AuditLog) {
  router.push({ name: 'audit-logs', query: { adminId: row.admin.id } })
}

onMounted(load)
</script>

<template>
  <div v-loading="loading" class="page dashboard">
    <PageHeader title="概览" subtitle="今天也在守护社区">
      <template #actions>
        <span class="date">{{ today }}</span>
        <el-button :icon="Refresh" @click="load">刷新</el-button>
        <el-button type="primary" @click="router.push({ name: 'posts', query: { reviewStatus: 'pending' } })">
          去审核
        </el-button>
      </template>
    </PageHeader>

    <div v-if="pending > 0" class="pending-banner">
      <el-icon :size="20" class="pending-icon"><Warning /></el-icon>
      <div class="pending-text">
        <strong>有 {{ pending }} 条帖子待审核</strong>
        <span>最早一条已等待 2 小时 18 分</span>
      </div>
      <el-button link type="primary" @click="router.push({ name: 'posts', query: { reviewStatus: 'pending' } })">
        去审核 <el-icon><ArrowRight /></el-icon>
      </el-button>
    </div>

    <div class="stat-grid">
      <div v-for="card in statCards" :key="card.label" class="stat-card">
        <div class="stat-top">
          <span class="icon-box"><el-icon :size="16"><component :is="card.icon" /></el-icon></span>
          <span class="label">{{ card.label }}</span>
        </div>
        <div class="stat-bottom">
          <span class="value">{{ formatCount(card.value) }}</span>
          <span class="delta" :class="card.kind">{{ card.delta }}</span>
        </div>
      </div>
    </div>

    <div class="main-row">
      <TrendBars :points="overview?.trend ?? []" />

      <div class="quick-card">
        <h3 class="card-title">快捷操作</h3>
        <button
          v-for="item in quickActions"
          :key="item.label"
          type="button"
          class="quick-row"
          @click="router.push(item.to as never)"
        >
          <span class="quick-icon"><el-icon :size="16"><component :is="item.icon" /></el-icon></span>
          <span class="quick-label">{{ item.label }}</span>
          <span v-if="item.count" class="quick-count">{{ item.count }}</span>
          <el-icon :size="14" class="chevron"><ArrowRight /></el-icon>
        </button>
      </div>
    </div>

    <div class="page-card audit-card">
      <div class="audit-head">
        <h3 class="card-title">最近操作</h3>
        <el-button link type="primary" @click="router.push({ name: 'audit-logs' })">查看全部 →</el-button>
      </div>

      <el-table :data="recent" size="small" @row-click="goAudit">
        <el-table-column label="时间" width="160">
          <template #default="{ row }">
            <span class="mono muted">{{ formatDate(row.createdAt, 'HH:mm:ss') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作者" width="160" prop="admin.username" />
        <el-table-column label="动作" width="320">
          <template #default="{ row }">
            <span class="mono">{{ row.action }}</span>
          </template>
        </el-table-column>
        <el-table-column label="目标" min-width="320">
          <template #default="{ row }">{{ row.targetLabel }}</template>
        </el-table-column>
        <el-table-column label="requestId" width="160">
          <template #default="{ row }">
            <span class="mono muted">{{ row.requestId }}</span>
          </template>
        </el-table-column>
      </el-table>

      <el-empty
        v-if="!loading && recent.length === 0"
        description="还没有操作记录"
        :image-size="72"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.dashboard {
  gap: 16px;
}

.date {
  font-size: 13px;
  color: var(--ink-500);
  margin-right: 4px;
}

.pending-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 64px;
  padding: 0 20px;
  border-radius: 12px;
  background: var(--warning-50);
  border: 1px solid var(--warning-border);

  .pending-icon {
    color: var(--warning-600);
  }

  .pending-text {
    display: flex;
    flex-direction: column;
    gap: 2px;

    strong {
      font-size: 14px;
      color: var(--ink-900);
    }

    span {
      font-size: 12px;
      color: var(--ink-500);
    }
  }

  .el-button {
    margin-left: auto;
  }
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 8px;
  height: 112px;
  padding: 16px;
  background: var(--bg-card);
  border: 1px solid var(--line-200);
  border-radius: 12px;
  box-shadow: var(--sh-card);
}

.stat-top {
  display: flex;
  align-items: center;
  gap: 8px;

  .icon-box {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: var(--brand-100);
    color: var(--brand-600);
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .label {
    font-size: 13px;
    color: var(--ink-500);
  }
}

.stat-bottom {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;

  .value {
    font-size: 28px;
    line-height: 34px;
    font-weight: 600;
    color: var(--ink-900);
    font-variant-numeric: tabular-nums;
  }

  .delta {
    font-size: 12px;

    &.up {
      color: var(--success-600);
    }
    &.flat {
      color: var(--ink-400);
    }
  }
}

.main-row {
  display: grid;
  grid-template-columns: minmax(0, 760fr) minmax(0, 384fr);
  gap: 16px;
}

.quick-card {
  height: 300px;
  padding: 20px;
  background: var(--bg-card);
  border: 1px solid var(--line-200);
  border-radius: 12px;
  box-shadow: var(--sh-card);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.card-title {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  color: var(--ink-900);
}

.quick-row {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 40px;
  padding: 0 8px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  text-align: left;

  &:hover {
    background: var(--bg-hover);
  }

  .quick-icon {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--brand-50);
    color: var(--brand-600);
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .quick-label {
    font-size: 14px;
    color: var(--ink-900);
  }

  .quick-count {
    height: 18px;
    padding: 0 6px;
    border-radius: 6px;
    background: var(--warning-50);
    color: var(--warning-600);
    font-size: 11px;
    line-height: 18px;
  }

  .chevron {
    margin-left: auto;
    color: var(--ink-400);
  }
}

.audit-card {
  padding: 16px 20px 20px;
}

.audit-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;

  .card-title {
    margin: 0;
  }
}

.mono {
  font-family: var(--font-mono);
  font-size: 12px;
}

.muted {
  color: var(--ink-400);
}

@media (max-width: 1280px) {
  .stat-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
  .main-row {
    grid-template-columns: 1fr;
  }
}
</style>
