<script setup lang="ts">
import { computed } from 'vue'
import type { TrendPoint } from '@/api/types'

const props = withDefaults(
  defineProps<{ points?: TrendPoint[]; title?: string }>(),
  { points: () => [], title: '近 7 日内容趋势' },
)

const max = computed(() => {
  const values = props.points.flatMap((p) => [p.users, p.posts, p.comments])
  return Math.max(1, ...values)
})

const height = (value: number) => Math.max(4, Math.round((value / max.value) * 150))

const legend = [
  { key: 'users', label: '用户', cls: 'users' },
  { key: 'posts', label: '帖子', cls: 'posts' },
  { key: 'comments', label: '评论', cls: 'comments' },
] as const
</script>

<template>
  <div class="trend-card">
    <div class="head">
      <h3 class="title">{{ title }}</h3>
      <div class="legend">
        <span v-for="item in legend" :key="item.key">
          <i :class="item.cls" />{{ item.label }}
        </span>
      </div>
    </div>

    <div v-if="points.length" class="chart">
      <div v-for="point in points" :key="point.date" class="trend-col">
        <div class="trend-bars">
          <i class="users" :style="{ height: `${height(point.users)}px` }" :title="`用户 ${point.users}`" />
          <i class="posts" :style="{ height: `${height(point.posts)}px` }" :title="`帖子 ${point.posts}`" />
          <i
            class="comments"
            :style="{ height: `${height(point.comments)}px` }"
            :title="`评论 ${point.comments}`"
          />
        </div>
        <span class="date">{{ point.date }}</span>
      </div>
    </div>
    <div v-else class="empty">暂无数据</div>
  </div>
</template>

<style scoped lang="scss">
.trend-card {
  background: var(--bg-card);
  border: 1px solid var(--line-200);
  border-radius: 12px;
  box-shadow: var(--sh-card);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 300px;
}

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--ink-900);
}

.legend {
  display: flex;
  gap: 12px;

  span {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: var(--ink-500);
  }

  i {
    width: 6px;
    height: 6px;
    border-radius: 50%;

    &.users {
      background: var(--brand-600);
    }
    &.posts {
      background: var(--success-600);
    }
    &.comments {
      background: var(--warning-600);
    }
  }
}

.chart {
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding-top: 8px;
}

.date {
  font-size: 12px;
  color: var(--ink-400);
  font-family: var(--font-mono);
}

.empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ink-400);
  font-size: 12px;
}
</style>
