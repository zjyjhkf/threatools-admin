<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { Refresh, User } from '@element-plus/icons-vue'
import PageHeader from '@/components/common/PageHeader.vue'
import StatusTag from '@/components/common/StatusTag.vue'
import ReasonDialog from '@/components/common/ReasonDialog.vue'
import ImageThumb from '@/components/common/ImageThumb.vue'
import UserDetailDrawer from '@/components/users/UserDetailDrawer.vue'
import * as usersApi from '@/api/users'
import type { UserDetail, UserListItem } from '@/api/types'
import { formatDate } from '@/utils/format'
import { toast } from '@/utils/message'

const filters = reactive({
  keyword: '',
  status: '' as number | '',
  dateRange: [] as string[],
})

const list = ref<UserListItem[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(20)
const loading = ref(false)

const drawerVisible = ref(false)
const activeUserId = ref('')

const disableVisible = ref(false)
const disableTarget = ref<{ id: string; nickname: string; next: 0 | 1 } | null>(null)
const disabling = ref(false)

const genderText = (gender: string) => (gender === 'male' ? '男' : gender === 'female' ? '女' : '保密')

async function load() {
  loading.value = true
  try {
    const res = await usersApi.listUsers({
      keyword: filters.keyword || undefined,
      status: filters.status,
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
  Object.assign(filters, { keyword: '', status: '', dateRange: [] })
  page.value = 1
  load()
}

function onSizeChange(nextSize: number) {
  size.value = nextSize
  page.value = 1
  load()
}

function openDetail(row: UserListItem) {
  activeUserId.value = row.id
  drawerVisible.value = true
}

function toggleStatus(row: UserListItem) {
  disableTarget.value = { id: row.id, nickname: row.nickname, next: row.status === 1 ? 0 : 1 }
  if (row.status === 1) disableVisible.value = true
  else confirmStatus('')
}

function onDrawerToggle(detail: UserDetail) {
  drawerVisible.value = false
  toggleStatus(detail as unknown as UserListItem)
}

async function confirmStatus(reason: string) {
  if (!disableTarget.value) return
  disabling.value = true
  try {
    await usersApi.setUserStatus(disableTarget.value.id, {
      status: disableTarget.value.next,
      reason: reason || undefined,
    })
    toast(disableTarget.value.next === 0 ? '已禁用' : '已启用')
    disableVisible.value = false
    await load()
  } finally {
    disabling.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="page">
    <PageHeader title="用户管理" subtitle="查看用户资料与社区表现，处理违规账号">
      <template #actions>
        <el-button :icon="Refresh" @click="load">刷新</el-button>
      </template>
    </PageHeader>

    <div class="page-card filter-card">
      <el-form :inline="true" @submit.prevent>
        <el-form-item label="关键词">
          <el-input v-model="filters.keyword" placeholder="昵称或用户 ID" clearable style="width: 240px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="全部状态" clearable style="width: 120px">
            <el-option label="正常" :value="1" />
            <el-option label="已禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="注册日期">
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
        <span class="count">共 {{ total }} 位用户</span>
        <el-button :icon="Refresh" circle text @click="load" />
      </div>

      <el-table v-loading="loading" :data="list" row-key="id">
        <el-table-column label="用户" width="220">
          <template #default="{ row }">
            <div class="user-cell" @click="openDetail(row)">
              <ImageThumb :src="row.avatar" :width="32" :height="32" :radius="999" />
              <div class="cell-stack">
                <span class="title link" :class="{ disabled: row.status === 0 }">{{ row.nickname }}</span>
                <span class="sub">ID {{ row.id }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="性别" width="70">
          <template #default="{ row }">{{ genderText(row.gender) }}</template>
        </el-table-column>

        <el-table-column label="城市" width="120" prop="city" />

        <el-table-column label="帖子" width="70" align="right" prop="postCount" />
        <el-table-column label="获赞" width="80" align="right" prop="likeCount" />
        <el-table-column label="粉丝" width="80" align="right" prop="followerCount" />

        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <StatusTag :status="row.status === 1 ? 'normal' : 'disabled'" :label="row.status === 1 ? '正常' : '已禁用'" />
          </template>
        </el-table-column>

        <el-table-column label="注册时间" width="130">
          <template #default="{ row }">
            <span class="mono muted">{{ formatDate(row.createdAt, 'MM-DD') }}</span>
          </template>
        </el-table-column>

        <el-table-column label="最近登录" width="130">
          <template #default="{ row }">
            <span class="mono muted">{{ formatDate(row.lastLoginAt, 'MM-DD HH:mm') }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="130" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openDetail(row)">查看</el-button>
            <el-button link :type="row.status === 1 ? 'danger' : 'primary'" @click="toggleStatus(row)">
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>

        <template #empty>
          <el-empty description="没有找到用户" :image-size="80" />
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

    <UserDetailDrawer
      v-model="drawerVisible"
      :user-id="activeUserId"
      @toggle-status="onDrawerToggle"
    />

    <ReasonDialog
      v-model="disableVisible"
      title="禁用这个用户？"
      description="禁用后该用户下次请求将被登出；已发布内容不受影响。"
      :summary-title="disableTarget?.nickname"
      :summary-meta="disableTarget ? `ID ${disableTarget.id}` : ''"
      placeholder="请填写禁用原因（2–100 字）"
      :templates="['多次广告评论', '发布不实信息', '骚扰他人', '冒充身份']"
      confirm-text="禁用"
      :loading="disabling"
      @confirm="confirmStatus"
    />
  </div>
</template>

<style scoped lang="scss">
.user-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.link:hover {
  color: var(--brand-600);
}

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
