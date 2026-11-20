<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import PageHeader from '@/components/common/PageHeader.vue'
import StatusTag from '@/components/common/StatusTag.vue'
import * as commentsApi from '@/api/comments'
import type { CommentListItem } from '@/api/types'
import { formatDate } from '@/utils/format'
import { toast } from '@/utils/message'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

const filters = reactive({
  keyword: '',
  status: '',
  postId: '',
  userId: '',
  dateRange: [] as string[],
})

const list = ref<CommentListItem[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(20)
const loading = ref(false)

const confirmVisible = ref(false)
const target = ref<CommentListItem | null>(null)
const deleting = ref(false)

async function load() {
  loading.value = true
  try {
    const res = await commentsApi.listComments({
      keyword: filters.keyword || undefined,
      status: filters.status || undefined,
      postId: filters.postId || undefined,
      userId: filters.userId || undefined,
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
  Object.assign(filters, { keyword: '', status: '', postId: '', userId: '', dateRange: [] })
  page.value = 1
  load()
}

function onSizeChange(nextSize: number) {
  size.value = nextSize
  page.value = 1
  load()
}

function remove(row: CommentListItem) {
  target.value = row
  confirmVisible.value = true
}

const isParentComment = computed(() => (target.value?.parentId ?? '0') === '0')

const deleteDescription = computed(() =>
  isParentComment.value
    ? '将同时删除该评论下的全部回复，帖子评论数同步减少。删除后不可恢复。'
    : '删除后小程序端立即不可见，帖子评论数同步减少。删除后不可恢复。',
)

async function confirmDelete() {
  if (!target.value) return
  deleting.value = true
  try {
    const res = await commentsApi.deleteComment(target.value.id)
    toast(`已删除，含回复共 ${res.affected} 条`)
    confirmVisible.value = false
    if (list.value.length === 1 && page.value > 1) page.value -= 1
    await load()
  } finally {
    deleting.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="page">
    <PageHeader title="评论治理" subtitle="删除违规评论，帖子评论数会同步减少">
      <template #actions>
        <el-button :icon="Refresh" @click="load">刷新</el-button>
      </template>
    </PageHeader>

    <div class="page-card filter-card">
      <el-form :inline="true" @submit.prevent>
        <el-form-item label="关键词">
          <el-input v-model="filters.keyword" placeholder="搜索评论内容" clearable style="width: 240px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="全部状态" clearable style="width: 120px">
            <el-option label="正常" value="normal" />
            <el-option label="已删除" value="deleted" />
          </el-select>
        </el-form-item>
        <el-form-item label="帖子 ID">
          <el-input v-model="filters.postId" placeholder="帖子 ID" clearable style="width: 120px" />
        </el-form-item>
        <el-form-item label="用户 ID">
          <el-input v-model="filters.userId" placeholder="用户 ID" clearable style="width: 120px" />
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
        <span class="count">共 {{ total }} 条</span>
        <el-button :icon="Refresh" circle text @click="load" />
      </div>

      <el-table v-loading="loading" :data="list" row-key="id">
        <el-table-column label="评论内容" min-width="360">
          <template #default="{ row }">
            <span class="cell-clamp-2" :class="{ disabled: row.status === 'deleted' }">{{ row.content }}</span>
          </template>
        </el-table-column>

        <el-table-column label="作者" width="130">
          <template #default="{ row }">
            <div class="cell-stack">
              <span class="title" :class="{ disabled: row.status === 'deleted' }">{{ row.user.nickname }}</span>
              <span class="sub">{{ row.user.id }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="所属帖子" width="200">
          <template #default="{ row }">
            <div class="cell-stack">
              <span class="title">{{ row.postTitle }}</span>
              <span class="sub">#{{ row.postId }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="点赞" width="70" align="right">
          <template #default="{ row }">{{ row.likeCount }}</template>
        </el-table-column>

        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <StatusTag :status="row.status === 'deleted' ? 'deleted' : 'normal'" :label="row.status === 'deleted' ? '已删除' : '正常'" />
          </template>
        </el-table-column>

        <el-table-column label="时间" width="130">
          <template #default="{ row }">
            <span class="mono muted">{{ formatDate(row.createdAt, 'MM-DD HH:mm') }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button
              link
              :type="row.status === 'deleted' ? 'info' : 'danger'"
              :disabled="row.status === 'deleted'"
              @click="remove(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>

        <template #empty>
          <el-empty description="没有匹配的评论" :image-size="80" />
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

    <ConfirmDialog
      v-model="confirmVisible"
      title="删除这条评论？"
      :description="deleteDescription"
      type="danger"
      confirm-text="删除"
      :loading="deleting"
      @confirm="confirmDelete"
    />
  </div>
</template>

<style scoped lang="scss">
.disabled {
  color: var(--ink-400);
}

.mono {
  font-family: var(--font-mono);
  font-size: 12px;
}

.muted {
  color: var(--ink-500);
}
</style>
