<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessageBox } from 'element-plus'
import PageHeader from '@/components/common/PageHeader.vue'
import ImageUploader from '@/components/common/ImageUploader.vue'
import GalleryUploader from '@/components/common/GalleryUploader.vue'
import TagSelect from '@/components/common/TagSelect.vue'
import FeatureEditor from '@/components/products/FeatureEditor.vue'
import SpecEditor from '@/components/products/SpecEditor.vue'
import * as productsApi from '@/api/products'
import type { Feature, ProductListItem, Spec } from '@/api/types'
import { useDictionaryStore } from '@/stores/dictionary'
import { useUnsavedGuard } from '@/composables/useUnsavedGuard'
import { toast } from '@/utils/message'

const route = useRoute()
const router = useRouter()
const dict = useDictionaryStore()

const productId = computed(() => String(route.params.id ?? ''))
const isCreate = computed(() => route.name === 'product-create')

const formRef = ref<FormInstance>()
const loading = ref(false)
const saving = ref(false)
const dirty = ref(false)
const notFound = ref(false)
const allProducts = ref<ProductListItem[]>([])

const form = reactive({
  name: '',
  model: '',
  category: 'rehab',
  tagline: '',
  tags: [] as string[],
  sort: 100,
  images: [] as string[],
  features: [] as Feature[],
  specs: [] as Spec[],
  videoCover: '',
  videoUrl: '',
  videoDuration: 0,
  suitableFor: [] as string[],
  relatedIds: [] as string[],
})

const rules: FormRules = {
  name: [
    { required: true, message: '请输入产品名称', trigger: 'blur' },
    { min: 2, max: 40, message: '2–40 字', trigger: 'blur' },
  ],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  images: [
    {
      validator: (_r, value: string[], cb) => {
        if (!value || value.length < 1) cb(new Error('请至少上传 1 张图片'))
        else cb()
      },
      trigger: 'change',
    },
  ],
}

useUnsavedGuard(dirty)

async function load() {
  if (isCreate.value) return
  loading.value = true
  try {
    const detail = await productsApi.getProduct(productId.value)
    Object.assign(form, {
      name: detail.name,
      model: detail.model,
      category: detail.category,
      tagline: detail.tagline,
      tags: detail.tags ?? [],
      sort: detail.sort,
      images: detail.images ?? [],
      features: detail.features ?? [],
      specs: detail.specs ?? [],
      videoCover: detail.video?.cover ?? '',
      videoUrl: detail.video?.url ?? '',
      videoDuration: detail.video?.duration ?? 0,
      suitableFor: detail.suitableFor ?? [],
      relatedIds: detail.relatedIds ?? [],
    })
    dirty.value = false
  } catch {
    notFound.value = true
  } finally {
    loading.value = false
  }
}

async function loadProducts() {
  const res = await productsApi.listProducts({ size: 100, page: 1 }).catch(() => null)
  allProducts.value = (res?.list ?? []).filter((item) => item.id !== productId.value)
}

const onDirty = () => {
  dirty.value = true
}

async function save() {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  saving.value = true
  try {
    if (isCreate.value) {
      const res = await productsApi.createProduct({
        name: form.name,
        model: form.model,
        category: form.category as never,
        tagline: form.tagline,
        tags: form.tags,
        images: form.images,
        features: form.features,
        specs: form.specs,
        suitableFor: form.suitableFor,
        videoCover: form.videoCover,
        videoUrl: form.videoUrl,
        videoDuration: form.videoDuration,
        relatedIds: form.relatedIds,
        sort: form.sort,
      })
      toast('产品已创建')
      dirty.value = false
      router.replace({ name: 'product-edit', params: { id: res.product.id } })
    } else {
      await productsApi.updateProduct(productId.value, {
        name: form.name,
        model: form.model,
        category: form.category as never,
        tagline: form.tagline,
        tags: form.tags,
        features: form.features,
        specs: form.specs,
        suitableFor: form.suitableFor,
        videoCover: form.videoCover,
        videoUrl: form.videoUrl,
        videoDuration: form.videoDuration,
        relatedIds: form.relatedIds,
        sort: form.sort,
      })
      await productsApi.replaceProductImages(productId.value, form.images)
      toast('已保存')
      dirty.value = false
    }
  } finally {
    saving.value = false
  }
}

async function cancel() {
  if (dirty.value) {
    try {
      await ElMessageBox.confirm('有未保存的修改，确定离开？', '提示', {
        type: 'warning',
        confirmButtonText: '离开',
        cancelButtonText: '继续编辑',
      })
    } catch {
      return
    }
  }
  router.push({ name: 'products' })
}

onMounted(() => {
  dict.load()
  loadProducts()
  load()
})
</script>

<template>
  <div v-loading="loading" class="page edit-page">
    <PageHeader title="编辑产品" :subtitle="form.name || '新建产品'" back @back="cancel">
      <template #actions>
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" :loading="saving" @click="save">保存</el-button>
      </template>
    </PageHeader>

    <el-result v-if="notFound" icon="warning" title="产品不存在" sub-title="该产品可能已被删除">
      <template #extra>
        <el-button type="primary" @click="router.push({ name: 'products' })">返回列表</el-button>
      </template>
    </el-result>

    <template v-else>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="96px" @change="onDirty">
        <section class="page-card section">
          <h3 class="section-title">基本信息<span class="hint">产品在小程序端展示</span></h3>

          <el-row :gutter="24">
            <el-col :span="10">
              <el-form-item label="产品名称" prop="name">
                <el-input v-model="form.name" placeholder="2–40 字" maxlength="40" show-word-limit />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="型号">
                <el-input v-model="form.model" placeholder="≤20 字" maxlength="20" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="分类" prop="category">
                <el-select v-model="form.category" filterable style="width: 100%">
                  <el-option
                    v-for="item in dict.options?.productCategories ?? []"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :span="14">
              <el-form-item label="一句话卖点">
                <el-input v-model="form.tagline" placeholder="≤60 字" maxlength="60" show-word-limit />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="排序">
                <el-input-number v-model="form.sort" :min="0" :max="999" controls-position="right" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="标签">
            <TagSelect
              v-model="form.tags"
              group="product_tag"
              :max="5"
              placeholder="输入关键词联想，回车可新增，最多 5 个"
            />
            <span class="form-hint">标签会作为小程序筛选与联想词，候选可在「筛选条目」中维护</span>
          </el-form-item>
        </section>

        <section class="page-card section">
          <h3 class="section-title">
            图集
            <span class="hint">1–4 张，第 1 张为封面；建议 1:1，≤5MB</span>
          </h3>
          <el-form-item prop="images" label-width="0" class="gallery-item">
            <GalleryUploader v-model="form.images" :max="4" :size="120" />
          </el-form-item>
        </section>

        <section class="page-card section">
          <h3 class="section-title">卖点<span class="hint">最多 3 条</span></h3>
          <FeatureEditor v-model="form.features" :max="3" />
        </section>

        <section class="page-card section">
          <h3 class="section-title">参数<span class="hint">1–12 条，展示在小程序产品详情</span></h3>
          <SpecEditor v-model="form.specs" :max="12" />
        </section>

        <section class="page-card section">
          <h3 class="section-title">视频与适合人群<span class="hint">视频由 CDN 提供，≤7200 秒</span></h3>
          <el-row :gutter="24">
            <el-col :span="7">
              <el-form-item label="视频封面">
                <ImageUploader v-model="form.videoCover" :width="240" :height="135" hint="建议 16:9" />
              </el-form-item>
            </el-col>
            <el-col :span="10">
              <el-form-item label="视频 URL">
                <el-input v-model="form.videoUrl" placeholder="https://" />
              </el-form-item>
              <el-form-item label="时长（秒）">
                <el-input-number v-model="form.videoDuration" :min="0" :max="7200" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="适合人群">
            <el-select
              v-model="form.suitableFor"
              multiple
              filterable
              allow-create
              default-first-option
              :multiple-limit="3"
              placeholder="最多 3 个"
              style="width: 100%"
            />
          </el-form-item>
        </section>

        <section class="page-card section">
          <h3 class="section-title">相关产品<span class="hint">最多 3 款，不包含当前产品</span></h3>
          <el-select v-model="form.relatedIds" multiple filterable :multiple-limit="3" placeholder="选择相关产品" style="width: 100%">
            <el-option v-for="item in allProducts" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </section>
      </el-form>

      <div class="edit-footer">
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" :loading="saving" @click="save">保存</el-button>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.gallery-item {
  margin-bottom: 0;
}

.form-hint {
  margin-left: 12px;
  font-size: 12px;
  color: var(--ink-500);
  line-height: 18px;
}
</style>
