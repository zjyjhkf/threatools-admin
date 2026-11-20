<script setup lang="ts">
/**
 * 筛选条目管理：产品/课程的分类、难度与标签候选都在这里维护。
 * 编辑后 `/admin/meta/options` 立即生效，产品/课程表单下拉与标签联想同步更新。
 */
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessageBox } from 'element-plus'
import { Refresh, Plus } from '@element-plus/icons-vue'
import PageHeader from '@/components/common/PageHeader.vue'
import * as metaApi from '@/api/meta'
import type { MetaItem } from '@/api/types'
import { useDictionaryStore } from '@/stores/dictionary'
import { toast } from '@/utils/message'

const dict = useDictionaryStore()

const filters = reactive({ group: '', keyword: '' })
const list = ref<MetaItem[]>([])
const loading = ref(false)
const switchingId = ref('')

const groups = computed(() => dict.options?.groups ?? [])

const dialogVisible = ref(false)
const editing = ref<MetaItem | null>(null)
const saving = ref(false)
const form = reactive({ group: 'product_category', value: '', label: '', sort: 0, status: 1 as 0 | 1 })

const dialogTitle = computed(() => (editing.value ? '编辑筛选条目' : '新增筛选条目'))

async function load() {
  loading.value = true
  try {
    const res = await metaApi.listMetaItems({
      group: filters.group || undefined,
      keyword: filters.keyword || undefined,
    })
    list.value = res.list
  } finally {
    loading.value = false
  }
}

function search() {
  load()
}

function reset() {
  Object.assign(filters, { group: '', keyword: '' })
  load()
}

function refreshAll() {
  load()
  dict.load(true)
}

function openCreate() {
  editing.value = null
  Object.assign(form, {
    group: filters.group || 'product_category',
    value: '',
    label: '',
    sort: 0,
    status: 1,
  })
  dialogVisible.value = true
}

function openEdit(row: MetaItem) {
  editing.value = row
  Object.assign(form, {
    group: row.group,
    value: row.value,
    label: row.label,
    sort: row.sort,
    status: row.status,
  })
  dialogVisible.value = true
}

async function submit() {
  if (!form.value.trim()) {
    toast('请填写值', 'warning')
    return
  }
  saving.value = true
  try {
    const body = {
      group: form.group,
      value: form.value.trim(),
      label: form.label.trim(),
      sort: Number(form.sort) || 0,
    }
    if (editing.value) {
      await metaApi.updateMetaItem(editing.value.id, { ...body, status: form.status })
      toast('已保存')
    } else {
      await metaApi.createMetaItem(body)
      toast('已新增')
    }
    dialogVisible.value = false
    refreshAll()
  } finally {
    saving.value = false
  }
}

async function toggleStatus(row: MetaItem) {
  const next = row.status === 1 ? 0 : 1
  switchingId.value = row.id
  try {
    await metaApi.updateMetaItem(row.id, { status: next })
    row.status = next
    toast(next === 1 ? '已启用' : '已停用，表单下拉不再显示该条目')
    dict.load(true)
  } finally {
    switchingId.value = ''
  }
}

async function remove(row: MetaItem) {
  try {
    await ElMessageBox.confirm(
      `删除后「${row.label || row.value}」不再出现在筛选与表单下拉中。`,
      '删除筛选条目',
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
  await metaApi.deleteMetaItem(row.id)
  toast('已删除')
  refreshAll()
}

onMounted(() => {
  dict.load()
  load()
})
</script>

<template>
  <div class="page">
    <PageHeader title="筛选条目" subtitle="产品与课程的分类、难度、标签候选，改完立即生效">
      <template #actions>
        <el-button :icon="Refresh" @click="refreshAll">刷新</el-button>
        <el-button type="primary" :icon="Plus" @click="openCreate">新增条目</el-button>
      </template>
    </PageHeader>

    <div class="page-card filter-card">
      <el-form :inline="true" @submit.prevent>
        <el-form-item label="分组">
          <el-select v-model="filters.group" placeholder="全部分组" clearable style="width: 160px">
            <el-option
              v-for="item in groups"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="filters.keyword" placeholder="搜索值或显示名" clearable style="width: 220px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="search">查询</el-button>
          <el-button @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="page-card table-card">
      <div class="table-toolbar">
        <span class="count">共 {{ list.length }} 条</span>
        <el-button :icon="Refresh" circle text @click="refreshAll" />
      </div>

      <el-table v-loading="loading" :data="list" row-key="id">
        <el-table-column label="分组" width="130">
          <template #default="{ row }">
            <span class="tag-chip">{{ row.groupLabel }}</span>
          </template>
        </el-table-column>

        <el-table-column label="显示名" min-width="160">
          <template #default="{ row }">
            <span class="title">{{ row.label || row.value }}</span>
          </template>
        </el-table-column>

        <el-table-column label="值" min-width="180">
          <template #default="{ row }">
            <span class="mono">{{ row.value }}</span>
          </template>
        </el-table-column>

        <el-table-column label="排序" width="80" align="right" prop="sort" />

        <el-table-column label="状态" width="110">
          <template #default="{ row }">
            <el-switch
              :model-value="row.status === 1"
              :loading="switchingId === row.id"
              inline-prompt
              active-text="启用"
              inactive-text="停用"
              @change="toggleStatus(row)"
            />
          </template>
        </el-table-column>

        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="remove(row)">删除</el-button>
          </template>
        </el-table-column>

        <template #empty>
          <el-empty description="这个分组下还没有条目" :image-size="80">
            <el-button type="primary" @click="openCreate">新增条目</el-button>
          </el-empty>
        </template>
      </el-table>
    </div>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="480px" destroy-on-close>
      <el-form label-width="88px" @submit.prevent>
        <el-form-item label="分组" required>
          <el-select v-model="form.group" :disabled="Boolean(editing)" style="width: 100%">
            <el-option
              v-for="item in groups"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="显示名" required>
          <el-input v-model="form.label" placeholder="展示在选择器中的名称，如：运动康复" maxlength="60" />
        </el-form-item>
        <el-form-item label="值" required>
          <el-input v-model="form.value" placeholder="唯一标识，如 rehab" maxlength="40" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="0" :max="9999" controls-position="right" />
        </el-form-item>
        <el-form-item v-if="editing" label="状态">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" inline-prompt active-text="启用" inactive-text="停用" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.title {
  font-size: 14px;
  color: var(--ink-900);
}

.mono {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--ink-500);
}
</style>
