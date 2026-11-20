<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import {
  CircleCheck,
  Lock,
  User,
  View,
  Hide,
  DocumentChecked,
  TrendCharts,
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { ApiError } from '@/api/client'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const formRef = ref<FormInstance>()
const loading = ref(false)
const errorMessage = ref('')
const showPassword = ref(false)
const remember = ref(false)

const form = reactive({ username: '', password: '' })

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

const REMEMBER_KEY = 'jh_admin_remember'

onMounted(() => {
  const saved = localStorage.getItem(REMEMBER_KEY)
  if (saved) {
    form.username = saved
    remember.value = true
  }
})

async function submit() {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  errorMessage.value = ''
  try {
    const data = await auth.login(form.username.trim(), form.password)
    if (remember.value) localStorage.setItem(REMEMBER_KEY, form.username.trim())
    else localStorage.removeItem(REMEMBER_KEY)

    if (data.mustChangePassword) {
      router.replace({ name: 'change-password', query: { forced: '1' } })
      return
    }
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/dashboard'
    router.replace(redirect)
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '登录失败，请稍后重试'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login">
    <section class="brand">
      <div class="circle c1" />
      <div class="circle c2" />
      <div class="circle c3" />

      <div class="brand-top">
        <div class="logo">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#FFFFFF" stroke-width="2.2">
            <path d="M3 12h4l2-6 4 12 2-6h6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
        <span class="wordmark">健衡运动社区</span>
      </div>

      <div class="brand-middle">
        <span class="rule" />
        <p class="eyebrow">ADMIN CONSOLE</p>
        <h1 class="headline">让好内容，<br />被认真看见</h1>
        <p class="sub">审核、运营、内容维护，一个工作台完成。</p>

        <ul class="features">
          <li><el-icon :size="20"><CircleCheck /></el-icon>内容安全</li>
          <li><el-icon :size="20"><DocumentChecked /></el-icon>审核流程</li>
          <li><el-icon :size="20"><TrendCharts /></el-icon>运营洞察</li>
        </ul>
      </div>

      <p class="brand-footer">智能康复 · 科学运动 · 健康生活</p>
    </section>

    <section class="panel">
      <div class="form-wrap">
        <p class="eyebrow brand-text">ADMIN CONSOLE</p>
        <h2 class="title">登录管理端</h2>
        <p class="sub">使用管理员账号继续</p>

        <el-alert
          v-if="errorMessage"
          class="alert"
          type="error"
          :closable="false"
          show-icon
          :title="errorMessage"
        />

        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-position="top"
          hide-required-asterisk
          @submit.prevent
        >
          <el-form-item label="用户名" prop="username">
            <el-input
              v-model="form.username"
              size="large"
              placeholder="请输入用户名"
              :prefix-icon="User"
              autocomplete="username"
            />
          </el-form-item>

          <el-form-item label="密码" prop="password">
            <el-input
              v-model="form.password"
              size="large"
              :type="showPassword ? 'text' : 'password'"
              placeholder="请输入密码"
              :prefix-icon="Lock"
              autocomplete="current-password"
              @keyup.enter="submit"
            >
              <template #suffix>
                <el-icon class="eye" @click="showPassword = !showPassword">
                  <View v-if="!showPassword" />
                  <Hide v-else />
                </el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-checkbox v-model="remember" class="remember">记住用户名</el-checkbox>

          <el-button class="submit" type="primary" size="large" :loading="loading" @click="submit">
            登录
          </el-button>
        </el-form>
      </div>

      <p class="version">v1.0.0 · 仅限内部人员使用</p>
    </section>
  </div>
</template>

<style scoped lang="scss">
.login {
  display: flex;
  min-height: 100vh;
  background: var(--bg-card);
}

.brand {
  position: relative;
  width: 55%;
  min-width: 620px;
  padding: 72px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  color: var(--ink-900);
  background: linear-gradient(150deg, #edfef7 0%, #f1fef9 55%, #f7fffb 100%);
  border-right: 1px solid var(--line-200);
}

.circle {
  position: absolute;
  border: 1px solid rgba(0, 168, 74, 0.12);
  border-radius: 50%;
  pointer-events: none;
}
.c1 {
  width: 560px;
  height: 560px;
  top: -160px;
  left: -120px;
}
.c2 {
  width: 420px;
  height: 420px;
  top: -60px;
  right: -80px;
}
.c3 {
  width: 300px;
  height: 300px;
  bottom: 40px;
  right: 80px;
  border-color: rgba(0, 168, 74, 0.08);
}

.brand-top {
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
}

.logo {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--brand-600);
  display: flex;
  align-items: center;
  justify-content: center;
}

.wordmark {
  font-size: 20px;
  font-weight: 600;
  color: var(--ink-900);
}

.brand-middle {
  position: relative;
  max-width: 520px;
}

.eyebrow {
  margin: 0;
  font-size: 11px;
  line-height: 16px;
  font-weight: 600;
  letter-spacing: 2px;
  color: var(--brand-700);
}

.brand-text {
  color: var(--brand-700);
  letter-spacing: 1.5px;
}

.rule {
  display: block;
  width: 48px;
  height: 3px;
  margin-bottom: 14px;
  border-radius: 2px;
  background: var(--brand-600);
}

.headline {
  margin: 16px 0 0;
  font-size: 30px;
  line-height: 40px;
  font-weight: 600;
  color: var(--ink-900);
}

.sub {
  margin: 16px 0 0;
  font-size: 14px;
  line-height: 22px;
  color: var(--ink-500);
}

.features {
  list-style: none;
  margin: 40px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;

  li {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 14px;
    color: var(--ink-700);

    .el-icon {
      color: var(--brand-600);
    }
  }
}

.brand-footer {
  position: relative;
  margin: 0;
  font-size: 12px;
  color: var(--ink-400);
}

.panel {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-card);
  padding: 48px 24px;
}

.form-wrap {
  width: 360px;

  .sub {
    margin-top: 8px;
    font-size: 14px;
    line-height: 22px;
    color: var(--ink-500);
  }
}

.title {
  margin: 12px 0 0;
  font-size: 28px;
  line-height: 36px;
  font-weight: 600;
  color: var(--ink-900);
}

.alert {
  margin-top: 20px;
}

.el-form {
  margin-top: 28px;
}

.remember {
  margin-top: 4px;
}

.submit {
  width: 100%;
  margin-top: 20px;
  height: 40px;
}

.eye {
  cursor: pointer;
  color: var(--ink-400);
}

.version {
  position: absolute;
  bottom: 24px;
  margin: 0;
  font-size: 12px;
  color: var(--ink-400);
}

@media (max-width: 1100px) {
  .brand {
    min-width: 480px;
    padding: 48px;
  }
}
</style>
