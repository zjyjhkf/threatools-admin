<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { Refresh, Plus } from '@element-plus/icons-vue'
import PageHeader from '@/components/common/PageHeader.vue'
import RoleTag from '@/components/common/RoleTag.vue'
import StatusTag from '@/components/common/StatusTag.vue'
import AdminFormDialog from '@/components/admins/AdminFormDialog.vue'
import TempPasswordDialog from '@/components/admins/TempPasswordDialog.vue'
import * as adminsApi from '@/api/admins'
import type { AdminListItem } from '@/api/types'
import { useAuthStore } from '@/stores/auth'
import { useDictionaryStore } from '@/stores/dictionary'
import { formatDate } from '@/utils/format'

const auth = useAuthStore()
const dict = useDictionaryStore()

const filters = reactive({ keyword: '', role: '', status: '' as number | '' })
const list = ref<AdminListItem[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(20)
const loading = ref(false)

const dialogVisible = ref(false)
const editing = ref<AdminListItem | null>(null)
const tempVisible = ref(false)
const tempPassword = ref('')
const tempUsername = ref('')
const resettingId = ref('')

const selfId = computed(() => auth.profile?.id ?? '')

async function load() {
  loading.value = true
  try {
    const res = await adminsApi.listAdmins({
      keyword: filters.keyword || undefined,
      role: filters.role || undefined,
      status: filters.status,
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
  Object.assign(filters, { keyword: '', role: '', status: '' })
  page.value = 1
  load()
}

function onSizeChange(nextSize: number) {
  size.value = nextSize
  page.value = 1
  load()
}

function openCreate() {
  editing.value = null
  dialogVisible.value = true
}

function openEdit(row: AdminListItem) {
  editing.value = row
  dialogVisible.value = true
}

async function resetPassword(row: AdminListItem) {
  resettingId.value = row.id
  try {
    const res = await adminsApi.resetAdminPassword(row.id)
    tempUsername.value = res.username
    tempPassword.value = res.tempPassword
    tempVisible.value = true
    load()
  } finally {
    resettingId.value = ''
  }
}

function onTempPassword(payload: { username: string; password: string }) {
  tempUsername.value = payload.username
  tempPassword.value = payload.password
  tempVisible.value = true
}

onMounted(() => {
  dict.load()
  load()
})
</script>

<template>
  <div class="page">
    <PageHeader title="管理员" subtitle="管理系统账号、角色与密码">
      <template #actions>
        <el-button :icon="Refresh" @click="load">刷新</el-button>
        <el-button v-perm="'admin:manage'" type="primary" :icon="Plus" @click="openCreate">
          新建管理员
        </el-button>
      </template>
    </PageHeader>

    <div class="page-card filter-card">
      <el-form :inline="true" @submit.prevent>
        <el-form-item label="关键词">
          <el-input v-model="filters.keyword" placeholder="用户名或昵称" clearable style="width: 240px" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="filters.role" placeholder="全部角色" clearable style="width: 140px">
            <el-option v-for="item in dict.options?.roles ?? []" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="全部状态" clearable style="width: 120px">
            <el-option label="启用" :value="1" />
            <el-option label="停用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="search">查询</el-button>
          <el-button @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="page-card table-card">
      <div class="table-toolbar">
        <span class="count">共 {{ total }} 位管理员</span>
        <el-button :icon="Refresh" circle text @click="load" />
      </div>

      <el-table v-loading="loading" :data="list" row-key="id">
        <el-table-column label="用户名" width="200">
          <template #default="{ row }">
            <div class="cell-stack">
              <span class="title mono-name">{{ row.username }}</span>
              <span class="sub">ID {{ row.id }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="昵称" width="180" prop="nickname" />

        <el-table-column label="角色" width="100">
          <template #default="{ row }"><RoleTag :role="row.role" /></template>
        </el-table-column>

        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <StatusTag :status="row.status === 1 ? 'active' : 'disabled'" :label="row.status === 1 ? '启用' : '停用'" />
          </template>
        </el-table-column>

        <el-table-column label="首登改密" width="100">
          <template #default="{ row }">
            <span :class="row.mustChangePassword ? 'warn' : 'muted'">
              {{ row.mustChangePassword ? '是' : '否' }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="最近登录" width="160">
          <template #default="{ row }">
            <span class="mono muted">{{ formatDate(row.lastLoginAt, 'MM-DD HH:mm') }}</span>
          </template>
        </el-table-column>

        <el-table-column label="创建时间" width="140">
          <template #default="{ row }">
            <span class="mono muted">{{ formatDate(row.createdAt, 'MM-DD HH:mm') }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <span v-if="row.id === selfId" class="muted">—</span>
            <template v-else>
              <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
              <el-button link type="danger" :loading="resettingId === row.id" @click="resetPassword(row)">
                重置密码
              </el-button>
            </template>
          </template>
        </el-table-column>

        <template #empty>
          <el-empty description="还没有管理员" :image-size="80" />
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

    <AdminFormDialog
      v-model="dialogVisible"
      :admin="editing"
      :self-id="selfId"
      @saved="load"
      @temp-password="onTempPassword"
    />

    <TempPasswordDialog
      v-model="tempVisible"
      :username="tempUsername"
      :password="tempPassword"
    />
  </div>
</template>

<style scoped lang="scss">
.mono-name {
  font-family: var(--font-mono);
  font-weight: 500;
}

.mono {
  font-family: var(--font-mono);
  font-size: 12px;
}

.muted {
  color: var(--ink-500);
}

.warn {
  color: var(--warning-600);
  font-size: 12px;
}
</style>
