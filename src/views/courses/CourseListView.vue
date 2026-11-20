<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { Refresh, Plus, Star } from '@element-plus/icons-vue'
import PageHeader from '@/components/common/PageHeader.vue'
import ImageThumb from '@/components/common/ImageThumb.vue'
import * as coursesApi from '@/api/courses'
import type { CourseListItem } from '@/api/types'
import { formatDuration, formatCount, formatDate } from '@/utils/format'
import { useDictionaryStore } from '@/stores/dictionary'
import { toast } from '@/utils/message'

const router = useRouter()
const dict = useDictionaryStore()

const filters = reactive({
  keyword: '',
  category: '',
  difficulty: '',
  status: '' as number | '',
  isMain: '' as boolean | '',
})

const list = ref<CourseListItem[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(20)
const loading = ref(false)
const switchingId = ref('')

async function load() {
  loading.value = true
  try {
    const res = await coursesApi.listCourses({
      keyword: filters.keyword || undefined,
      category: filters.category || undefined,
      difficulty: filters.difficulty || undefined,
      status: filters.status,
      isMain: filters.isMain,
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
  Object.assign(filters, { keyword: '', category: '', difficulty: '', status: '', isMain: '' })
  page.value = 1
  load()
}

function onSizeChange(nextSize: number) {
  size.value = nextSize
  page.value = 1
  load()
}

async function beforeStatusChange(row: CourseListItem) {
  const next = row.status === 1 ? 0 : 1
  switchingId.value = row.id
  try {
    await coursesApi.setCourseStatus(row.id, { status: next })
    row.status = next
    toast(next === 1 ? '已上架' : '已下架，小程序课程详情将 404')
    return true
  } catch {
    return false
  } finally {
    switchingId.value = ''
  }
}

async function remove(row: CourseListItem) {
  if (row.status === 1) {
    toast('请先下架该课程，再执行删除', 'warning')
    return
  }
  try {
    await ElMessageBox.confirm(
      `删除后小程序端立即不可见，课程「${row.title}」将从列表移除。`,
      '删除课程',
      {
        type: 'warning',
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        confirmButtonClass: 'el-button--danger',
      },
    )
  } catch {
    return
  }
  await coursesApi.deleteCourse(row.id)
  toast('已删除')
  if (list.value.length === 1 && page.value > 1) page.value -= 1
  load()
}

const categoryLabel = (value: string) => dict.labelOf('courseCategories', value)
const difficultyLabel = (value: string) => dict.labelOf('difficulties', value)

onMounted(() => {
  dict.load()
  load()
})
</script>

<template>
  <div class="page">
    <PageHeader title="课程管理" subtitle="维护课程信息、章节与上下架">
      <template #actions>
        <el-button :icon="Refresh" @click="load">刷新</el-button>
        <el-button type="primary" :icon="Plus" @click="router.push({ name: 'course-create' })">
          新建课程
        </el-button>
      </template>
    </PageHeader>

    <div class="page-card filter-card">
      <el-form :inline="true" @submit.prevent>
        <el-form-item label="关键词">
          <el-input v-model="filters.keyword" placeholder="搜索课程标题" clearable style="width: 220px" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="filters.category" placeholder="全部分类" clearable style="width: 140px">
            <el-option v-for="item in dict.options?.courseCategories ?? []" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="难度">
          <el-select v-model="filters.difficulty" placeholder="全部难度" clearable style="width: 140px">
            <el-option v-for="item in dict.options?.difficulties ?? []" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="全部状态" clearable style="width: 120px">
            <el-option label="上架" :value="1" />
            <el-option label="下架" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="主推">
          <el-select v-model="filters.isMain" placeholder="全部" clearable style="width: 120px">
            <el-option label="主推" :value="true" />
            <el-option label="非主推" :value="false" />
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
        <span class="count">共 {{ total }} 门课程</span>
        <el-button :icon="Refresh" circle text @click="load" />
      </div>

      <el-table v-loading="loading" :data="list" row-key="id">
        <el-table-column label="封面" width="96">
          <template #default="{ row }">
            <ImageThumb :src="row.cover" variant="cover" :width="96" :height="54" icon="play" />
          </template>
        </el-table-column>

        <el-table-column label="课程" min-width="312">
          <template #default="{ row }">
            <div class="cell-stack" @click="router.push({ name: 'course-edit', params: { id: row.id } })">
              <span class="title link">{{ row.title }}</span>
              <span class="sub">{{ row.chapterCount }} 章节 · {{ formatDuration(row.duration) }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="分类" width="80">
          <template #default="{ row }">{{ categoryLabel(row.category) }}</template>
        </el-table-column>
        <el-table-column label="难度" width="70">
          <template #default="{ row }">{{ difficultyLabel(row.difficulty) }}</template>
        </el-table-column>
        <el-table-column label="时长" width="70" align="right">
          <template #default="{ row }">{{ formatDuration(row.duration) }}</template>
        </el-table-column>
        <el-table-column label="动作数" width="60" align="right" prop="actionCount" />
        <el-table-column label="学习/收藏" width="90" align="right">
          <template #default="{ row }">{{ formatCount(row.learnCount) }}/{{ formatCount(row.collectCount) }}</template>
        </el-table-column>

        <el-table-column label="主推" width="50" align="center">
          <template #default="{ row }">
            <el-icon v-if="row.isMain" :size="14" class="star"><Star /></el-icon>
            <span v-else class="muted">—</span>
          </template>
        </el-table-column>

        <el-table-column label="排序" width="50" align="right" prop="sort" />

        <el-table-column label="状态" width="70">
          <template #default="{ row }">
            <el-switch
              :model-value="row.status === 1"
              :loading="switchingId === row.id"
              :before-change="() => beforeStatusChange(row)"
              inline-prompt
              active-text="上架"
              inactive-text="下架"
            />
          </template>
        </el-table-column>

        <el-table-column label="更新时间" width="112">
          <template #default="{ row }">
            <span class="mono muted">{{ formatDate(row.updatedAt, 'MM-DD HH:mm') }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="110" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="router.push({ name: 'course-edit', params: { id: row.id } })">
              编辑
            </el-button>
            <el-tooltip
              :disabled="row.status === 0"
              content="请先下架该课程，再执行删除"
              placement="top"
            >
              <span>
                <el-button
                  link
                  :type="row.status === 0 ? 'danger' : 'info'"
                  :disabled="row.status === 1"
                  @click="remove(row)"
                >
                  删除
                </el-button>
              </span>
            </el-tooltip>
          </template>
        </el-table-column>

        <template #empty>
          <el-empty description="还没有课程" :image-size="80">
            <el-button type="primary" @click="router.push({ name: 'course-create' })">新建课程</el-button>
          </el-empty>
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
.link {
  cursor: pointer;

  &:hover {
    color: var(--brand-600);
  }
}

.star {
  color: var(--warning-600);
}

.mono {
  font-family: var(--font-mono);
  font-size: 11px;
}

.muted {
  color: var(--ink-400);
}
</style>
