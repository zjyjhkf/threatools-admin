/**
 * 本地 Mock 适配器（仅当 VITE_USE_MOCK=true 时挂载）。
 * 目的：后端管理接口尚未实现（当前返回 501）时，前端可独立演示与验收。
 * 关闭方式：.env.* 中 VITE_USE_MOCK=false，请求将走真实 /api/v1。
 */
import type { AxiosAdapter, AxiosRequestConfig, AxiosResponse } from 'axios'
import type {
  AdminListItem,
  AdminProfile,
  AuditLog,
  CommentListItem,
  CourseDetail,
  CourseListItem,
  MetaOptions,
  PostDetail,
  PostListItem,
  ProductDetail,
  ProductListItem,
  TopicListItem,
  UserDetail,
  UserListItem,
} from '@/api/types'

const now = '2026-11-05 09:12:00'

const fail = (code: number, message: string) => ({ __fail: { code, message } })

const admins: AdminListItem[] = [
  { id: '1', username: 'admin', nickname: '超级管理员', role: 'super', status: 1, mustChangePassword: false, remark: '', lastLoginAt: now, createdAt: '2026-11-04 16:00:00' },
  { id: '2', username: 'editor01', nickname: '内容编辑', role: 'admin', status: 1, mustChangePassword: true, remark: '', lastLoginAt: '2026-11-05 08:40:00', createdAt: '2026-11-05 10:00:00' },
  { id: '3', username: 'ops02', nickname: '运营小周', role: 'admin', status: 0, mustChangePassword: false, remark: '', lastLoginAt: '2026-11-03 18:20:00', createdAt: '2026-11-04 17:30:00' },
]

const perms = [
  'dashboard:read', 'post:read', 'post:review', 'post:delete', 'comment:read', 'comment:delete',
  'user:read', 'user:manage', 'topic:manage', 'course:manage', 'product:manage',
  'upload:write', 'audit:read', 'admin:manage',
]

const profile = (a: AdminListItem): AdminProfile => ({
  ...a,
  permissions: a.role === 'super' ? perms : perms.filter((p) => p !== 'admin:manage'),
  lastLoginIp: '10.0.12.31',
  createdAt: a.createdAt,
  passwordChangedAt: a.createdAt,
})

let seq = 1000
const nextId = () => String(++seq)

const posts: PostListItem[] = [
  ['快乐晨跑', '今天 6 点出门，跑了 5 公里，状态很好。', '运动达人', '@100001', '跑后拉伸挑战', 128, 24, 'pending', '2026-11-05 07:41:00'],
  ['借一阵晨风，跑完 21km', '第一次半马，配速 5\'42"，分享路线。', '夜跑阿凯', '@100023', '体态改善打卡', 541, 18, 'pending', '2026-11-05 06:20:00'],
  ['泡沫轴不是越硬越好', '硬度过高会加重筋膜紧张，选中等密度。', '康复小林', '@100087', '泡沫轴日常', 461, 9, 'approved', '2026-11-04 21:10:00'],
  ['宝体跑步遭遇大暴雨，不影响狠狠出片', '雨中跑步的防护与保暖经验。', '康复小林', '@100087', '跑步日常', 210, 31, 'rejected', '2026-11-04 19:02:00'],
  ['久坐 8 小时，肩颈已经不是我自己的了', '三个办公室拉伸动作，随时可做。', '夜跑阿凯', '@100023', '久坐党自救指南', 96, 12, 'approved', '2026-11-04 16:33:00'],
  ['筋膜枪用错部位反而更紧', '避开颈椎、脊柱和关节骨突位置。', '运动达人', '@100001', '筋膜枪怎么用', 207, 6, 'pending', '2026-11-04 14:05:00'],
  ['5 公里又突破啦～', '今天跑进 28 分钟，记录一下。', '运动达人', '@100001', '晨跑打卡', 88, 3, 'approved', '2026-11-03 20:18:00'],
  ['体态改善第 21 天', '圆肩明显改善，附每日训练清单。', '康复小林', '@100087', '体态改善打卡', 66, 4, 'approved', '2026-11-03 18:42:00'],
].map((row, i) => {
  const [title, excerpt, nickname, uid, topic, likeCount, commentCount, reviewStatus, createdAt] =
    row as [string, string, string, string, string, number, number, 'pending' | 'approved' | 'rejected', string]
  return {
    id: String(i + 1),
    title: title as string,
    contentExcerpt: excerpt as string,
    cover: '',
    author: { id: uid as string, nickname: nickname as string, avatar: '' },
    topics: [{ id: String(i + 1), name: topic as string }],
    imageCount: 4,
    likeCount: likeCount as number,
    commentCount: commentCount as number,
    collectCount: 36,
    visibility: 'public' as const,
    status: 'published' as const,
    reviewStatus,
    reviewReason: reviewStatus === 'rejected' ? '含营销导流内容' : '',
    reviewedBy: null,
    reviewedAt: null,
    createdAt,
  }
})

const postDetail = (p: PostListItem): PostDetail => ({
  id: p.id,
  title: p.title,
  content:
    '跑完 10 公里，小腿硬得像石头。今天用泡沫轴滚了 15 分钟，明显松了很多。分享给同样跑后紧张的你们。\n\n我的做法是先用筋膜枪低档放松 3 分钟，再滚泡沫轴；不要直接压最痛的点。\n\n跑后拉伸 10 分钟，第二天明显轻。',
  metric: { icon: 'map-pin', text: '深圳 · 宝安体育中心' },
  images: [
    { url: '', width: 1200, height: 900 },
    { url: '', width: 1200, height: 900 },
    { url: '', width: 1200, height: 900 },
    { url: '', width: 1200, height: 900 },
  ],
  author: p.author,
  topics: p.topics,
  visibility: p.visibility,
  status: p.status,
  reviewStatus: p.reviewStatus,
  reviewReason: p.reviewReason,
  reviewedBy: null,
  reviewedAt: null,
  likeCount: p.likeCount,
  commentCount: p.commentCount,
  collectCount: p.collectCount,
  createdAt: p.createdAt,
  recentComments: [
    { id: '101', user: { id: '100002', nickname: '康复小林', avatar: '' }, content: '同款酸痛，收藏了', createdAt: '2026-11-05 09:41:00' },
    { id: '102', user: { id: '100003', nickname: '夜跑阿凯', avatar: '' }, content: '泡沫轴选硬的还是软的？', createdAt: '2026-11-05 09:02:00' },
    { id: '103', user: { id: '100001', nickname: '运动达人', avatar: '' }, content: '这个动作膝盖会痛吗？', createdAt: '2026-11-05 08:33:00' },
  ],
  auditTrail: [
    { action: '驳回', admin: { id: '1', username: 'admin' }, reason: '含营销导流内容', createdAt: '2026-11-05 10:20:00' },
    { action: '通过', admin: { id: '2', username: 'editor01' }, reason: '', createdAt: '2026-11-05 09:02:00' },
    { action: '提交', admin: { id: '100001', username: '作者' }, reason: '', createdAt: '2026-11-04 22:10:00' },
  ],
})

const comments: CommentListItem[] = [
  ['同款酸痛，收藏了', '康复小林', '@100002', '快乐晨跑', 12, 'normal', '2026-11-05 09:41:00'],
  ['泡沫轴选硬的还是软的？', '夜跑阿凯', '@100003', '快乐晨跑', 5, 'normal', '2026-11-05 09:02:00'],
  ['这个动作膝盖会痛吗？', '运动达人', '@100001', '下肢恢复训练计划', 3, 'normal', '2026-11-05 08:33:00'],
  ['加了微信，私聊发你', '匿名用户', '@—', '快乐晨跑', 0, 'deleted', '2026-11-05 08:10:00'],
  ['跑后拉伸真的有用', '康复小林', '@100002', '借一阵晨风', 8, 'normal', '2026-11-04 22:15:00'],
  ['已阅', '夜跑阿凯', '@100003', '5 公里又突破啦', 1, 'normal', '2026-11-04 20:47:00'],
  ['感谢分享，明天试试', '运动达人', '@100001', '泡沫轴不是越硬越好', 2, 'normal', '2026-11-04 19:28:00'],
  ['广告位招租', '匿名用户', '@—', '快乐晨跑', 0, 'deleted', '2026-11-04 18:06:00'],
  ['同问', '康复小林', '@100002', '筋膜枪用错部位', 0, 'normal', '2026-11-04 16:52:00'],
].map((row, i) => {
  const [content, nickname, uid, postTitle, likeCount, status, createdAt] = row as [
    string, string, string, string, number, 'normal' | 'deleted', string,
  ]
  return {
    id: String(101 + i),
    postId: String(i + 1),
    postTitle,
    user: { id: uid, nickname, avatar: '' },
    content,
    parentId: '',
    replyToUser: null,
    likeCount,
    status,
    createdAt,
  }
})

const users: UserListItem[] = [
  ['运动达人', '100001', 'male', '广东省/深圳市', 12, 340, 56, 1, '10-24', '2026-11-05 08:30:00'],
  ['康复小林', '100002', 'female', '上海市/上海市', 8, 210, 42, 1, '10-25', '2026-11-05 07:50:00'],
  ['夜跑阿凯', '100003', 'male', '广东省/广州市', 15, 541, 88, 1, '10-26', '2026-11-04 22:10:00'],
  ['希希爱跑步呀', '100004', 'female', '浙江省/杭州市', 6, 128, 31, 1, '10-28', '2026-11-04 20:05:00'],
  ['久坐打工人', '100005', 'secret', '北京市/北京市', 2, 12, 4, 0, '10-30', '2026-11-02 09:12:00'],
  ['泡沫轴爱好者', '100006', 'female', '四川省/成都市', 9, 96, 22, 1, '11-01', '2026-11-05 09:01:00'],
  ['晨跑小分队', '100007', 'male', '江苏省/南京市', 4, 33, 9, 1, '11-02', '2026-11-04 18:44:00'],
  ['术后康复中', '100008', 'secret', '湖北省/武汉市', 1, 5, 2, 1, '11-03', '2026-11-05 06:12:00'],
].map((row, i) => {
  const [nickname, id, gender, city, postCount, likeCount, followerCount, status, reg, lastLoginAt] =
    row as [string, string, 'male' | 'female' | 'secret', string, number, number, number, 0 | 1, string, string]
  return {
    id,
    nickname,
    avatar: '',
    gender,
    city,
    status,
    postCount,
    likeCount,
    followerCount,
    lastLoginAt,
    createdAt: `2026-${reg} 10:00:00`,
  }
})

const userDetail = (u: UserListItem): UserDetail => ({
  ...u,
  birthday: null,
  bio: '',
  openidMasked: 'oX7d2k****9fQ',
  profileVisibility: 'public',
  stats: { posts: u.postCount, likesReceived: u.likeCount, followers: u.followerCount, following: 12 },
  bodyProfile: { filled: 5, total: 7, hasInjuries: false },
  collections: { post: 3, course: 2, product: 1 },
  recentPosts: posts.slice(0, 5).map((p) => ({
    id: p.id,
    title: p.title,
    status: p.status,
    createdAt: p.createdAt,
  })),
})

const topics: TopicListItem[] = [
  ['跑后拉伸挑战', '每天 10 分钟，跑后不再硬邦邦', 34000, 12000, true, 100],
  ['久坐党自救指南', '办公室也能做的肩颈放松', 18200, 6400, true, 90],
  ['泡沫轴日常', '滚一滚，肌肉松一半', 12800, 4100, true, 80],
  ['筋膜枪怎么用', '避开骨头，顺着肌肉走向', 9600, 3200, false, 60],
  ['体态改善打卡', '每天 5 分钟，站得更直', 8400, 2800, false, 50],
  ['增肌恢复餐', '练后 30 分钟的补给', 3200, 1100, false, 40],
  ['晨跑打卡', '早起的人先享受世界', 1280, 420, false, 30],
  ['跑鞋怎么选', '缓震、支撑、落地方式', 960, 380, false, 20],
  ['术后康复日记', '记录每一步恢复', 420, 160, false, 10],
].map((row, i) => {
  const [name, description, postCount, userCount, isHot, sort] = row as [string, string, number, number, boolean, number]
  return {
    id: String(i + 1),
    name,
    description,
    postCount,
    userCount,
    isHot,
    sort,
    createdAt: '2026-10-24 10:00:00',
    updatedAt: '2026-11-05 09:00:00',
  }
})

const courses: CourseListItem[] = [
  ['下肢恢复训练计划', 'rehab', 'beginner', 1080, 12, 12000, 820, true, 100, 1, 12],
  ['筋膜枪放松教程', 'recovery', 'beginner', 261, 4, 8600, 310, false, 90, 1, 6],
  ['跑后小腿放松 10 分钟', 'recovery', 'beginner', 600, 6, 6100, 220, false, 80, 1, 5],
  ['肩颈舒缓序列', 'posture', 'middle', 750, 8, 5200, 180, false, 70, 1, 7],
  ['泡沫轴全身放松', 'stretch', 'beginner', 900, 9, 4300, 150, false, 60, 1, 8],
  ['核心稳定进阶', 'rehab', 'advanced', 1200, 10, 2100, 90, false, 50, 0, 6],
].map((row, i) => {
  const [title, category, difficulty, duration, actionCount, learnCount, collectCount, isMain, sort, status, chapterCount] =
    row as [string, CourseListItem['category'], CourseListItem['difficulty'], number, number, number, number, boolean, number, 0 | 1, number]
  return {
    id: String(i + 1),
    title,
    cover: '',
    duration,
    actionCount,
    difficulty,
    category,
    coachName: '陈医生',
    learnCount,
    collectCount,
    isMain,
    sort,
    status,
    chapterCount,
    updatedAt: '2026-11-05 09:00:00',
  }
})

const courseDetail = (c: CourseListItem): CourseDetail => ({
  ...c,
  videoCover: '',
  coach: { name: '陈医生', avatar: '', title: '康复训练师 · 认证' },
  intro: '针对下肢术后与久坐人群设计的恢复序列，循序渐进。',
  suitableFor: ['久坐人群', '跑后恢复', '下肢紧张'],
  relatedIds: ['2', '3', '4'],
  related: courses.slice(1, 4).map((x) => ({ id: x.id, title: x.title, cover: '', duration: x.duration })),
  chapters: Array.from({ length: c.chapterCount }).map((_, i) => ({
    id: String(i + 1),
    idx: i + 1,
    title: ['热身与呼吸', '踝泵与小腿放松', '靠墙静蹲', '单腿硬拉', '泡沫轴放松', '拉伸收尾'][i % 6] + (i > 5 ? `（${i + 1}）` : ''),
    duration: [180, 300, 240, 300, 360, 180][i % 6],
    videoUrl: `https://video.jianheng.cn/c${i + 1}.mp4`,
    locked: i > 1,
  })),
  createdAt: '2026-10-20 10:00:00',
})

const products: ProductListItem[] = [
  ['空气压力波按摩仪', 'APM-200', 'rehab', '专业腿部放松恢复 · 双腔气囊', ['热门', '康复治疗'], 4, 210, 100, 1],
  ['筋膜枪', 'MG-100', 'recovery', '深层肌肉放松 · 多档变速调节', ['热门'], 4, 180, 90, 1],
  ['电动泡沫轴', 'FR-300', 'recovery', '震动放松 · 四档强度', ['新品'], 4, 120, 80, 1],
  ['BFR 血流加压带', 'BFR-50', 'rehab', '血流限制训练 · 可调压力', ['专业'], 4, 86, 70, 1],
  ['便携气体检测仪', 'GAS-10', 'portable', '运动环境监测 · 轻巧便携', ['便携'], 4, 42, 60, 0],
].map((row, i) => {
  const [name, model, category, tagline, tags, imageCount, collectCount, sort, status] =
    row as [string, string, ProductListItem['category'], string, string[], number, number, number, 0 | 1]
  return {
    id: String(i + 1),
    name,
    model,
    category,
    tagline,
    tags,
    cover: '',
    imageCount,
    collectCount,
    sort,
    status,
    updatedAt: '2026-11-05 09:00:00',
  }
})

const productDetail = (p: ProductListItem): ProductDetail => ({
  ...p,
  images: ['', '', '', ''],
  features: [
    { icon: 'layers', title: '双腔分压', desc: '左右腿独立气室，压力可分区调节' },
    { icon: 'timer', title: '三档定时', desc: '15/30/45 分钟自动停止' },
    { icon: 'feather', title: '轻量便携', desc: '折叠后仅 1.2kg' },
  ],
  specs: [
    { label: '额定电压', value: 'DC 12V' },
    { label: '额定功率', value: '30W' },
    { label: '气室数量', value: '2' },
    { label: '压力范围', value: '20–120mmHg' },
    { label: '定时', value: '15/30/45min' },
    { label: '噪音', value: '≤45dB' },
    { label: '重量', value: '1.2kg' },
    { label: '尺寸', value: '280×180×120mm' },
    { label: '保修', value: '1 年' },
  ],
  suitableFor: ['久坐人群', '运动爱好者', '术后康复'],
  video: { cover: '', url: 'https://video.jianheng.cn/apm200.mp4', duration: 180 },
  relatedIds: ['2', '3', '4'],
  related: products.slice(1, 4).map((x) => ({ id: x.id, name: x.name, cover: '' })),
  createdAt: '2026-10-20 10:00:00',
})

const auditLogs: AuditLog[] = [
  ['11-05 10:20:31', 'admin', '超级管理员', 'post', 'post.review_reject', 'post', '13', '#13 快乐晨跑', '含营销导流内容', '8f3c1a2b', { status: 'published', reviewStatus: 'pending' }, { status: 'hidden', reviewStatus: 'rejected', reviewReason: '含营销导流内容' }],
  ['11-05 10:05:12', 'editor01', '内容编辑', 'course', 'course.update', 'course', '1', '#1 下肢恢复训练计划', '', '2a7d9e1c', null, { title: '下肢恢复训练计划', sort: 100 }],
  ['11-05 09:50:44', 'admin', '超级管理员', 'user', 'user.status', 'user', '100005', '#100005 久坐打工人', '多次广告评论', '5e2b8f3a', { status: 1 }, { status: 0 }],
  ['11-05 09:30:10', 'editor01', '内容编辑', 'product', 'product.images', 'product', '1', '#1 空气压力波按摩仪', '', 'f9a3c2e7', null, { imageCount: 4 }],
  ['11-05 09:12:55', 'admin', '超级管理员', 'auth', 'auth.login', 'admin', '1', 'admin', '', '7b1c4d9e', null, null],
  ['11-05 08:40:03', 'editor01', '内容编辑', 'auth', 'auth.login', 'admin', '2', 'editor01', '', 'a1b2c3d4', null, null],
  ['11-05 08:30:27', 'editor01', '内容编辑', 'comment', 'comment.delete', 'comment', '101', '#101 同款酸痛，收藏了', '广告', 'c3d4e5f6', { status: 'normal' }, { status: 'deleted' }],
  ['11-04 22:10:18', 'admin', '超级管理员', 'topic', 'topic.update', 'topic', '1', '#1 跑后拉伸挑战', '', 'd5e6f7a8', null, { sort: 100 }],
].map((row, i) => {
  const [createdAt, username, nickname, module, action, targetType, targetId, targetLabel, reason, requestId, before, after] =
    row as [string, string, string, AuditLog['module'], string, string, string, string, string, string, Record<string, unknown> | null, Record<string, unknown> | null]
  return {
    id: String(i + 1),
    admin: { id: username === 'admin' ? '1' : '2', username, nickname },
    module,
    action,
    targetType,
    targetId,
    targetLabel,
    reason,
    ip: '10.0.12.31',
    requestId,
    before,
    after,
    createdAt: `2026-${createdAt}:00`,
  }
})

const trend = [
  { date: '10-30', users: 9, posts: 6, comments: 22 },
  { date: '10-31', users: 14, posts: 11, comments: 30 },
  { date: '11-01', users: 7, posts: 4, comments: 18 },
  { date: '11-02', users: 18, posts: 15, comments: 41 },
  { date: '11-03', users: 11, posts: 9, comments: 27 },
  { date: '11-04', users: 16, posts: 12, comments: 35 },
  { date: '11-05', users: 12, posts: 8, comments: 31 },
]

const meta: MetaOptions = {
  postStatus: [
    { label: '已发布', value: 'published' },
    { label: '已隐藏', value: 'hidden' },
    { label: '已删除', value: 'deleted' },
  ],
  reviewStatus: [
    { label: '待审核', value: 'pending' },
    { label: '已通过', value: 'approved' },
    { label: '已驳回', value: 'rejected' },
  ],
  courseCategories: [
    { label: '康复训练', value: 'rehab' },
    { label: '放松恢复', value: 'recovery' },
    { label: '体态改善', value: 'posture' },
    { label: '拉伸舒展', value: 'stretch' },
  ],
  difficulties: [
    { label: '入门', value: 'beginner' },
    { label: '进阶', value: 'middle' },
    { label: '高阶', value: 'advanced' },
  ],
  productCategories: [
    { label: '运动康复', value: 'rehab' },
    { label: '运动恢复', value: 'recovery' },
    { label: '便携设备', value: 'portable' },
  ],
  roles: [
    { label: '超级管理员', value: 'super' },
    { label: '管理员', value: 'admin' },
  ],
  limits: {
    pageSizeMax: 100,
    courseChaptersMax: 30,
    productImagesMax: 4,
    productSpecsMax: 12,
    postReasonMax: 100,
    uploadMaxMB: 5,
    uploadMaxCount: 9,
  },
}

let password = 'Admin@123456'

function paginate<T>(list: T[], params: Record<string, any>) {
  const page = Number(params.page || 1)
  const size = Number(params.size || 20)
  const start = (page - 1) * size
  return {
    list: list.slice(start, start + size),
    total: list.length,
    page,
    size,
    hasMore: start + size < list.length,
  }
}

const match = (pattern: RegExp, url: string) => pattern.exec(url)

function handle(method: string, url: string, params: Record<string, any>, body: any): any {
  const m = method.toLowerCase()

  if (m === 'post' && url === '/admin/auth/login') {
    const ok = body?.username && body?.password === password
    if (!ok) return fail(40001, '用户名或密码错误')
    const admin = admins.find((a) => a.username === body.username)
    if (!admin) return fail(40001, '用户名或密码错误')
    if (admin.status === 0) return fail(40302, '账号已停用，请联系超级管理员')
    return {
      token: `mock.${admin.username}.${Date.now()}`,
      expiresIn: 28800,
      mustChangePassword: admin.mustChangePassword,
      admin: profile(admin),
    }
  }

  if (m === 'get' && url === '/admin/auth/me') {
    const admin = admins[0]
    return profile(admin)
  }

  if (m === 'put' && url === '/admin/auth/password') {
    if (body?.oldPassword !== password) return fail(42201, '原密码不正确')
    password = body.newPassword
    return { token: `mock.admin.${Date.now()}`, expiresIn: 28800 }
  }

  if (m === 'get' && url === '/admin/stats/overview') {
    return {
      totals: { users: 1280, posts: 436, comments: 2210, topics: 12, courses: 6, products: 5, admins: 3 },
      pending: { posts: posts.filter((p) => p.reviewStatus === 'pending').length, hiddenPosts: 3, disabledUsers: 1 },
      today: { newUsers: 12, newPosts: 8, newComments: 31, reviews: 7 },
      trend,
    }
  }

  if (m === 'get' && url === '/admin/meta/options') return meta

  if (m === 'get' && url === '/admin/admins') {
    let list = admins
    if (params.keyword) list = list.filter((a) => a.username.includes(params.keyword) || a.nickname.includes(params.keyword))
    if (params.role) list = list.filter((a) => a.role === params.role)
    if (params.status !== undefined && params.status !== '') list = list.filter((a) => a.status === Number(params.status))
    return paginate(list, params)
  }
  if (m === 'post' && url === '/admin/admins') {
    if (admins.some((a) => a.username === body.username)) return fail(40902, '用户名已存在')
    const item: AdminListItem = {
      id: nextId(),
      username: body.username,
      nickname: body.nickname,
      role: body.role,
      status: 1,
      mustChangePassword: !body.password,
      remark: body.remark || '',
      lastLoginAt: '',
      createdAt: '2026-11-05 12:00:00',
    }
    admins.push(item)
    return { admin: item, tempPassword: body.password ? undefined : 'Tmp#9xK2mQ4p' }
  }

  let hit = match(/^\/admin\/admins\/([^/]+)\/reset-password$/, url)
  if (m === 'post' && hit) {
    const admin = admins.find((a) => a.id === hit![1])
    if (!admin) return fail(40401, '管理员不存在')
    admin.mustChangePassword = true
    return { username: admin.username, tempPassword: 'R9v#tY2nC4dF', mustChangePassword: true, expiresHint: '首次登录后必须修改' }
  }
  hit = match(/^\/admin\/admins\/([^/]+)$/, url)
  if (hit) {
    const admin = admins.find((a) => a.id === hit![1])
    if (!admin) return fail(40401, '管理员不存在')
    if (m === 'get') return { ...admin, lastLoginIp: '10.0.12.31', passwordChangedAt: null }
    if (m === 'patch') {
      Object.assign(admin, body)
      return { ...admin, lastLoginIp: '10.0.12.31', passwordChangedAt: null }
    }
  }

  if (m === 'get' && url === '/admin/posts') {
    let list = posts
    if (params.reviewStatus) list = list.filter((p) => p.reviewStatus === params.reviewStatus)
    if (params.status) list = list.filter((p) => p.status === params.status)
    if (params.keyword) list = list.filter((p) => p.title.includes(params.keyword) || p.author.nickname.includes(params.keyword))
    if (params.authorId) list = list.filter((p) => p.author.id === params.authorId)
    return paginate(list, params)
  }
  hit = match(/^\/admin\/posts\/([^/]+)\/review$/, url)
  if (m === 'post' && hit) {
    const post = posts.find((p) => p.id === hit![1])
    if (!post) return fail(40401, '帖子不存在')
    const action = body?.action
    if (action === 'reject' && (!body.reason || String(body.reason).trim().length < 2)) {
      return fail(42201, '请填写驳回原因')
    }
    post.reviewStatus = action === 'reject' ? 'rejected' : 'approved'
    post.reviewReason = action === 'reject' ? body.reason : ''
    return {
      post: {
        id: post.id,
        status: post.status,
        reviewStatus: post.reviewStatus,
        reviewReason: post.reviewReason,
        reviewedBy: { id: '1', username: 'admin' },
        reviewedAt: now,
      },
      changed: true,
    }
  }
  hit = match(/^\/admin\/posts\/([^/]+)$/, url)
  if (hit) {
    const post = posts.find((p) => p.id === hit![1])
    if (!post) return fail(40401, '帖子不存在')
    if (m === 'get') return postDetail(post)
    if (m === 'delete') {
      const idx = posts.findIndex((p) => p.id === post.id)
      posts.splice(idx, 1)
      return { deleted: true, affectedComments: post.commentCount }
    }
  }

  if (m === 'get' && url === '/admin/comments') {
    let list = comments
    if (params.status) list = list.filter((c) => c.status === params.status)
    if (params.keyword) list = list.filter((c) => c.content.includes(params.keyword))
    if (params.postId) list = list.filter((c) => c.postId === params.postId)
    return paginate(list, params)
  }
  hit = match(/^\/admin\/comments\/([^/]+)$/, url)
  if (m === 'delete' && hit) {
    const c = comments.find((x) => x.id === hit![1])
    if (!c) return fail(40401, '评论不存在')
    c.status = 'deleted'
    return { deleted: true, affected: 3 }
  }

  if (m === 'get' && url === '/admin/users') {
    let list = users
    if (params.keyword) list = list.filter((u) => u.nickname.includes(params.keyword) || u.id.includes(params.keyword))
    if (params.status !== undefined && params.status !== '') list = list.filter((u) => u.status === Number(params.status))
    return paginate(list, params)
  }
  hit = match(/^\/admin\/users\/([^/]+)\/status$/, url)
  if (m === 'patch' && hit) {
    const u = users.find((x) => x.id === hit![1])
    if (!u) return fail(40401, '用户不存在')
    if (body.status === 0 && !body.reason) return fail(42201, '请填写禁用原因')
    u.status = body.status
    return { userId: u.id, status: u.status, changed: true }
  }
  hit = match(/^\/admin\/users\/([^/]+)$/, url)
  if (m === 'get' && hit) {
    const u = users.find((x) => x.id === hit![1])
    if (!u) return fail(40401, '用户不存在')
    return userDetail(u)
  }

  if (m === 'get' && url === '/admin/topics') {
    let list = topics
    if (params.keyword) list = list.filter((t) => t.name.includes(params.keyword))
    if (params.isHot !== undefined && params.isHot !== '') list = list.filter((t) => t.isHot === (params.isHot === true || params.isHot === 'true'))
    list = [...list].sort((a, b) => b.sort - a.sort)
    return paginate(list, params)
  }
  if (m === 'post' && url === '/admin/topics') {
    if (topics.some((t) => t.name === body.name)) return fail(40901, '话题名称已存在')
    const item: TopicListItem = {
      id: nextId(), name: body.name, description: body.description || '',
      postCount: 0, userCount: 0, isHot: Boolean(body.isHot), sort: Number(body.sort || 0),
      createdAt: now, updatedAt: now,
    }
    topics.unshift(item)
    return { topic: item }
  }
  hit = match(/^\/admin\/topics\/([^/]+)$/, url)
  if (hit) {
    const t = topics.find((x) => x.id === hit![1])
    if (!t) return fail(40401, '话题不存在')
    if (m === 'patch') {
      Object.assign(t, body, { updatedAt: now })
      return { topic: t }
    }
    if (m === 'delete') {
      if (t.postCount > 0) return fail(40904, `话题下仍有 ${t.postCount} 条帖子，不能删除`)
      topics.splice(topics.indexOf(t), 1)
      return { deleted: true, topicId: t.id }
    }
  }

  if (m === 'get' && url === '/admin/courses') {
    let list = courses
    if (params.keyword) list = list.filter((c) => c.title.includes(params.keyword))
    if (params.category) list = list.filter((c) => c.category === params.category)
    if (params.difficulty) list = list.filter((c) => c.difficulty === params.difficulty)
    if (params.status !== undefined && params.status !== '') list = list.filter((c) => c.status === Number(params.status))
    if (params.isMain !== undefined && params.isMain !== '') list = list.filter((c) => c.isMain === (params.isMain === true || params.isMain === 'true'))
    return paginate(list, params)
  }
  if (m === 'post' && url === '/admin/courses') {
    const item: CourseListItem = {
      id: nextId(), title: body.title, cover: body.cover || '', duration: 0, actionCount: 0,
      difficulty: body.difficulty, category: body.category, coachName: body.coachName || '',
      learnCount: 0, collectCount: 0, isMain: Boolean(body.isMain), sort: Number(body.sort || 0),
      status: 1, chapterCount: body.chapters?.length || 0, updatedAt: now,
    }
    courses.unshift(item)
    return { course: { id: item.id, title: item.title, status: item.status } }
  }
  hit = match(/^\/admin\/courses\/([^/]+)\/status$/, url)
  if (m === 'patch' && hit) {
    const c = courses.find((x) => x.id === hit![1])
    if (!c) return fail(40401, '课程不存在')
    c.status = body.status
    return { courseId: c.id, status: c.status, changed: true }
  }
  hit = match(/^\/admin\/courses\/([^/]+)\/chapters$/, url)
  if (m === 'put' && hit) {
    const c = courses.find((x) => x.id === hit![1])
    if (!c) return fail(40401, '课程不存在')
    const chapters = (body.chapters || []).map((ch: any, i: number) => ({
      id: String(i + 1), idx: i + 1, title: ch.title, duration: ch.duration,
      videoUrl: ch.videoUrl || '', locked: Boolean(ch.locked),
    }))
    c.chapterCount = chapters.length
    c.duration = chapters.reduce((s: number, ch: any) => s + ch.duration, 0)
    return { chapters, duration: c.duration, actionCount: chapters.length }
  }
  hit = match(/^\/admin\/courses\/([^/]+)$/, url)
  if (hit) {
    const c = courses.find((x) => x.id === hit![1])
    if (!c) return fail(40401, '课程不存在')
    if (m === 'get') return courseDetail(c)
    if (m === 'patch') {
      Object.assign(c, body, { updatedAt: now })
      return { course: { id: c.id, title: c.title, status: c.status } }
    }
  }

  if (m === 'get' && url === '/admin/products') {
    let list = products
    if (params.keyword) list = list.filter((p) => p.name.includes(params.keyword) || p.model.includes(params.keyword))
    if (params.category) list = list.filter((p) => p.category === params.category)
    if (params.status !== undefined && params.status !== '') list = list.filter((p) => p.status === Number(params.status))
    return paginate(list, params)
  }
  if (m === 'post' && url === '/admin/products') {
    const item: ProductListItem = {
      id: nextId(), name: body.name, model: body.model || '', category: body.category,
      tagline: body.tagline || '', tags: body.tags || [], cover: body.images?.[0] || '',
      imageCount: body.images?.length || 0, collectCount: 0, sort: Number(body.sort || 0),
      status: 1, updatedAt: now,
    }
    products.unshift(item)
    return { product: { id: item.id, name: item.name, status: item.status, imageCount: item.imageCount } }
  }
  hit = match(/^\/admin\/products\/([^/]+)\/status$/, url)
  if (m === 'patch' && hit) {
    const p = products.find((x) => x.id === hit![1])
    if (!p) return fail(40401, '产品不存在')
    p.status = body.status
    return { productId: p.id, status: p.status, changed: true }
  }
  hit = match(/^\/admin\/products\/([^/]+)\/images$/, url)
  if (m === 'put' && hit) {
    const p = products.find((x) => x.id === hit![1])
    if (!p) return fail(40401, '产品不存在')
    p.imageCount = body.images?.length || 0
    p.cover = body.images?.[0] || ''
    return { productId: p.id, images: body.images || [], imageCount: p.imageCount, cover: p.cover, changed: true }
  }
  hit = match(/^\/admin\/products\/([^/]+)$/, url)
  if (hit) {
    const p = products.find((x) => x.id === hit![1])
    if (!p) return fail(40401, '产品不存在')
    if (m === 'get') return productDetail(p)
    if (m === 'patch') {
      Object.assign(p, body, { updatedAt: now })
      return { product: { id: p.id, name: p.name, status: p.status } }
    }
  }

  if (m === 'post' && url === '/admin/upload/images') {
    return {
      items: [
        { url: '', width: 1200, height: 900, size: 183400, mime: 'image/jpeg' },
      ],
    }
  }

  if (m === 'get' && url === '/admin/audit-logs') {
    let list = auditLogs
    if (params.module) list = list.filter((l) => l.module === params.module)
    if (params.action) list = list.filter((l) => l.action.includes(params.action))
    if (params.adminId) list = list.filter((l) => l.admin.id === params.adminId)
    return paginate(list, params)
  }

  return fail(40401, `Mock 未实现：${method} ${url}`)
}

let requestSeq = 0

export const mockAdapter: AxiosAdapter = (config: AxiosRequestConfig) =>
  new Promise((resolve, reject) => {
    const delay = 180 + Math.random() * 220
    setTimeout(() => {
      const method = (config.method || 'get').toUpperCase()
      const url = (config.url || '').replace(config.baseURL || '', '')
      let body: any = config.data
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body)
        } catch {
          body = {}
        }
      }
      const params = (config.params || {}) as Record<string, any>
      const requestId = (config.headers?.['X-Request-Id'] as string) || `mock${++requestSeq}`

      const result = handle(method, url, params, body || {})
      const isFail = result && result.__fail
      const payload = isFail
        ? { code: result.__fail.code, message: result.__fail.message, data: null, requestId }
        : { code: 0, message: 'ok', data: result ?? null, requestId }

      const response: AxiosResponse = {
        data: payload,
        status: 200,
        statusText: 'OK',
        headers: { 'x-request-id': requestId },
        config: config as AxiosResponse['config'],
      }
      if (payload.code === 0) resolve(response)
      else reject({ isAxiosError: true, response, config, message: payload.message })
    }, delay)
  })
