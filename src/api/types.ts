import type { Option } from '@/types/api'

export type AdminRole = 'super' | 'admin'
export type PostStatus = 'published' | 'hidden' | 'deleted'
export type ReviewStatus = 'pending' | 'approved' | 'rejected'
// 分类与难度均来自后台「筛选条目」字典，允许管理员自定义，因此不再收窄为字面量
export type CourseCategory = string
export type Difficulty = string
export type ProductCategory = string
export type Gender = 'male' | 'female' | 'secret'
export type Visibility = 'public' | 'followers'

export interface AdminProfile {
  id: string
  username: string
  nickname: string
  role: AdminRole
  status: 0 | 1
  mustChangePassword: boolean
  permissions: string[]
  remark?: string
  lastLoginAt: string
  createdAt?: string
  lastLoginIp?: string
  passwordChangedAt?: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  expiresIn: number
  mustChangePassword: boolean
  admin: AdminProfile
}

export interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
}

export interface ChangePasswordResponse {
  token: string
  expiresIn: number
}

export interface OverviewTotals {
  users: number
  posts: number
  comments: number
  topics: number
  courses: number
  products: number
  admins: number
}

export interface OverviewPending {
  posts: number
  hiddenPosts: number
  disabledUsers: number
}

export interface OverviewToday {
  newUsers: number
  newPosts: number
  newComments: number
  reviews: number
}

export interface TrendPoint {
  date: string
  users: number
  posts: number
  comments: number
}

export interface Overview {
  totals: OverviewTotals
  pending: OverviewPending
  today: OverviewToday
  trend: TrendPoint[]
}

export interface AdminListItem {
  id: string
  username: string
  nickname: string
  role: AdminRole
  status: 0 | 1
  mustChangePassword: boolean
  remark: string
  lastLoginAt: string
  createdAt: string
}

export interface AdminDetail extends AdminListItem {
  lastLoginIp: string
  passwordChangedAt: string | null
}

export interface AdminCreateRequest {
  username: string
  nickname: string
  role: AdminRole
  password?: string
  remark?: string
}

export interface AdminCreateResponse {
  admin: AdminListItem
  tempPassword?: string
}

export interface AdminUpdateRequest {
  nickname?: string
  role?: AdminRole
  status?: 0 | 1
  remark?: string
}

export interface AdminResetPasswordResponse {
  username: string
  tempPassword: string
  mustChangePassword: true
  expiresHint: string
}

export interface AuthorBrief {
  id: string
  nickname: string
  avatar: string
}

export interface TopicBrief {
  id: string
  name: string
}

export interface ImageItem {
  url: string
  width: number
  height: number
}

export interface Metric {
  icon: 'map-pin' | 'timer'
  text: string
}

export interface PostListItem {
  id: string
  title: string
  contentExcerpt: string
  cover: string
  author: AuthorBrief
  topics: TopicBrief[]
  imageCount: number
  likeCount: number
  commentCount: number
  collectCount: number
  visibility: Visibility
  status: PostStatus
  reviewStatus: ReviewStatus
  reviewReason: string
  reviewedBy: { id: string; username: string } | null
  reviewedAt: string | null
  createdAt: string
}

export interface PostDetail {
  id: string
  title: string
  content: string
  cover: string
  metric: Metric | null
  images: ImageItem[]
  author: AuthorBrief
  topics: TopicBrief[]
  visibility: Visibility
  status: PostStatus
  reviewStatus: ReviewStatus
  reviewReason: string
  reviewedBy: { id: string; username: string } | null
  reviewedAt: string | null
  likeCount: number
  commentCount: number
  collectCount: number
  createdAt: string
  recentComments: Array<{ id: string; user: AuthorBrief; content: string; createdAt: string }>
  auditTrail: Array<{
    action: string
    admin: { id: string; username: string }
    reason: string
    createdAt: string
  }>
}

export type ReviewAction = 'approve' | 'reject' | 'restore'

export interface ReviewRequest {
  action: ReviewAction
  reason?: string
}

export interface ReviewResponse {
  post: {
    id: string
    status: PostStatus
    reviewStatus: ReviewStatus
    reviewReason: string
    reviewedBy: { id: string; username: string } | null
    reviewedAt: string | null
  }
  changed: boolean
}

export interface CommentListItem {
  id: string
  postId: string
  postTitle: string
  user: AuthorBrief
  content: string
  parentId: string
  replyToUser: AuthorBrief | null
  likeCount: number
  status: 'normal' | 'deleted'
  createdAt: string
}

export interface CommentDeleteResponse {
  deleted: true
  affected: number
}

export interface UserListItem {
  id: string
  nickname: string
  avatar: string
  gender: Gender
  city: string
  status: 0 | 1
  postCount: number
  likeCount: number
  followerCount: number
  lastLoginAt: string
  createdAt: string
}

export interface UserDetail {
  id: string
  nickname: string
  avatar: string
  gender: Gender
  birthday: string | null
  city: string
  bio: string
  openidMasked: string
  status: 0 | 1
  profileVisibility: 'self' | 'followers' | 'public'
  createdAt: string
  lastLoginAt: string
  stats: { posts: number; likesReceived: number; followers: number; following: number }
  bodyProfile: { filled: number; total: number; hasInjuries: boolean }
  collections: { post: number; course: number; product: number }
  recentPosts: Array<{ id: string; title: string; status: PostStatus; createdAt: string }>
}

export interface UserStatusRequest {
  status: 0 | 1
  reason?: string
}

export interface UserStatusResponse {
  userId: string
  status: 0 | 1
  changed: boolean
}

export interface TopicListItem {
  id: string
  name: string
  description: string
  postCount: number
  userCount: number
  isHot: boolean
  sort: number
  createdAt: string
  updatedAt: string
}

export interface TopicCreateRequest {
  name: string
  description?: string
  isHot?: boolean
  sort?: number
}

export type TopicUpdateRequest = Partial<TopicCreateRequest>

export interface TopicMutationResponse {
  topic: TopicListItem
}

export interface TopicDeleteResponse {
  deleted: true
  topicId: string
}

export interface Coach {
  name: string
  avatar: string
  title: string
}

export interface Chapter {
  id: string
  idx: number
  title: string
  duration: number
  videoUrl: string
  locked: boolean
}

export interface ChapterInput {
  title: string
  duration: number
  videoUrl?: string
  locked?: boolean
}

export interface RelatedCourse {
  id: string
  title: string
  cover: string
  duration?: number
}

export interface CourseListItem {
  id: string
  title: string
  cover: string
  duration: number
  actionCount: number
  difficulty: Difficulty
  category: CourseCategory
  tags: string[]
  coachName: string
  learnCount: number
  collectCount: number
  isMain: boolean
  sort: number
  status: 0 | 1
  chapterCount: number
  updatedAt: string
}

export interface CourseDetail extends CourseListItem {
  videoCover: string
  coach: Coach
  intro: string
  suitableFor: string[]
  relatedIds: string[]
  related: RelatedCourse[]
  chapters: Chapter[]
  createdAt: string
}

export interface CourseCreateRequest {
  title: string
  cover: string
  videoCover?: string
  difficulty: Difficulty
  category: CourseCategory
  tags?: string[]
  coachName?: string
  coachAvatar?: string
  coachTitle?: string
  intro?: string
  suitableFor?: string[]
  relatedIds?: string[]
  isMain?: boolean
  sort?: number
  status?: 0 | 1
  chapters?: ChapterInput[]
}

export type CourseUpdateRequest = Partial<Omit<CourseCreateRequest, 'chapters' | 'status'>>

export interface StatusRequest {
  status: 0 | 1
  reason?: string
}

export interface StatusResponse {
  courseId?: string
  productId?: string
  status: 0 | 1
  changed: boolean
}

export interface ChaptersReplaceRequest {
  chapters: ChapterInput[]
}

export interface ChaptersReplaceResponse {
  chapters: Chapter[]
  duration: number
  actionCount: number
}

export interface CourseMutationResponse {
  course: {
    id: string
    title: string
    status: 0 | 1
    category?: CourseCategory
    duration?: number
    actionCount?: number
    createdAt?: string
    updatedAt?: string
  }
}

export interface Feature {
  icon: string
  title: string
  desc: string
}

export interface Spec {
  label: string
  value: string
}

export interface ProductVideo {
  cover: string
  url: string
  duration: number
}

export interface RelatedProduct {
  id: string
  name: string
  cover: string
}

export interface ProductListItem {
  id: string
  name: string
  model: string
  category: ProductCategory
  tagline: string
  tags: string[]
  cover: string
  imageCount: number
  collectCount: number
  sort: number
  status: 0 | 1
  updatedAt: string
}

export interface ProductDetail extends ProductListItem {
  images: string[]
  features: Feature[]
  specs: Spec[]
  suitableFor: string[]
  video: ProductVideo
  relatedIds: string[]
  related: RelatedProduct[]
  createdAt: string
}

export interface ProductCreateRequest {
  name: string
  model?: string
  category: ProductCategory
  tagline?: string
  tags?: string[]
  features?: Feature[]
  specs?: Spec[]
  suitableFor?: string[]
  videoCover?: string
  videoUrl?: string
  videoDuration?: number
  relatedIds?: string[]
  images: string[]
  sort?: number
  status?: 0 | 1
}

export type ProductUpdateRequest = Partial<Omit<ProductCreateRequest, 'images' | 'status'>>

export interface ProductImagesRequest {
  images: string[]
}

export interface ProductImagesResponse {
  productId: string
  images: string[]
  imageCount: number
  cover: string
  changed: boolean
}

export interface ProductMutationResponse {
  product: {
    id: string
    name: string
    status: 0 | 1
    category?: ProductCategory
    cover?: string
    imageCount?: number
    createdAt?: string
    updatedAt?: string
  }
}

export interface UploadItem {
  url: string
  width: number
  height: number
  size: number
  mime: string
}

export interface UploadResponse {
  items: UploadItem[]
}

export type AuditModule =
  | 'auth'
  | 'admin'
  | 'post'
  | 'comment'
  | 'user'
  | 'topic'
  | 'course'
  | 'product'
  | 'upload'

export interface AuditLog {
  id: string
  admin: { id: string; username: string; nickname: string }
  module: AuditModule
  action: string
  targetType: string
  targetId: string | null
  targetLabel: string
  reason: string
  ip: string
  requestId: string
  before: Record<string, unknown> | null
  after: Record<string, unknown> | null
  createdAt: string
}

export interface MetaItem {
  id: string
  group: string
  groupLabel: string
  value: string
  label: string
  sort: number
  status: 0 | 1
}

export interface MetaItemCreateRequest {
  group: string
  value: string
  label?: string
  sort?: number
}

export type MetaItemUpdateRequest = Partial<MetaItemCreateRequest> & { status?: 0 | 1 }

export interface MetaItemListResponse {
  list: MetaItem[]
}

export interface TagSuggestResponse {
  tags: string[]
}

export interface PostUpdateRequest {
  title?: string
  content?: string
  cover?: string
  visibility?: Visibility
  topicIds?: string[]
  metric?: Metric | null
  images?: Array<{ url: string; width?: number; height?: number }>
}

export interface PostUpdateResponse {
  post: PostListItem
}

export interface MetaOptions {
  postStatus: Option<PostStatus>[]
  reviewStatus: Option<ReviewStatus>[]
  courseCategories: Option<CourseCategory>[]
  difficulties: Option<Difficulty>[]
  productCategories: Option<ProductCategory>[]
  productTags: Option<string>[]
  courseTags: Option<string>[]
  roles: Option<AdminRole>[]
  groups: Option<string>[]
  limits: {
    pageSizeMax: number
    courseChaptersMax: number
    productImagesMax: number
    productSpecsMax: number
    postReasonMax: number
    uploadMaxMB: number
    uploadMaxCount: number
  }
}
