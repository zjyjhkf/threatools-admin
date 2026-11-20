<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessageBox } from 'element-plus'
import PageHeader from '@/components/common/PageHeader.vue'
import ImageUploader from '@/components/common/ImageUploader.vue'
import TagSelect from '@/components/common/TagSelect.vue'
import ChapterEditor from '@/components/courses/ChapterEditor.vue'
import * as coursesApi from '@/api/courses'
import type { ChapterInput, CourseDetail, CourseListItem } from '@/api/types'
import { useDictionaryStore } from '@/stores/dictionary'
import { useUnsavedGuard } from '@/composables/useUnsavedGuard'
import { toast } from '@/utils/message'

const route = useRoute()
const router = useRouter()
const dict = useDictionaryStore()

const courseId = computed(() => String(route.params.id ?? ''))
const isCreate = computed(() => route.name === 'course-create')

const formRef = ref<FormInstance>()
const loading = ref(false)
const saving = ref(false)
const dirty = ref(false)
const notFound = ref(false)

const allCourses = ref<CourseListItem[]>([])

const form = reactive({
  title: '',
  cover: '',
  videoCover: '',
  category: 'rehab',
  difficulty: 'beginner',
  tags: [] as string[],
  coachName: '',
  coachAvatar: '',
  coachTitle: '',
  intro: '',
  suitableFor: [] as string[],
  relatedIds: [] as string[],
  isMain: false,
  sort: 100,
  chapters: [] as ChapterInput[],
})

const rules: FormRules = {
  title: [
    { required: true, message: '请输入课程标题', trigger: 'blur' },
    { min: 2, max: 30, message: '2–30 字', trigger: 'blur' },
  ],
  cover: [{ required: true, message: '请上传课程封面', trigger: 'change' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  difficulty: [{ required: true, message: '请选择难度', trigger: 'change' }],
}

useUnsavedGuard(dirty)

async function load() {
  if (isCreate.value) {
    dirty.value = false
    return
  }
  loading.value = true
  try {
    const detail: CourseDetail = await coursesApi.getCourse(courseId.value)
    Object.assign(form, {
      title: detail.title,
      cover: detail.cover,
      videoCover: detail.videoCover,
      category: detail.category,
      difficulty: detail.difficulty,
      tags: detail.tags ?? [],
      coachName: detail.coach?.name ?? '',
      coachAvatar: detail.coach?.avatar ?? '',
      coachTitle: detail.coach?.title ?? '',
      intro: detail.intro,
      suitableFor: detail.suitableFor ?? [],
      relatedIds: detail.relatedIds ?? [],
      isMain: detail.isMain,
      sort: detail.sort,
      chapters: detail.chapters.map((c) => ({
        title: c.title,
        duration: c.duration,
        videoUrl: c.videoUrl,
        locked: c.locked,
      })),
    })
    dirty.value = false
  } catch {
    notFound.value = true
  } finally {
    loading.value = false
  }
}

async function loadCourses() {
  const res = await coursesApi.listCourses({ size: 100, page: 1 }).catch(() => null)
  allCourses.value = (res?.list ?? []).filter((item) => item.id !== courseId.value)
}

function onDirty() {
  dirty.value = true
}

async function save() {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) {
    toast('请先完善必填项', 'warning')
    return
  }
  if (form.chapters.some((c) => !c.title.trim())) {
    toast('章节标题不能为空', 'warning')
    return
  }

  saving.value = true
  try {
    if (isCreate.value) {
      const res = await coursesApi.createCourse({
        title: form.title,
        cover: form.cover,
        videoCover: form.videoCover,
        category: form.category as never,
        difficulty: form.difficulty as never,
        tags: form.tags,
        coachName: form.coachName,
        coachAvatar: form.coachAvatar,
        coachTitle: form.coachTitle,
        intro: form.intro,
        suitableFor: form.suitableFor,
        relatedIds: form.relatedIds,
        isMain: form.isMain,
        sort: form.sort,
        chapters: form.chapters,
      })
      toast('课程已创建')
      dirty.value = false
      router.replace({ name: 'course-edit', params: { id: res.course.id } })
    } else {
      await coursesApi.updateCourse(courseId.value, {
        title: form.title,
        cover: form.cover,
        videoCover: form.videoCover,
        category: form.category as never,
        difficulty: form.difficulty as never,
        tags: form.tags,
        coachName: form.coachName,
        coachAvatar: form.coachAvatar,
        coachTitle: form.coachTitle,
        intro: form.intro,
        suitableFor: form.suitableFor,
        relatedIds: form.relatedIds,
        isMain: form.isMain,
        sort: form.sort,
      })
      await coursesApi.replaceChapters(courseId.value, form.chapters)
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
  router.push({ name: 'courses' })
}

onMounted(() => {
  dict.load()
  loadCourses()
  load()
})
</script>

<template>
  <div v-loading="loading" class="page edit-page">
    <PageHeader
      title="编辑课程"
      :subtitle="form.title || '新建课程'"
      back
      @back="cancel"
    >
      <template #actions>
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" :loading="saving" @click="save">保存</el-button>
      </template>
    </PageHeader>

    <el-result
      v-if="notFound"
      icon="warning"
      title="课程不存在"
      sub-title="该课程可能已被删除"
    >
      <template #extra>
        <el-button type="primary" @click="router.push({ name: 'courses' })">返回列表</el-button>
      </template>
    </el-result>

    <template v-else>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="96px"
        label-position="right"
        @change="onDirty"
      >
        <section class="page-card section">
          <h3 class="section-title">
            基本信息
            <span class="hint">课程在小程序端展示</span>
          </h3>

          <el-row :gutter="24">
            <el-col :span="10">
              <el-form-item label="课程标题" prop="title">
                <el-input v-model="form.title" placeholder="2–30 字" maxlength="30" show-word-limit />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="分类" prop="category">
                <el-select v-model="form.category" filterable style="width: 100%">
                  <el-option
                    v-for="item in dict.options?.courseCategories ?? []"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="5">
              <el-form-item label="难度" prop="difficulty">
                <el-select v-model="form.difficulty" filterable style="width: 100%">
                  <el-option
                    v-for="item in dict.options?.difficulties ?? []"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :span="9">
              <el-form-item label="封面" prop="cover">
                <ImageUploader v-model="form.cover" :width="240" :height="135" hint="建议 16:9，≤5MB" />
              </el-form-item>
            </el-col>
            <el-col :span="9">
              <el-form-item label="详情大图">
                <ImageUploader v-model="form.videoCover" :width="240" :height="135" hint="可选，建议 16:9" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="主推">
                <el-switch v-model="form.isMain" />
              </el-form-item>
              <el-form-item label="排序">
                <el-input-number v-model="form.sort" :min="0" :max="999" controls-position="right" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="标签">
            <TagSelect
              v-model="form.tags"
              group="course_tag"
              :max="5"
              placeholder="输入关键词联想，回车可新增，最多 5 个"
            />
            <span class="form-hint">标签会作为小程序筛选与联想词，候选可在「筛选条目」中维护</span>
          </el-form-item>

          <el-form-item label="课程介绍">
            <el-input
              v-model="form.intro"
              type="textarea"
              :rows="4"
              maxlength="2000"
              show-word-limit
              placeholder="≤2000 字，纯文本"
            />
          </el-form-item>

          <el-form-item label="适合人群">
            <el-select
              v-model="form.suitableFor"
              multiple
              filterable
              allow-create
              default-first-option
              :multiple-limit="3"
              placeholder="输入后回车，最多 3 个"
              style="width: 100%"
            />
          </el-form-item>
        </section>

        <section class="page-card section">
          <h3 class="section-title">教练<span class="hint">展示在小程序课程详情</span></h3>
          <div class="coach-row">
            <ImageUploader v-model="form.coachAvatar" :width="64" :height="64" hint="" />
            <el-form-item label="教练姓名" label-width="80px">
              <el-input v-model="form.coachName" placeholder="教练姓名" style="width: 240px" />
            </el-form-item>
            <el-form-item label="教练头衔" label-width="80px">
              <el-input v-model="form.coachTitle" placeholder="康复训练师 · 认证" style="width: 360px" />
            </el-form-item>
          </div>
        </section>

        <section class="page-card section">
          <h3 class="section-title">相关课程<span class="hint">最多 3 门，不包含当前课程</span></h3>
          <el-select
            v-model="form.relatedIds"
            multiple
            filterable
            :multiple-limit="3"
            placeholder="选择相关课程"
            style="width: 100%"
          >
            <el-option v-for="item in allCourses" :key="item.id" :label="item.title" :value="item.id" />
          </el-select>
        </section>

        <section class="page-card section">
          <h3 class="section-title">章节<span class="hint">共 {{ form.chapters.length }} 节</span></h3>
          <ChapterEditor v-model="form.chapters" @update:model-value="onDirty" />
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
.form-hint {
  margin-left: 12px;
  font-size: 12px;
  color: var(--ink-500);
  line-height: 18px;
}

.coach-row {
  display: flex;
  align-items: flex-start;
  gap: 24px;
  flex-wrap: wrap;

  :deep(.el-form-item) {
    margin-bottom: 0;
  }
}
</style>
