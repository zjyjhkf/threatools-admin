<script setup lang="ts">
import { ref, watch } from 'vue'
import { Close, User, Warning } from '@element-plus/icons-vue'
import * as usersApi from '@/api/users'
import type { UserDetail } from '@/api/types'
import StatusTag from '@/components/common/StatusTag.vue'
import { formatDate } from '@/utils/format'

const props = defineProps<{ modelValue: boolean; userId: string }>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'toggle-status', user: UserDetail): void
}>()

const loading = ref(false)
const detail = ref<UserDetail | null>(null)

async function load() {
  if (!props.userId) return
  loading.value = true
  try {
    detail.value = await usersApi.getUser(props.userId)
  } finally {
    loading.value = false
  }
}

watch(
  () => [props.modelValue, props.userId],
  ([visible]) => {
    if (visible) load()
  },
  { immediate: true },
)

const genderText = (gender?: string) =>
  gender === 'male' ? '男' : gender === 'female' ? '女' : '保密'

const percent = () => {
  if (!detail.value) return 0
  const { filled, total } = detail.value.bodyProfile
  return total ? Math.round((filled / total) * 100) : 0
}
</script>

<template>
  <el-drawer
    :model-value="modelValue"
    size="640px"
    :with-header="false"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div v-loading="loading" class="drawer">
      <header class="drawer-head">
        <div class="head-left">
          <h2>用户详情</h2>
          <StatusTag v-if="detail" :status="detail.status === 1 ? 'normal' : 'disabled'" :label="detail.status === 1 ? '正常' : '已禁用'" />
        </div>
        <el-button :icon="Close" circle text @click="emit('update:modelValue', false)" />
      </header>

      <div v-if="detail" class="drawer-body">
        <div class="profile">
          <div class="avatar"><el-icon :size="24"><User /></el-icon></div>
          <div class="profile-text">
            <strong class="name">{{ detail.nickname }}</strong>
            <span class="meta">
              {{ detail.id }} · {{ genderText(detail.gender) }} · {{ detail.city || '未填写' }}
            </span>
            <span class="mono muted">openid {{ detail.openidMasked }}</span>
          </div>
        </div>

        <div class="stat-blocks">
          <div class="block">
            <span class="label">动态</span>
            <span class="value">{{ detail.stats.posts }}</span>
          </div>
          <div class="block">
            <span class="label">获赞</span>
            <span class="value">{{ detail.stats.likesReceived }}</span>
          </div>
          <div class="block">
            <span class="label">粉丝</span>
            <span class="value">{{ detail.stats.followers }}</span>
          </div>
        </div>

        <div class="completeness">
          <div class="row">
            <span class="label">资料完善度</span>
            <span class="value">{{ detail.bodyProfile.filled }}/{{ detail.bodyProfile.total }}</span>
          </div>
          <div class="bar"><i :style="{ width: `${percent()}%` }" /></div>
          <p class="hint">缺少：身高、体重，仅本人可见，不参与审核</p>
        </div>

        <div class="collections">
          <h4>收藏</h4>
          <div class="block-row">
            <div class="block">
              <span class="label">社区</span>
              <span class="value">{{ detail.collections.post }}</span>
            </div>
            <div class="block">
              <span class="label">课程</span>
              <span class="value">{{ detail.collections.course }}</span>
            </div>
            <div class="block">
              <span class="label">产品</span>
              <span class="value">{{ detail.collections.product }}</span>
            </div>
          </div>
        </div>

        <div class="recent-head">
          <h4>最近 5 条帖子</h4>
          <el-button link type="primary">查看全部 →</el-button>
        </div>
        <div v-for="post in detail.recentPosts" :key="post.id" class="recent-row">
          <span class="recent-title">{{ post.title }}</span>
          <StatusTag :status="post.status" />
          <span class="mono muted">{{ formatDate(post.createdAt, 'MM-DD HH:mm') }}</span>
        </div>

        <div class="privacy">
          <el-icon :size="16"><Warning /></el-icon>
          <span>身体档案数值不在此展示</span>
        </div>
      </div>

      <footer v-if="detail" class="drawer-footer">
        <el-button link type="danger" @click="emit('toggle-status', detail)">
          {{ detail.status === 1 ? '禁用用户' : '启用用户' }}
        </el-button>
        <el-button @click="emit('update:modelValue', false)">关闭</el-button>
      </footer>
    </div>
  </el-drawer>
</template>

<style scoped lang="scss">
.drawer {
  display: flex;
  flex-direction: column;
  height: 100%;
  margin: -24px;
}

.drawer-head {
  height: 64px;
  flex: 0 0 64px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--line-200);

  h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
  }
}

.head-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.profile {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--brand-100);
  color: var(--brand-600);
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-text {
  display: flex;
  flex-direction: column;
  gap: 2px;

  .name {
    font-size: 18px;
    font-weight: 600;
    color: var(--ink-900);
  }

  .meta {
    font-size: 12px;
    color: var(--ink-500);
  }
}

.muted {
  color: var(--ink-400);
  font-size: 11px;
}

.mono {
  font-family: var(--font-mono);
}

.stat-blocks,
.block-row {
  display: flex;
  gap: 16px;
}

.block {
  flex: 1;
  min-width: 0;
  height: 64px;
  padding: 0 16px;
  border-radius: 8px;
  background: var(--bg-input);
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;

  .label {
    font-size: 12px;
    color: var(--ink-500);
  }

  .value {
    font-size: 20px;
    font-weight: 600;
    color: var(--ink-900);
  }
}

.completeness {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .row {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
  }

  .label {
    color: var(--ink-900);
    font-weight: 600;
  }

  .value {
    color: var(--ink-700);
    font-size: 13px;
  }

  .bar {
    height: 8px;
    border-radius: 4px;
    background: var(--bg-input);
    overflow: hidden;

    i {
      display: block;
      height: 100%;
      border-radius: 4px;
      background: var(--brand-600);
    }
  }

  .hint {
    margin: 0;
    font-size: 12px;
    color: var(--ink-500);
  }
}

.collections h4,
.recent-head h4 {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--ink-900);
}

.recent-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.recent-row {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  border-bottom: 1px solid var(--line-200);

  .recent-title {
    flex: 1;
    min-width: 0;
    font-size: 13px;
    color: var(--ink-900);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.privacy {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  background: var(--warning-50);
  color: var(--warning-600);
  font-size: 12px;
}

.drawer-footer {
  flex: 0 0 64px;
  height: 64px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid var(--line-200);
  background: var(--bg-card);
}
</style>
