<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { User, Check } from '@element-plus/icons-vue'
import PageHeader from '@/components/common/PageHeader.vue'
import RoleTag from '@/components/common/RoleTag.vue'
import { useAuthStore } from '@/stores/auth'
import { formatDate } from '@/utils/format'

const auth = useAuthStore()
const router = useRouter()

const profile = computed(() => auth.profile)

const infoRows = computed(() => [
  { label: '角色', value: profile.value?.role === 'super' ? '超级管理员（super）' : '管理员（admin）' },
  { label: '最近登录', value: formatDate(profile.value?.lastLoginAt) },
  { label: '创建时间', value: formatDate(profile.value?.createdAt) },
  { label: '账号状态', value: profile.value?.status === 1 ? '启用' : '停用' },
])

const permissions = computed(() => profile.value?.permissions ?? [])
</script>

<template>
  <div class="page">
    <PageHeader title="个人中心" subtitle="当前账号信息与权限">
      <template #actions>
        <el-button type="primary" @click="router.push({ name: 'change-password' })">修改密码</el-button>
      </template>
    </PageHeader>

    <div class="cards">
      <section class="page-card profile-card">
        <div class="head">
          <span class="avatar"><el-icon :size="28"><User /></el-icon></span>
          <div class="names">
            <div class="name-row">
              <strong>{{ profile?.nickname || '—' }}</strong>
              <RoleTag v-if="profile" :role="profile.role" />
            </div>
            <span class="username">@{{ profile?.username }}</span>
          </div>
        </div>

        <div class="info-rows">
          <div v-for="row in infoRows" :key="row.label" class="info-row">
            <span class="label">{{ row.label }}</span>
            <span class="value">{{ row.value }}</span>
          </div>
        </div>

        <div class="spacer" />

        <div class="actions">
          <el-button type="primary" @click="router.push({ name: 'change-password' })">修改密码</el-button>
          <el-button type="danger" plain @click="auth.reset(); router.replace({ name: 'login' })">
            退出登录
          </el-button>
        </div>
        <p class="hint">密码修改后，其他会话会失效</p>
      </section>

      <section class="page-card perms-card">
        <div class="perms-head">
          <h3>当前权限</h3>
          <span class="mono muted">{{ permissions.join(' / ') ? 'super / admin' : '—' }}</span>
        </div>

        <div class="perm-grid">
          <span v-for="perm in permissions" :key="perm" class="perm">
            <el-icon :size="14" class="check"><Check /></el-icon>{{ perm }}
          </span>
        </div>

        <div class="spacer" />
        <p class="hint">权限由角色决定，前端仅做展示，后端校验为准</p>
      </section>
    </div>

    <div class="page-card version-bar">
      <span class="mono muted">健衡管理端 v1.0.0 · 后端 1.0.0</span>
      <el-button link type="primary">查看健康状态</el-button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.cards {
  display: grid;
  grid-template-columns: minmax(0, 480fr) minmax(0, 664fr);
  gap: 16px;
}

.profile-card,
.perms-card {
  min-height: 360px;
  padding: 24px;
  display: flex;
  flex-direction: column;
}

.head {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--brand-100);
  color: var(--brand-600);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.names {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 8px;

  strong {
    font-size: 20px;
    font-weight: 600;
    color: var(--ink-900);
  }
}

.username {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--ink-500);
}

.info-rows {
  margin-top: 24px;
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 32px;
  border-bottom: 1px solid var(--line-200);

  .label {
    font-size: 12px;
    color: var(--ink-500);
  }

  .value {
    font-size: 13px;
    color: var(--ink-900);
  }
}

.spacer {
  flex: 1;
}

.actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.hint {
  margin: 8px 0 0;
  font-size: 12px;
  color: var(--ink-400);
}

.perms-head {
  display: flex;
  align-items: center;
  justify-content: space-between;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--ink-900);
  }
}

.perm-grid {
  margin-top: 20px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 32px;
}

.perm {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 28px;
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--ink-700);
}

.check {
  color: var(--success-600);
}

.mono {
  font-family: var(--font-mono);
  font-size: 12px;
}

.muted {
  color: var(--ink-400);
}

.version-bar {
  height: 40px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

@media (max-width: 1280px) {
  .cards {
    grid-template-columns: 1fr;
  }
}
</style>
