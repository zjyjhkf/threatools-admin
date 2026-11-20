<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessageBox } from 'element-plus'
import { Refresh, Plus } from '@element-plus/icons-vue'
import PageHeader from '@/components/common/PageHeader.vue'
import StatusTag from '@/components/common/StatusTag.vue'
import TopicFormDialog from '@/components/topics/TopicFormDialog.vue'
import * as topicsApi from '@/api/topics'
import type { TopicListItem } from '@/api/types'
import { formatDate, formatCount } from '@/utils/format'
import { toast } from '@/utils/message'

const filters = reactive({ keyword: '', isHot: '' as boolean | '' })
const list = ref<TopicListItem[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(20)
const loading = ref(false)

const dialogVisible = ref(false)
const editing = ref<TopicListItem | null>(null)

async function load() {
  loading.value = true
  try {
    const res = await topicsApi.listTopics({
      keyword: filters.keyword || undefined,
      isHot: filters.isHot,
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
  Object.assign(filters, { keyword: '', isHot: '' })
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

function openEdit(row: TopicListItem) {
  editing.value = row
  dialogVisible.value = true
}

async function remove(row: TopicListItem) {
  if (row.postCount > 0) {
    toast(`话题下仍有 ${row.postCount} 条帖子，不能删除`, 'warning')
    return
  }
  try {
    await ElMessageBox.confirm(`删除后小程序端不可见，确定删除话题「${row.name}」？`, '删除话题', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    })
  } catch {
    return
  }
  await topicsApi.deleteTopic(row.id)
  toast('已删除')
  load()
}

onMounted(load)
</script>

<template>
  <div class="page">
    <PageHeader title="话题管理" subtitle="维护话题名称、描述、热门与排序">
      <template #actions>
        <el-button :icon="Refresh" @click="load">刷新</el-button>
        <el-button type="primary" :icon="Plus" @click="openCreate">新建话题</el-button>
      </template>
    </PageHeader>

    <div class="page-card filter-card">
      <el-form :inline="true" @submit.prevent>
        <el-form-item label="关键词">
          <el-input v-model="filters.keyword" placeholder="搜索话题名称" clearable style="width: 240px" />
        </el-form-item>
        <el-form-item label="是否热门">
          <el-select v-model="filters.isHot" placeholder="全部" clearable style="width: 120px">
            <el-option label="热门" :value="true" />
            <el-option label="普通" :value="false" />
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
        <span class="count">共 {{ total }} 个话题</span>
        <el-button :icon="Refresh" circle text @click="load" />
      </div>

      <el-table v-loading="loading" :data="list" row-key="id">
        <el-table-column label="话题" width="220">
          <template #default="{ row }">
            <div class="cell-stack">
              <span class="title"><b class="hash">#</b>{{ row.name }}</span>
              <span class="sub">ID {{ row.id }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="描述" min-width="320">
          <template #default="{ row }">
            <span class="desc">{{ row.description }}</span>
          </template>
        </el-table-column>

        <el-table-column label="帖子数" width="90" align="right">
          <template #default="{ row }">{{ formatCount(row.postCount) }}</template>
        </el-table-column>

        <el-table-column label="参与人数" width="100" align="right">
          <template #default="{ row }">{{ formatCount(row.userCount) }}</template>
        </el-table-column>

        <el-table-column label="热门" width="80">
          <template #default="{ row }">
            <StatusTag :status="row.isHot ? 'hot' : 'cool'" />
          </template>
        </el-table-column>

        <el-table-column label="排序" width="70" align="right" prop="sort" />

        <el-table-column label="更新时间" width="140">
          <template #default="{ row }">
            <span class="mono muted">{{ formatDate(row.updatedAt, 'MM-DD HH:mm') }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
            <el-tooltip
              :disabled="row.postCount === 0"
              :content="`话题下仍有 ${row.postCount} 条帖子，不能删除`"
              placement="top"
            >
              <span>
                <el-button
                  link
                  :type="row.postCount === 0 ? 'danger' : 'info'"
                  :disabled="row.postCount > 0"
                  @click="remove(row)"
                >
                  删除
                </el-button>
              </span>
            </el-tooltip>
          </template>
        </el-table-column>

        <template #empty>
          <el-empty description="还没有话题" :image-size="80" />
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

    <TopicFormDialog v-model="dialogVisible" :topic="editing" @saved="load" />
  </div>
</template>

<style scoped lang="scss">
.hash {
  color: var(--brand-600);
  margin-right: 2px;
}

.desc {
  font-size: 13px;
  color: var(--ink-500);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.mono {
  font-family: var(--font-mono);
  font-size: 12px;
}

.muted {
  color: var(--ink-500);
}
</style>
