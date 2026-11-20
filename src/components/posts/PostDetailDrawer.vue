<script setup lang="ts">
import { ref, watch } from 'vue'
import { Picture, User, Close } from '@element-plus/icons-vue'
import * as postsApi from '@/api/posts'
import type { PostDetail } from '@/api/types'
import StatusTag from '@/components/common/StatusTag.vue'
import { formatDate } from '@/utils/format'

const props = defineProps<{ modelValue: boolean; postId: string }>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'changed'): void
  (e: 'review', action: 'approve' | 'reject' | 'restore'): void
  (e: 'remove', post: PostDetail): void
  (e: 'edit', post: PostDetail): void
}>()

const loading = ref(false)
const post = ref<PostDetail | null>(null)

async function load() {
  if (!props.postId) return
  loading.value = true
  try {
    post.value = await postsApi.getPost(props.postId)
  } finally {
    loading.value = false
  }
}

watch(
  () => [props.modelValue, props.postId],
  ([visible]) => {
    if (visible) load()
  },
  { immediate: true },
)

function close() {
  emit('update:modelValue', false)
}
</script>

<template>
  <el-drawer
    :model-value="modelValue"
    size="720px"
    :with-header="false"
    class="post-drawer"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div v-loading="loading" class="drawer">
      <header class="drawer-head">
        <div class="head-left">
          <h2>帖子详情</h2>
          <StatusTag v-if="post" :status="post.reviewStatus" />
        </div>
        <el-button :icon="Close" circle text @click="close" />
      </header>

      <div v-if="post" class="drawer-body">
        <div class="author-row">
          <div class="author-left">
            <div class="avatar">
              <el-icon :size="18"><User /></el-icon>
            </div>
            <div class="author-meta">
              <strong>{{ post.author.nickname }}</strong>
              <span class="muted">{{ post.author.id }} · {{ formatDate(post.createdAt, 'MM-DD HH:mm') }}</span>
            </div>
          </div>
          <el-button
            link
            type="primary"
            @click="$router.push({ name: 'users', query: { keyword: post.author.nickname } })"
          >
            查看用户
          </el-button>
        </div>

        <h1 class="post-title">{{ post.title }}</h1>
        <p v-for="(paragraph, i) in post.content.split('\n\n')" :key="i" class="paragraph">
          {{ paragraph }}
        </p>

        <div class="stats">
          <span class="metric">赞 {{ post.likeCount }}</span>
          <span class="metric">评论 {{ post.commentCount }}</span>
          <span class="metric">收藏 {{ post.collectCount }}</span>
          <span class="visibility">{{ post.visibility === 'public' ? '公开' : '仅关注者' }}</span>
        </div>

        <div class="image-grid">
          <div v-for="(image, i) in post.images" :key="i" class="image-cell">
            <el-image v-if="image.url" :src="image.url" fit="cover" :preview-src-list="post.images.map((x) => x.url)" preview-teleported />
            <template v-else>
              <el-icon :size="32"><Picture /></el-icon>
              <span class="size">{{ image.width }}×{{ image.height }}</span>
            </template>
          </div>
        </div>

        <div class="topics">
          <span v-for="topic in post.topics" :key="topic.id" class="tag-chip">#{{ topic.name }}</span>
        </div>

        <el-divider />

        <div class="review-info">
          <h4>审核信息</h4>
          <div class="info-grid">
            <span>当前状态</span><StatusTag :status="post.reviewStatus" />
            <span>提交时间</span><b>{{ formatDate(post.createdAt) }}</b>
            <span>审核人</span><b>{{ post.reviewedBy?.username || '—' }}</b>
            <span>审核时间</span><b>{{ formatDate(post.reviewedAt) }}</b>
            <span>驳回原因</span><b>{{ post.reviewReason || '—' }}</b>
          </div>
        </div>

        <div class="section-head">
          <h4>最近评论</h4>
          <span class="muted">共 {{ post.commentCount }} 条</span>
        </div>
        <div v-for="comment in post.recentComments" :key="comment.id" class="comment">
          <div class="comment-head">
            <span class="comment-name">{{ comment.user.nickname }}</span>
            <span class="muted">{{ formatDate(comment.createdAt, 'MM-DD HH:mm') }}</span>
          </div>
          <p>{{ comment.content }}</p>
        </div>

        <h4>审核轨迹</h4>
        <ul class="trail">
          <li v-for="(item, i) in post.auditTrail" :key="i">
            <i class="dot" />
            <span class="muted">{{ formatDate(item.createdAt, 'MM-DD HH:mm') }}</span>
            <b>{{ item.action }}</b>
            <span class="muted">{{ item.admin.username }}</span>
          </li>
        </ul>
      </div>

      <footer v-if="post" class="drawer-footer">
        <div class="footer-left">
          <el-button link type="primary" @click="emit('edit', post)">编辑内容</el-button>
          <el-button link type="danger" @click="emit('remove', post)">删除帖子</el-button>
        </div>
        <div class="footer-right">
          <el-button v-if="post.reviewStatus !== 'rejected'" @click="emit('review', 'reject')">驳回</el-button>
          <el-button v-if="post.reviewStatus === 'rejected'" type="warning" @click="emit('review', 'restore')">
            恢复
          </el-button>
          <el-button v-else type="primary" @click="emit('review', 'approve')">通过</el-button>
        </div>
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

.author-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--line-200);
}

.author-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--brand-100);
  color: var(--brand-600);
  display: flex;
  align-items: center;
  justify-content: center;
}

.author-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;

  strong {
    font-size: 14px;
    color: var(--ink-900);
  }

  .muted {
    font-size: 12px;
  }
}

.post-title {
  margin: 0;
  font-size: 20px;
  line-height: 28px;
  font-weight: 600;
  color: var(--ink-900);
}

.paragraph {
  margin: 0;
  font-size: 14px;
  line-height: 24px;
  color: var(--ink-700);
  white-space: pre-wrap;
}

.stats {
  display: flex;
  align-items: center;
  gap: 20px;

  .metric {
    font-size: 13px;
    color: var(--ink-500);
  }

  .visibility {
    margin-left: auto;
    font-size: 12px;
    color: var(--ink-400);
  }
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;

  .image-cell {
    height: 180px;
    border-radius: 12px;
    background: var(--brand-100);
    color: var(--brand-600);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    overflow: hidden;

    .size {
      font-size: 12px;
    }

    :deep(.el-image) {
      width: 100%;
      height: 100%;
    }
  }
}

.topics {
  display: flex;
  gap: 8px;
}

.review-info {
  padding: 12px;
  border-radius: 8px;
  background: var(--bg-input);

  h4 {
    margin: 0 0 8px;
    font-size: 13px;
    font-weight: 600;
    color: var(--ink-700);
  }
}

.info-grid {
  display: grid;
  grid-template-columns: 72px 1fr;
  gap: 6px 8px;
  align-items: center;

  span {
    font-size: 12px;
    color: var(--ink-500);
  }

  b {
    font-size: 13px;
    font-weight: 400;
    color: var(--ink-900);
  }
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;

  h4 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
  }
}

h4 {
  font-size: 14px;
}

.comment {
  p {
    margin: 4px 0 0;
    font-size: 13px;
    color: var(--ink-700);
  }
}

.comment-head {
  display: flex;
  gap: 8px;
  align-items: center;

  .comment-name {
    font-size: 12px;
    font-weight: 500;
    color: var(--ink-900);
  }
}

.muted {
  font-size: 12px;
  color: var(--ink-400);
}

.trail {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;

  li {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
  }

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--brand-600);
  }
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

.footer-right {
  display: flex;
  gap: 8px;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
