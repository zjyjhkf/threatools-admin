<script setup lang="ts">
/**
 * 管理端直接编辑作品：标题、正文、封面、图片、话题、可见范围。
 * 保存后小程序端立即读到新内容；话题作品数由后端实时重算。
 */
import { reactive, ref, watch } from 'vue'
import * as postsApi from '@/api/posts'
import * as topicsApi from '@/api/topics'
import type { PostDetail, PostListItem, TopicListItem } from '@/api/types'
import { toast } from '@/utils/message'

const props = defineProps<{ modelValue: boolean; post: PostDetail | null }>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'saved', post: PostListItem): void
}>()

const saving = ref(false)
const topics = ref<TopicListItem[]>([])

const form = reactive({
  title: '',
  content: '',
  cover: '',
  visibility: 'public' as 'public' | 'followers',
  topicIds: [] as string[],
  imagesText: '',
})

async function loadTopics() {
  const res = await topicsApi.listTopics({ page: 1, size: 100 }).catch(() => null)
  topics.value = res?.list ?? []
}

watch(
  () => [props.modelValue, props.post] as const,
  ([visible]) => {
    if (!visible || !props.post) return
    Object.assign(form, {
      title: props.post.title,
      content: props.post.content,
      cover: props.post.cover ?? '',
      visibility: props.post.visibility === 'followers' ? 'followers' : 'public',
      topicIds: props.post.topics.map((item) => item.id),
      imagesText: props.post.images.map((item) => item.url).filter(Boolean).join('\n'),
    })
    loadTopics()
  },
  { immediate: true },
)

function close() {
  emit('update:modelValue', false)
}

async function submit() {
  if (!props.post) return
  if (!form.title.trim()) {
    toast('标题不能为空', 'warning')
    return
  }
  const images = form.imagesText
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 9)
    .map((url) => ({ url, width: 0, height: 0 }))

  saving.value = true
  try {
    const res = await postsApi.updatePost(props.post.id, {
      title: form.title.trim(),
      content: form.content,
      cover: form.cover.trim(),
      visibility: form.visibility,
      topicIds: form.topicIds,
      images,
    })
    toast('已保存，小程序端立即生效')
    emit('saved', res.post)
    close()
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    title="编辑作品"
    width="640px"
    destroy-on-close
    @update:model-value="emit('update:modelValue', $event)"
  >
    <el-form label-width="88px" @submit.prevent>
      <el-form-item label="标题" required>
        <el-input v-model="form.title" maxlength="60" show-word-limit />
      </el-form-item>
      <el-form-item label="正文">
        <el-input v-model="form.content" type="textarea" :rows="6" maxlength="2000" show-word-limit />
      </el-form-item>
      <el-form-item label="封面">
        <el-input v-model="form.cover" placeholder="图片 URL，留空则用首图" />
      </el-form-item>
      <el-form-item label="图片">
        <el-input
          v-model="form.imagesText"
          type="textarea"
          :rows="3"
          placeholder="每行一个图片 URL，最多 9 张，留空表示无图"
        />
      </el-form-item>
      <el-form-item label="话题">
        <el-select v-model="form.topicIds" multiple filterable :multiple-limit="5" placeholder="选择话题，最多 5 个" style="width: 100%">
          <el-option v-for="item in topics" :key="item.id" :label="`#${item.name}`" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="可见范围">
        <el-radio-group v-model="form.visibility">
          <el-radio value="public">公开</el-radio>
          <el-radio value="followers">仅关注者</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="close">取消</el-button>
      <el-button type="primary" :loading="saving" @click="submit">保存</el-button>
    </template>
  </el-dialog>
</template>
