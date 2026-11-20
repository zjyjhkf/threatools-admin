<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import * as topicsApi from '@/api/topics'
import type { TopicListItem } from '@/api/types'
import { toast } from '@/utils/message'

const props = defineProps<{ modelValue: boolean; topic?: TopicListItem | null }>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'saved'): void
}>()

const formRef = ref<FormInstance>()
const saving = ref(false)

const form = reactive({
  name: '',
  description: '',
  isHot: false,
  sort: 100,
})

const rules: FormRules = {
  name: [
    { required: true, message: '请输入话题名称', trigger: 'blur' },
    {
      validator: (_r, value: string, cb) => {
        if (value.length < 2 || value.length > 20) cb(new Error('2–20 字，不含 #'))
        else cb()
      },
      trigger: 'blur',
    },
  ],
  description: [{ max: 60, message: '≤60 字', trigger: 'blur' }],
}

watch(
  () => props.modelValue,
  (visible) => {
    if (!visible) return
    form.name = props.topic?.name ?? ''
    form.description = props.topic?.description ?? ''
    form.isHot = props.topic?.isHot ?? false
    form.sort = props.topic?.sort ?? 100
    formRef.value?.clearValidate()
  },
)

async function submit() {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  saving.value = true
  try {
    if (props.topic) {
      await topicsApi.updateTopic(props.topic.id, { ...form })
      toast('话题已更新')
    } else {
      await topicsApi.createTopic({ ...form })
      toast('话题已创建')
    }
    emit('update:modelValue', false)
    emit('saved')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    :title="topic ? '编辑话题' : '新建话题'"
    width="520px"
    :close-on-click-modal="false"
    destroy-on-close
    @update:model-value="emit('update:modelValue', $event)"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
      <el-form-item label="话题名称" prop="name">
        <el-input v-model="form.name" placeholder="2–20 字，不含 #" maxlength="20" show-word-limit />
      </el-form-item>

      <el-form-item label="话题描述" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          maxlength="60"
          show-word-limit
          placeholder="一句话说明话题（≤60 字）"
        />
      </el-form-item>

      <el-form-item label="进热门">
        <el-switch v-model="form.isHot" />
      </el-form-item>

      <el-form-item label="排序">
        <el-input-number v-model="form.sort" :min="0" :max="999" />
        <span class="help">数值越大越靠前</span>
      </el-form-item>

      <el-alert
        type="info"
        :closable="false"
        show-icon
        title="改名会立即影响小程序端展示"
      />
    </el-form>

    <template #footer>
      <el-button @click="emit('update:modelValue', false)">取消</el-button>
      <el-button type="primary" :loading="saving" @click="submit">保存</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.help {
  margin-left: 8px;
  font-size: 12px;
  color: var(--ink-500);
}
</style>
