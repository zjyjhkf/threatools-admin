<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { Refresh, Plus } from '@element-plus/icons-vue'
import PageHeader from '@/components/common/PageHeader.vue'
import ImageThumb from '@/components/common/ImageThumb.vue'
import * as productsApi from '@/api/products'
import type { ProductListItem } from '@/api/types'
import { formatCount, formatDate } from '@/utils/format'
import { useDictionaryStore } from '@/stores/dictionary'
import { toast } from '@/utils/message'

const router = useRouter()
const dict = useDictionaryStore()

const filters = reactive({ keyword: '', category: '', status: '' as number | '' })
const list = ref<ProductListItem[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(20)
const loading = ref(false)
const switchingId = ref('')

async function load() {
  loading.value = true
  try {
    const res = await productsApi.listProducts({
      keyword: filters.keyword || undefined,
      category: filters.category || undefined,
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
  Object.assign(filters, { keyword: '', category: '', status: '' })
  page.value = 1
  load()
}

function onSizeChange(nextSize: number) {
  size.value = nextSize
  page.value = 1
  load()
}

async function beforeStatusChange(row: ProductListItem) {
  const next = row.status === 1 ? 0 : 1
  switchingId.value = row.id
  try {
    await productsApi.setProductStatus(row.id, { status: next })
    row.status = next
    toast(next === 1 ? '已上架' : '已下架，小程序产品详情将 404')
    return true
  } catch {
    return false
  } finally {
    switchingId.value = ''
  }
}

async function remove(row: ProductListItem) {
  if (row.status === 1) {
    toast('请先下架该产品，再执行删除', 'warning')
    return
  }
  try {
    await ElMessageBox.confirm(
      `删除后小程序端立即不可见，产品「${row.name}」将从列表移除。`,
      '删除产品',
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
  await productsApi.deleteProduct(row.id)
  toast('已删除')
  if (list.value.length === 1 && page.value > 1) page.value -= 1
  load()
}

const categoryLabel = (value: string) => dict.labelOf('productCategories', value)

onMounted(() => {
  dict.load()
  load()
})
</script>

<template>
  <div class="page">
    <PageHeader title="产品管理" subtitle="维护产品信息、图集与使用视频">
      <template #actions>
        <el-button :icon="Refresh" @click="load">刷新</el-button>
        <el-button type="primary" :icon="Plus" @click="router.push({ name: 'product-create' })">
          新建产品
        </el-button>
      </template>
    </PageHeader>

    <div class="page-card filter-card">
      <el-form :inline="true" @submit.prevent>
        <el-form-item label="关键词">
          <el-input v-model="filters.keyword" placeholder="搜索产品名称或型号" clearable style="width: 240px" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="filters.category" placeholder="全部分类" clearable style="width: 140px">
            <el-option
              v-for="item in dict.options?.productCategories ?? []"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="全部状态" clearable style="width: 120px">
            <el-option label="上架" :value="1" />
            <el-option label="下架" :value="0" />
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
        <span class="count">共 {{ total }} 款产品</span>
        <el-button :icon="Refresh" circle text @click="load" />
      </div>

      <el-table v-loading="loading" :data="list" row-key="id">
        <el-table-column label="封面" width="96">
          <template #default="{ row }">
            <ImageThumb :src="row.cover" variant="dark" :width="56" :height="56" icon="box" />
          </template>
        </el-table-column>

        <el-table-column label="产品" width="224">
          <template #default="{ row }">
            <div
              class="cell-stack"
              @click="router.push({ name: 'product-edit', params: { id: row.id } })"
            >
              <span class="title link">{{ row.name }}</span>
              <span class="sub">{{ row.model }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="分类" width="90">
          <template #default="{ row }">{{ categoryLabel(row.category) }}</template>
        </el-table-column>

        <el-table-column label="卖点" width="180">
          <template #default="{ row }">
            <span class="tagline">{{ row.tagline }}</span>
          </template>
        </el-table-column>

        <el-table-column label="标签" width="100">
          <template #default="{ row }">
            <span v-if="row.tags[0]" class="tag-chip">{{ row.tags[0] }}</span>
            <span v-if="row.tags.length > 1" class="more">+{{ row.tags.length - 1 }}</span>
          </template>
        </el-table-column>

        <el-table-column label="图集" width="70" align="right" prop="imageCount" />
        <el-table-column label="收藏" width="70" align="right">
          <template #default="{ row }">{{ formatCount(row.collectCount) }}</template>
        </el-table-column>
        <el-table-column label="排序" width="60" align="right" prop="sort" />

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

        <el-table-column label="更新时间" width="100">
          <template #default="{ row }">
            <span class="mono muted">{{ formatDate(row.updatedAt, 'MM-DD HH:mm') }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="110" fixed="right">
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              @click="router.push({ name: 'product-edit', params: { id: row.id } })"
            >
              编辑
            </el-button>
            <el-tooltip
              :disabled="row.status === 0"
              content="请先下架该产品，再执行删除"
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
          <el-empty description="还没有产品" :image-size="80">
            <el-button type="primary" @click="router.push({ name: 'product-create' })">新建产品</el-button>
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

.tagline {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 13px;
  color: var(--ink-500);
}

.more {
  margin-left: 4px;
  font-size: 11px;
  color: var(--ink-400);
}

.mono {
  font-family: var(--font-mono);
  font-size: 11px;
}

.muted {
  color: var(--ink-500);
}
</style>
