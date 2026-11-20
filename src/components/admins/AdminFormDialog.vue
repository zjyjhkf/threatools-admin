<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import * as adminsApi from '@/api/admins'
import type { AdminListItem, AdminRole } from '@/api/types'
import { useDictionaryStore } from '@/stores/dictionary'
import { toast } from '@/utils/message'

const props = defineProps<{
  modelValue: boolean
  admin?: AdminListItem | null
  selfId?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'saved', admin: AdminListItem): void
  (e: 'temp-password', payload: { username: string; password: string }): void
}>()

const dict = useDictionaryStore()
const formRef = ref<FormInstance>()
const saving = ref(false)

const isEdit = computed(() => Boolean(props.admin))
const isSelf = computed(() => Boolean(props.admin && props.admin.id === props.selfId))

const form = reactive({
  username: '',
  nickname: '',
  role: 'admin' as AdminRole,
  password: '',
  status: 1 as 0 | 1,
  remark: '',
})

const rules = computed<FormRules>(() => ({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '3–20 位字母或数字', trigger: 'blur' },
  ],
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
  password: isEdit.value
    ? []
    : [
        {
          validator: (_r, value: string, cb) => {
            if (!value) return cb()
            if (value.length < 10 || value.length > 32) cb(new Error('10–32 位'))
            else cb()
          },
          trigger: 'blur',
        },
      ],
  remark: [{ max: 100, message: '≤100 字', trigger: 'blur' }],
}))

watch(
  () => props.modelValue,
  (visible) => {
    if (!visible) return
    dict.load()
    Object.assign(form, {
      username: props.admin?.username ?? '',
      nickname: props.admin?.nickname ?? '',
      role: props.admin?.role ?? 'admin',
      password: '',
      status: props.admin?.status ?? 1,
      remark: props.admin?.remark ?? '',
    })
    formRef.value?.clearValidate()
  },
)

async function submit() {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  saving.value = true
  try {
    if (props.admin) {
      const updated = await adminsApi.updateAdmin(props.admin.id, {
        nickname: form.nickname,
        role: form.role,
        status: form.status,
        remark: form.remark,
      })
      toast('已保存')
      emit('saved', updated as unknown as AdminListItem)
    } else {
      const res = await adminsApi.createAdmin({
        username: form.username,
        nickname: form.nickname,
        role: form.role,
        password: form.password || undefined,
        remark: form.remark,
      })
      toast('管理员已创建')
      emit('saved', res.admin)
      if (res.tempPassword) {
        emit('temp-password', { username: res.admin.username, password: res.tempPassword })
      }
    }
    emit('update:modelValue', false)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    :title="isEdit ? '编辑管理员' : '新建管理员'"
    width="520px"
    :close-on-click-modal="false"
    destroy-on-close
    @update:model-value="emit('update:modelValue', $event)"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
      <el-form-item label="用户名" prop="username">
        <el-input
          v-model="form.username"
          :disabled="isEdit"
          placeholder="请输入用户名，创建后不可修改"
          maxlength="20"
        />
        <p v-if="isEdit" class="help">用户名创建后不可修改</p>
      </el-form-item>

      <el-form-item label="昵称" prop="nickname">
        <el-input v-model="form.nickname" placeholder="1–20 字" maxlength="20" />
      </el-form-item>

      <el-form-item label="角色" prop="role">
        <el-select v-model="form.role" :disabled="isSelf" style="width: 100%">
          <el-option
            v-for="item in dict.options?.roles ?? []"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item v-if="!isEdit" label="初始密码" prop="password">
        <el-input v-model="form.password" type="password" show-password placeholder="留空自动生成 12 位临时密码" />
        <p class="help">10–32 位，至少 3 类字符</p>
      </el-form-item>

      <el-form-item v-if="isEdit" label="状态">
        <el-switch
          v-model="form.status"
          :active-value="1"
          :inactive-value="0"
          :disabled="isSelf"
          active-text="启用"
          inactive-text="停用"
        />
      </el-form-item>

      <el-form-item label="备注" prop="remark">
        <el-input v-model="form.remark" type="textarea" :rows="3" maxlength="100" show-word-limit placeholder="≤100 字" />
      </el-form-item>

      <el-alert
        type="warning"
        :closable="false"
        show-icon
        title="管理员拥有内容与用户管理权限；超级管理员可管理账号。"
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
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--ink-500);
}
</style>
