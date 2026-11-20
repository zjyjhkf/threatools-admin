import type { RouteRecordRaw } from 'vue-router'

const AdminLayout = () => import('@/layouts/AdminLayout.vue')

export const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login/LoginView.vue'),
    meta: { title: '登录', layout: 'blank', public: true },
  },
  {
    path: '/change-password',
    name: 'change-password',
    component: () => import('@/views/login/ChangePasswordView.vue'),
    meta: { title: '修改密码', layout: 'blank' },
  },
  {
    path: '/',
    component: AdminLayout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/views/dashboard/DashboardView.vue'),
        meta: { title: '概览', permission: 'dashboard:read', order: 1, group: '' },
      },
      {
        path: 'posts',
        name: 'posts',
        component: () => import('@/views/posts/PostListView.vue'),
        meta: { title: '帖子审核', permission: 'post:read', order: 2, group: '社区审核' },
      },
      {
        path: 'comments',
        name: 'comments',
        component: () => import('@/views/comments/CommentListView.vue'),
        meta: { title: '评论治理', permission: 'comment:read', order: 3, group: '社区审核' },
      },
      {
        path: 'users',
        name: 'users',
        component: () => import('@/views/users/UserListView.vue'),
        meta: { title: '用户', permission: 'user:read', order: 4, group: '' },
      },
      {
        path: 'topics',
        name: 'topics',
        component: () => import('@/views/topics/TopicListView.vue'),
        meta: { title: '话题', permission: 'topic:manage', order: 5, group: '内容' },
      },
      {
        path: 'courses',
        name: 'courses',
        component: () => import('@/views/courses/CourseListView.vue'),
        meta: { title: '课程', permission: 'course:manage', order: 6, group: '内容' },
      },
      {
        path: 'courses/new',
        name: 'course-create',
        component: () => import('@/views/courses/CourseEditView.vue'),
        meta: { title: '新建课程', permission: 'course:manage', hidden: true },
      },
      {
        path: 'courses/:id/edit',
        name: 'course-edit',
        component: () => import('@/views/courses/CourseEditView.vue'),
        meta: { title: '编辑课程', permission: 'course:manage', hidden: true },
      },
      {
        path: 'products',
        name: 'products',
        component: () => import('@/views/products/ProductListView.vue'),
        meta: { title: '产品', permission: 'product:manage', order: 7, group: '内容' },
      },
      {
        path: 'products/new',
        name: 'product-create',
        component: () => import('@/views/products/ProductEditView.vue'),
        meta: { title: '新建产品', permission: 'product:manage', hidden: true },
      },
      {
        path: 'products/:id/edit',
        name: 'product-edit',
        component: () => import('@/views/products/ProductEditView.vue'),
        meta: { title: '编辑产品', permission: 'product:manage', hidden: true },
      },
      {
        path: 'meta-items',
        name: 'meta-items',
        component: () => import('@/views/meta/MetaItemsView.vue'),
        meta: { title: '筛选条目', permission: 'product:manage', order: 8, group: '内容' },
      },
      {
        path: 'admins',
        name: 'admins',
        component: () => import('@/views/admins/AdminListView.vue'),
        meta: { title: '管理员', permission: 'admin:manage', order: 9, group: '系统' },
      },
      {
        path: 'audit-logs',
        name: 'audit-logs',
        component: () => import('@/views/audit/AuditLogView.vue'),
        meta: { title: '操作日志', permission: 'audit:read', order: 10, group: '系统' },
      },
      {
        path: 'profile',
        name: 'profile',
        component: () => import('@/views/profile/ProfileView.vue'),
        meta: { title: '个人中心', order: 11, group: '' },
      },
    ],
  },
  {
    path: '/403',
    name: 'forbidden',
    component: () => import('@/views/error/ForbiddenView.vue'),
    meta: { title: '无权限', layout: 'blank', public: true },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/error/NotFoundView.vue'),
    meta: { title: '页面不存在', layout: 'blank', public: true },
  },
]
