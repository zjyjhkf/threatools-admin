<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import PageHeader from '@/components/common/PageHeader.vue'
import CopyText from '@/components/common/CopyText.vue'
import * as auditApi from '@/api/audit'
import type { AuditLog } from '@/api/types'
import { formatDate, maskIp } from '@/utils/format'

const filters = reactive({
  adminId: '',
  module: '',
  action: '',
  targetType: '',
  targetId: '',
  dateRange: [] as string[],
})

const modules = [
  { label: '登录', value: 'auth' },
  { label: '帖子', value: 'post' },
  { label: '评论', value: 'comment' },
  { label: '用户', value: 'user' },
  { label: '话题', value: 'topic' },
  { label: '课程', value: 'course' },
  { label: '产品', value: 'product' },
  { label: '管理员', value: 'admin' },
  { label: '上传', value: 'upload' },
]

const list = ref<AuditLog[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(20)
const loading = ref(false)

async function load() {
  loading.value = true
  try {
    const res = await auditApi.listAuditLogs({
      adminId: filters.adminId || undefined,
      module: filters.module || undefined,
      action: filters.action || undefined,
      targetType: filters.targetType || undefined,
      targetId: filters.targetId || undefined,
      startDate: filters.dateRange?.[0] || undefined,
      endDate: filters.dateRange?.[1] || undefined,
      page: page.value,
      size: size.value,
    })
    list.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

function search() {
  page.value = 1
  load()
}

function reset() {
  Object.assign(filters, {
    adminId: '',
    module: '',
    action: '',
    targetType: '',
    targetId: '',
    dateRange: [],
  })
  page.value = 1
  load()
}

function onSizeChange(nextSize: number) {
  size.value = nextSize
  page.value = 1
  load()
}

const json = (value: Record<string, unknown> | null) =>
  value ? JSON.stringify(value, null, 2) : 'null'

onMounted(load)
</script>

<template>
  <div class="page">
    <PageHeader title="操作日志" subtitle="所有管理端写操作留痕，只读不可修改">
      <template #actions>
        <el-button :icon="Refresh" @click="load">刷新</el-button>
      </template>
    </PageHeader>

    <div class="page-card filter-card">
      <el-form :inline="true" @submit.prevent>
        <el-form-item label="操作者">
          <el-input v-model="filters.adminId" placeholder="管理员 ID" clearable style="width: 160px" />
        </el-form-item>
        <el-form-item label="模块">
          <el-select v-model="filters.module" placeholder="全部" clearable style="width: 140px">
            <el-option v-for="item in modules" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="动作">
          <el-input v-model="filters.action" placeholder="post.review_reject" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="目标类型">
          <el-input v-model="filters.targetType" placeholder="post / user" clearable style="width: 120px" />
        </el-form-item>
        <el-form-item label="目标 ID">
          <el-input v-model="filters.targetId" placeholder="目标 ID" clearable style="width: 120px" />
        </el-form-item>
        <el-form-item label="日期">
          <el-date-picker
            v-model="filters.dateRange"
            type="daterange"
            range-separator="—"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="search">查询</el-button>
          <el-button @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="page-card table-card">
      <div class="table-toolbar">
        <span class="count">共 {{ total }} 条 · 近 7 天</span>
        <el-button :icon="Refresh" circle text @click="load" />
      </div>

      <el-table v-loading="loading" :data="list" row-key="id">
        <el-table-column type="expand">
          <template #default="{ row }">
            <div class="expand">
              <div class="col">
                <div class="col-head">
                  <span>变更前</span>
                  <CopyText :text="json(row.before)" />
                </div>
                <pre class="code">{{ json(row.before) }}</pre>
              </div>
              <div class="col">
                <div class="col-head">
                  <span>变更后</span>
                  <CopyText :text="json(row.after)" />
                </div>
                <pre class="code">{{ json(row.after) }}</pre>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="时间" width="150">
          <template #default="{ row }">
            <span class="mono muted">{{ formatDate(row.createdAt, 'MM-DD HH:mm:ss') }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作者" width="150">
          <template #default="{ row }">
            <div class="cell-stack">
              <span class="title">{{ row.admin.username }}</span>
              <span class="sub">{{ row.admin.nickname }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="模块" width="80">
          <template #default="{ row }">
            <span class="module-tag">{{ row.module }}</span>
          </template>
        </el-table-column>

        <el-table-column label="动作" width="200">
          <template #default="{ row }">
            <span class="mono">{{ row.action }}</span>
          </template>
        </el-table-column>

        <el-table-column label="目标" min-width="200">
          <template #default="{ row }">
            <div class="cell-stack">
              <span class="title">{{ row.targetLabel }}</span>
              <span class="sub">{{ row.targetType }}{{ row.targetId ? ` #${row.targetId}` : '' }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="原因" width="140">
          <template #default="{ row }">
            <span class="reason">{{ row.reason || '—' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="IP" width="100">
          <template #default="{ row }">
            <span class="mono muted">{{ maskIp(row.ip) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="requestId" width="110">
          <template #default="{ row }">
            <span class="mono muted">{{ row.requestId }}</span>
          </template>
        </el-table-column>

        <template #empty>
          <el-empty description="没有匹配的操作记录" :image-size="80" />
        </template>
      </el-table>

      <el-pagination
        v-model:current-page="page"
        v-model:page-size="size"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="load"
        @size-change="onSizeChange"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.expand {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  padding: 16px;
  background: var(--bg-hover);
}

.col-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--ink-500);
}

.code {
  margin: 0;
  padding: 12px;
  min-height: 120px;
  border: 1px solid var(--line-200);
  border-radius: 8px;
  background: var(--bg-card);
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 20px;
  color: var(--ink-700);
  white-space: pre-wrap;
  word-break: break-all;
}

.module-tag {
  display: inline-flex;
  align-items: center;
  height: 20px;
  padding: 0 6px;
  border-radius: 4px;
  background: var(--info-50);
  color: var(--info-600);
  font-family: var(--font-mono);
  font-size: 11px;
}

.mono {
  font-family: var(--font-mono);
  font-size: 12px;
}

.muted {
  color: var(--ink-500);
}

.reason {
  font-size: 13px;
  color: var(--ink-700);
}
</style>
