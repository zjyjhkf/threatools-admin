<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessageBox } from 'element-plus'
import { Refresh, Picture, Warning } from '@element-plus/icons-vue'
import PageHeader from '@/components/common/PageHeader.vue'
import StatusTag from '@/components/common/StatusTag.vue'
import ImageThumb from '@/components/common/ImageThumb.vue'
import ReasonDialog from '@/components/common/ReasonDialog.vue'
import PostDetailDrawer from '@/components/posts/PostDetailDrawer.vue'
import PostEditDialog from '@/components/posts/PostEditDialog.vue'
import * as postsApi from '@/api/posts'
import type { PostDetail, PostListItem, ReviewAction } from '@/api/types'
import { formatDate } from '@/utils/format'
import { toast } from '@/utils/message'

type TabKey = 'pending' | 'approved' | 'rejected' | 'all'

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: 'pending', label: '待审核' },
  { key: 'approved', label: '已通过' },
  { key: 'rejected', label: '已驳回' },
  { key: 'all', label: '全部' },
]

const activeTab = ref<TabKey>('pending')
const counts = reactive<Record<TabKey, number>>({ pending: 0, approved: 0, rejected: 0, all: 0 })

const filters = reactive({
  keyword: '',
  status: '',
  authorId: '',
  topicId: '',
  dateRange: [] as string[],
})

const list = ref<PostListItem[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(20)
const loading = ref(false)
const reviewingId = ref('')

const drawerVisible = ref(false)
const activePostId = ref('')

const rejectVisible = ref(false)
const rejectTarget = ref<PostListItem | null>(null)
const rejecting = ref(false)

const query = computed(() => ({
  reviewStatus: activeTab.value === 'all' ? undefined : activeTab.value,
  keyword: filters.keyword || undefined,
  status: filters.status || undefined,
  authorId: filters.authorId || undefined,
  topicId: filters.topicId || undefined,
  startDate: filters.dateRange?.[0] || undefined,
  endDate: filters.dateRange?.[1] || undefined,
  page: page.value,
  size: size.value,
}))

async function load() {
  loading.value = true
  try {
    const res = await postsApi.listPosts(query.value)
    list.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

async function loadCounts() {
  try {
    const results = await Promise.all([
      postsApi.listPosts({ reviewStatus: 'pending', size: 1, page: 1 }),
      postsApi.listPosts({ reviewStatus: 'approved', size: 1, page: 1 }),
      postsApi.listPosts({ reviewStatus: 'rejected', size: 1, page: 1 }),
      postsApi.listPosts({ size: 1, page: 1 }),
    ])
    counts.pending = results[0].total
    counts.approved = results[1].total
    counts.rejected = results[2].total
    counts.all = results[3].total
  } catch {
    /* 计数失败不影响列表 */
  }
}

function switchTab(key: TabKey) {
  if (activeTab.value === key) return
  activeTab.value = key
  page.value = 1
  load()
}

function onSizeChange(nextSize: number) {
  size.value = nextSize
  page.value = 1
  load()
}

function search() {
  page.value = 1
  load()
}

function reset() {
  Object.assign(filters, { keyword: '', status: '', authorId: '', topicId: '', dateRange: [] })
  page.value = 1
  load()
}

async function review(row: PostListItem, action: ReviewAction) {
  if (action === 'reject') {
    rejectTarget.value = row
    rejectVisible.value = true
    return
  }
  reviewingId.value = row.id
  try {
    await postsApi.reviewPost(row.id, { action })
    toast(action === 'approve' ? '已通过' : '已恢复')
    await Promise.all([load(), loadCounts()])
  } finally {
    reviewingId.value = ''
  }
}

async function confirmReject(reason: string) {
  if (!rejectTarget.value) return
  rejecting.value = true
  try {
    await postsApi.reviewPost(rejectTarget.value.id, { action: 'reject', reason })
    toast('已驳回')
    rejectVisible.value = false
    await Promise.all([load(), loadCounts()])
  } finally {
    rejecting.value = false
  }
}

async function remove(row: PostListItem) {
  try {
    await ElMessageBox.confirm(
      `删除后小程序端不可见，帖子「${row.title}」及其评论将一并处理，可在审计日志中追溯。`,
      '删除帖子',
      { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消', confirmButtonClass: 'el-button--danger' },
    )
  } catch {
    return
  }
  await postsApi.deletePost(row.id)
  toast('已删除')
  await Promise.all([load(), loadCounts()])
}

async function removeFromDrawer(post: PostDetail) {
  try {
    await ElMessageBox.confirm('删除后小程序端不可见，可在审计日志中追溯。', '删除帖子', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    })
  } catch {
    return
  }
  await postsApi.deletePost(post.id)
  toast('已删除')
  drawerVisible.value = false
  await Promise.all([load(), loadCounts()])
}

function openDetail(row: PostListItem) {
  activePostId.value = row.id
  drawerVisible.value = true
}

const editVisible = ref(false)
const editPost = ref<PostDetail | null>(null)

async function openEdit(row: PostListItem) {
  try {
    editPost.value = await postsApi.getPost(row.id)
    editVisible.value = true
  } catch {
    /* 详情加载失败已由请求拦截器提示 */
  }
}

function onDrawerEdit(post: PostDetail) {
  drawerVisible.value = false
  editPost.value = post
  editVisible.value = true
}

function onSaved() {
  load()
  loadCounts()
}

function onDrawerReview(action: 'approve' | 'reject' | 'restore') {
  const row = list.value.find((item) => item.id === activePostId.value)
  if (!row) return
  drawerVisible.value = false
  review(row, action)
}

onMounted(() => {
  load()
  loadCounts()
})
</script>

<template>
  <div class="page">
    <PageHeader title="帖子审核" subtitle="先发后审，优先处理待审核内容">
      <template #actions>
        <el-button link type="primary">审核规则</el-button>
        <el-button :icon="Refresh" @click="load">刷新</el-button>
      </template>
    </PageHeader>

    <div class="tabs-row">
      <div class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          class="tab"
          :class="{ active: activeTab === tab.key }"
          @click="switchTab(tab.key)"
        >
          {{ tab.label }}
          <span class="count">{{ counts[tab.key] }}</span>
        </button>
      </div>
      <span class="sort-hint">按最新提交排序</span>
    </div>

    <div class="page-card filter-card">
      <el-form :inline="true" @submit.prevent>
        <el-form-item label="关键词">
          <el-input v-model="filters.keyword" placeholder="搜索标题或正文" clearable style="width: 240px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="全部状态" clearable style="width: 120px">
            <el-option label="已发布" value="published" />
            <el-option label="已隐藏" value="hidden" />
          </el-select>
        </el-form-item>
        <el-form-item label="作者 ID">
          <el-input v-model="filters.authorId" placeholder="用户 ID" clearable style="width: 120px" />
        </el-form-item>
        <el-form-item label="话题">
          <el-input v-model="filters.topicId" placeholder="全部话题" clearable style="width: 140px" />
        </el-form-item>
        <el-form-item label="发布时间">
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
        <span class="count">共 {{ total }} 条 · 待审核 {{ counts.pending }} 条</span>
        <el-button :icon="Refresh" circle text @click="load" />
      </div>

      <el-table v-loading="loading" :data="list" row-key="id">
        <el-table-column label="封面" width="56">
          <template #default="{ row }">
            <ImageThumb :src="row.cover" :width="40" :height="40" />
          </template>
        </el-table-column>

        <el-table-column label="标题" width="300">
          <template #default="{ row }">
            <div class="cell-stack" @click="openDetail(row)">
              <span class="title link">{{ row.title }}</span>
              <span class="sub">{{ row.contentExcerpt }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="作者" width="130">
          <template #default="{ row }">
            <div class="cell-stack">
              <span class="title">{{ row.author.nickname }}</span>
              <span class="sub">{{ row.author.id }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="话题" width="130">
          <template #default="{ row }">
            <span v-if="row.topics[0]" class="tag-chip">#{{ row.topics[0].name }}</span>
            <span v-else class="muted">—</span>
          </template>
        </el-table-column>

        <el-table-column label="互动" width="100">
          <template #default="{ row }">
            <span class="metric-inline">{{ row.likeCount }} / {{ row.commentCount }}</span>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <StatusTag :status="row.reviewStatus" />
          </template>
        </el-table-column>

        <el-table-column label="时间" width="130">
          <template #default="{ row }">
            <span class="mono muted">{{ formatDate(row.createdAt, 'MM-DD HH:mm') }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <div class="actions">
              <el-button link type="primary" @click="openDetail(row)">查看</el-button>
              <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
              <template v-if="row.reviewStatus === 'pending'">
                <el-button link type="primary" :loading="reviewingId === row.id" @click="review(row, 'approve')">
                  通过
                </el-button>
                <el-button link type="danger" @click="review(row, 'reject')">驳回</el-button>
              </template>
              <template v-else-if="row.reviewStatus === 'rejected'">
                <el-button link type="primary" :loading="reviewingId === row.id" @click="review(row, 'restore')">
                  恢复
                </el-button>
                <el-button link type="danger" @click="remove(row)">删除</el-button>
              </template>
              <template v-else>
                <el-button link type="danger" @click="remove(row)">删除</el-button>
              </template>
            </div>
          </template>
        </el-table-column>

        <template #empty>
          <div class="state-block">
            <el-icon :size="40" class="empty-icon"><Warning /></el-icon>
            <strong>太棒了，没有待审核内容</strong>
            <span class="muted">可以切换到「全部」查看历史帖子</span>
          </div>
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

    <PostDetailDrawer
      v-model="drawerVisible"
      :post-id="activePostId"
      @review="onDrawerReview"
      @remove="removeFromDrawer"
      @edit="onDrawerEdit"
    />

    <PostEditDialog v-model="editVisible" :post="editPost" @saved="onSaved" />

    <ReasonDialog
      v-model="rejectVisible"
      title="驳回这条帖子？"
      description="驳回后小程序端将不可见，可在审核记录中恢复。"
      :summary-title="rejectTarget?.title"
      :summary-meta="rejectTarget ? `${rejectTarget.author.nickname} · ${formatDate(rejectTarget.createdAt)}` : ''"
      :templates="['营销导流', '主题无关', '低质重复', '不实信息', '侵权']"
      confirm-text="确认驳回"
      :loading="rejecting"
      @confirm="confirmReject"
    />
  </div>
</template>

<style scoped lang="scss">
.tabs-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
}

.tabs {
  display: flex;
  gap: 32px;
  height: 100%;
}

.tab {
  position: relative;
  height: 100%;
  padding: 0 0 12px;
  border: none;
  background: transparent;
  font-size: 14px;
  font-weight: 500;
  color: var(--ink-500);
  cursor: pointer;
  display: inline-flex;
  align-items: flex-end;
  gap: 4px;

  .count {
    font-size: 12px;
    color: var(--ink-400);
    font-variant-numeric: tabular-nums;
  }

  &::after {
    content: '';
    position: absolute;
    left: 50%;
    bottom: 0;
    width: 0;
    height: 3px;
    border-radius: 2px;
    background: var(--brand-600);
    transform: translateX(-50%);
    transition: width 0.15s;
  }

  &.active {
    color: var(--brand-600);
    font-weight: 600;

    .count {
      color: var(--brand-600);
    }

    &::after {
      width: 40px;
    }
  }
}

.sort-hint {
  font-size: 13px;
  color: var(--ink-500);
}

.link {
  cursor: pointer;

  &:hover {
    color: var(--brand-600);
  }
}

.muted {
  color: var(--ink-400);
  font-size: 12px;
}

.mono {
  font-family: var(--font-mono);
  font-size: 12px;
}

.actions {
  display: flex;
  gap: 12px;
}

.empty-icon {
  color: var(--brand-600);
}
</style>
