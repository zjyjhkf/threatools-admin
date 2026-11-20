<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { Lock, Select, Close } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { checkPasswordStrength, isStrongPassword } from '@/utils/validate'
import { toast } from '@/utils/message'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const forced = computed(() => route.query.forced === '1')
const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' })

const strength = computed(() => checkPasswordStrength(form.newPassword))

const rules: FormRules = {
  oldPassword: [{ required: true, message: '请输入当前密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    {
      validator: (_rule, value: string, callback) => {
        if (!isStrongPassword(value)) callback(new Error('10–32 位，且至少包含 3 类字符'))
        else callback()
      },
      trigger: 'blur',
    },
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (_rule, value: string, callback) => {
        if (value !== form.newPassword) callback(new Error('两次输入不一致'))
        else callback()
      },
      trigger: 'blur',
    },
  ],
}

const ruleItems = computed(() => [
  { text: '至少 10 位字符', ok: form.newPassword.length >= 10 },
  { text: '包含大小写字母', ok: /[a-z]/.test(form.newPassword) && /[A-Z]/.test(form.newPassword) },
  { text: '包含数字', ok: /\d/.test(form.newPassword) },
  { text: '包含特殊符号', ok: /[^A-Za-z0-9]/.test(form.newPassword) },
])

async function submit() {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  loading.value = true
  try {
    await auth.changePassword(form.oldPassword, form.newPassword)
    await auth.fetchMe().catch(() => undefined)
    toast('密码已修改')
    router.replace({ name: 'dashboard' })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="page">
    <header class="topbar">
      <div class="brand">
        <div class="logo">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#fff" stroke-width="2">
            <path d="M3 12h4l2-6 4 12 2-6h6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
        <span>健衡运动社区</span>
      </div>
      <span class="version">v1.0.0</span>
    </header>

    <main class="center">
      <div class="card">
        <div class="card-head">
          <div class="logo big">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" stroke-width="2">
              <path d="M3 12h4l2-6 4 12 2-6h6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <span class="brand-name">健衡运动社区</span>
        </div>

        <h1 class="title">修改密码</h1>
        <p class="subtitle">首次登录需要修改初始密码，完成后进入工作台。</p>

        <el-alert
          v-if="forced"
          class="alert"
          type="warning"
          :closable="false"
          show-icon
          title="为了账号安全，请先修改初始密码"
        />

        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-position="top"
          class="form"
          @submit.prevent
        >
          <el-form-item label="当前密码" prop="oldPassword">
            <el-input
              v-model="form.oldPassword"
              type="password"
              size="large"
              show-password
              placeholder="请输入当前密码"
              :prefix-icon="Lock"
            />
          </el-form-item>

          <el-form-item label="新密码" prop="newPassword">
            <el-input
              v-model="form.newPassword"
              type="password"
              size="large"
              show-password
              placeholder="10–32 位，至少 3 类字符"
              :prefix-icon="Lock"
            />
          </el-form-item>

          <div class="strength">
            <div class="bars">
              <i
                v-for="i in 4"
                :key="i"
                :class="{
                  on: strength.level >= i,
                  weak: strength.level === 1,
                  mid: strength.level === 2,
                  strong: strength.level === 3,
                }"
              />
            </div>
            <span class="level" :class="`lv${strength.level}`">{{ strength.label }}</span>
          </div>

          <div class="rules">
            <span v-for="item in ruleItems" :key="item.text" :class="{ ok: item.ok }">
              <el-icon :size="12"><Select v-if="item.ok" /><Close v-else /></el-icon>
              {{ item.text }}
            </span>
          </div>

          <el-form-item label="确认新密码" prop="confirmPassword">
            <el-input
              v-model="form.confirmPassword"
              type="password"
              size="large"
              show-password
              placeholder="再次输入新密码"
              :prefix-icon="Lock"
            />
          </el-form-item>

          <el-button class="submit" type="primary" size="large" :loading="loading" @click="submit">
            确认修改
          </el-button>
        </el-form>

        <router-link v-if="!forced" class="back" :to="{ name: 'dashboard' }">返回概览</router-link>
      </div>
    </main>
  </div>
</template>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-page);
  background-image: radial-gradient(circle at 0% 0%, var(--brand-50), transparent 40%);
}

.topbar {
  height: 72px;
  padding: 0 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--ink-900);
}

.logo {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: var(--brand-600);
  display: flex;
  align-items: center;
  justify-content: center;

  &.big {
    width: 40px;
    height: 40px;
    border-radius: 10px;
  }
}

.version {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--ink-400);
}

.center {
  flex: 1;
  display: flex;
  justify-content: center;
  padding: 58px 24px 48px;
}

.card {
  width: 480px;
  height: fit-content;
  padding: 32px;
  background: var(--bg-card);
  border: 1px solid var(--line-200);
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(16, 24, 40, 0.08);
}

.card-head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.brand-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--ink-900);
}

.title {
  margin: 24px 0 0;
  font-size: 24px;
  line-height: 32px;
  font-weight: 600;
  color: var(--ink-900);
}

.subtitle {
  margin: 8px 0 0;
  font-size: 14px;
  line-height: 22px;
  color: var(--ink-500);
}

.alert {
  margin-top: 16px;
}

.form {
  margin-top: 8px;
}

.strength {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: -8px 0 8px;
}

.bars {
  display: flex;
  gap: 4px;
  flex: 1;

  i {
    flex: 1;
    height: 4px;
    border-radius: 2px;
    background: var(--bg-input);

    &.on.weak {
      background: var(--danger-600);
    }
    &.on.mid {
      background: var(--warning-600);
    }
    &.on.strong {
      background: var(--success-600);
    }
  }
}

.level {
  font-size: 12px;
  min-width: 24px;
  text-align: right;

  &.lv1 {
    color: var(--danger-600);
  }
  &.lv2 {
    color: var(--warning-600);
  }
  &.lv3 {
    color: var(--success-600);
  }
  &.lv0 {
    color: var(--ink-400);
  }
}

.rules {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px 16px;
  margin-bottom: 20px;
  font-size: 12px;
  color: var(--ink-500);

  span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .ok {
    color: var(--success-600);
  }
}

.submit {
  width: 100%;
  height: 40px;
}

.back {
  display: block;
  margin-top: 16px;
  text-align: center;
  font-size: 12px;
}
</style>
