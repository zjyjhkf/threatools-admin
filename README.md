# 健衡运动社区 · 管理端 1.0

Vue 3 + Vite + TypeScript + Element Plus 的桌面管理端。与小程序端共用同一 FastAPI 和同一 MySQL。

## 快速开始

```bash
# 1) 后端（共享，位于小程序端仓库）
cd ../健衡运动社区小程序端/source/backend
.venv\Scripts\python.exe -m scripts.seed_admin
.venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# 2) 管理端
cd 健衡运动社区管理端/源码
npm install
npm run dev          # http://127.0.0.1:5173
npm run typecheck
npm run build
```

开发登录：

| 账号 | 密码 | 说明 |
|---|---|---|
| `admin` | `Admin@123456` | 超级管理员（`scripts/seed_admin.py` 创建） |

> 生产环境通过 `ADMIN_INIT_PASSWORD` 注入强密码；不要把默认密码用于线上。

## 当前接口模式（重要）

开发环境 `.env.development` 的 `VITE_USE_MOCK=true`，但 `src/api/client.ts` 使用混合适配器：

| 请求前缀 | 行为 |
|---|---|
| `/admin/auth/*` | 真实 FastAPI |
| `/admin/products*` | 真实 FastAPI，落库 `products` / `product_images` |
| `/admin/courses*` | 真实 FastAPI，落库 `courses` / `chapters` |
| `/admin/upload/*` | 真实 FastAPI，写入 `uploads/` |
| `/admin/meta/*`、`/admin/stats/*` | 真实 FastAPI |
| 其它 `/admin/*`（帖子/评论/用户/话题/管理员/审计） | 仍走 `src/mock/index.ts`，仅演示，不落库 |

因此：

- 管理端编辑产品/课程后，小程序切回「产品/课程」页签、下拉刷新或重新进入详情即可看到。
- 其它运营页面目前是演示数据；关闭 Mock 前不要把它们当作真实数据。
- 详细链路、字段映射、联调步骤见：
  `开发前置文档/后端/08-课程产品数据联动实装说明.md`

## 目录结构

```
src/
├─ api/            请求层、DTO、12 个接口模块
├─ assets/styles/  tokens / element / base / index
├─ components/     layout / common / dashboard / posts / users / topics / admins / courses / products
├─ composables/    useTableQuery / usePagination / usePermission / useUnsavedGuard
├─ directives/     v-perm
├─ layouts/        AdminLayout / BlankLayout
├─ mock/           本地适配器（只用于未实装页面）
├─ router/         routes / guard / index
├─ stores/         auth / app / dictionary
├─ types/          ApiEnvelope / PageResult / Option / RouteMeta
├─ utils/          storage / format / validate / message
└─ views/          18 条路由对应页面
```

单向依赖：`views → components/composables → stores → api → utils`；组件不直接调 axios，API 层不依赖 store（token 由 client 直接读 storage）。

## 路由与权限

| 路由 | 页面 | 权限 |
|---|---|---|
| `/login`、`/change-password` | 登录、改密 | 公开 / 登录 |
| `/dashboard` | 概览 | `dashboard:read` |
| `/posts` | 帖子审核 | `post:read` |
| `/comments` | 评论治理 | `comment:read` |
| `/users` | 用户 | `user:read` |
| `/topics`、`/courses`、`/products` | 内容维护 | `topic:manage` / `course:manage` / `product:manage` |
| `/courses/:id/edit`、`/products/:id/edit` | 编辑页 | 同上 |
| `/admins` | 管理员（仅 super 菜单可见） | `admin:manage` |
| `/audit-logs` | 操作日志 | `audit:read` |
| `/profile` | 个人中心 | 登录 |
| `/403`、`/:pathMatch(.*)*` | 无权限 / 404 | 公开 |

守卫顺序：无 token → 登录页；`mustChangePassword` → 强制改密；无权限 → `/403`。

## 已实现 / 未实现

**已实现（真实落库）**

- 管理员登录、当前管理员、改密
- 产品：列表、详情、新建、编辑、上下架、图集
- 课程：列表、详情、新建、编辑、上下架、章节替换
- 图片上传
- 字典、概览
- 小程序产品/课程页签与详情刷新

**未实现（前端 Mock 演示）**

- 帖子审核、评论治理、用户治理、话题维护、管理员账号管理、审计日志
- `0004_admin_console` 迁移（审计表、`review_status`、管理员扩展字段）
- 强制首登改密、登录失败锁定、JWT 8 小时（当前复用 7 天）

## 联调排查

| 现象 | 处理 |
|---|---|
| 登录 401 | 先跑 `python -m scripts.seed_admin` |
| 产品/课程保存成功但小程序不变 | 小程序切回页签/下拉刷新；检查是否旧包未包含刷新逻辑 |
| 请求 501/404 | 该接口尚未实装；确认路径在 `REAL_ADMIN_PREFIXES` 内 |
| 图片 404 | 后端 `UPLOAD_URL_PREFIX` 是否为 `http://127.0.0.1:8000` |
| 接口全部 401 | 清 localStorage 重新登录；确认 `JWT_SECRET` 未更换 |

## 文档

- `开发前置文档/前端/前端规范/00-文档索引.md`
- `开发前置文档/前端/ui设计/00-文档索引与使用说明.md`
- `开发前置文档/后端/08-课程产品数据联动实装说明.md`
