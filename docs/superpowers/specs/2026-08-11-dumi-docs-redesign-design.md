# HiTalent Design dumi 文档站整理与重设计规格

- 日期：2026-08-11
- 状态：设计已确认，待实施计划
- 目标分支：`feat/modal-drag-resize`
- 文档引擎：dumi 2.4

## 1. 背景

HiTalent Design 是基于 Ant Design 的高级业务组件库。当前文档站已经具备中英文首页、使用指南、组件文档、Hooks 文档和少量全局样式，但存在以下问题：

1. 首页主要依赖 dumi 默认 Hero 与 Features，未充分表达 Modal、Table、PopoverSelect 等核心业务能力。
2. 中文与英文内容不完整对齐：Table 和 Hooks 缺少英文页面，部分中文 Demo 缺少标题与场景说明。
3. 指南内容集中在单页，导航层级不足，安装、快速开始和全局配置不易定位。
4. 组件页的信息组织不统一；“何时使用”、Demo 说明、API 分组、注意事项和 FAQ 的完整度不同。
5. `.dumi/global.less` 大量覆盖 dumi 默认 class，明暗主题、响应式和后续 dumi 升级的维护成本偏高。
6. 当前 `logo: false`，站点缺少可用于 Header、移动端和 favicon 的稳定品牌标识。

本次重设计将文档站定位为“公开官网与研发工作台兼顾”的长期组件库官网。

## 2. 已确认决策

- 整体方案：分层主题系统。
- 视觉方向：A「精密工作台」。
- 品牌标识：HT 字母标 + HiTalent Design 字标。
- 内容深度：统一完整模板。
- 国际化：中文和英文完全对齐。
- 主题：完整 light/dark 双主题。
- 技术边界：保留 dumi 的路由、搜索、国际化、Markdown、Demo 和 API 生成能力，仅自定义必要主题槽位和视觉层。

## 3. 目标与非目标

### 3.1 目标

1. 建立清晰、稳定且可扩展的站点信息架构。
2. 统一全部组件和 Hook 文档的内容模板。
3. 让首页准确展示 HiTalent Design 的业务价值和核心能力。
4. 建立独立于组件业务样式的文档站 design tokens。
5. 完整支持中英文、light/dark、桌面端、平板端和移动端。
6. 保留 dumi 原有搜索、语言切换、主题切换、Demo 和 API 能力。
7. 降低对 dumi 内部 DOM class 的无边界覆盖。

### 3.2 非目标

- 不修改组件库公开 API、组件行为或 npm 构建产物。
- 不新增组件或为当前空目录 `Drawer` 编写虚构文档。
- 不实现独立搜索服务、版本切换、在线 Playground、数据分析或部署流程。
- 不替换 dumi 路由和内容构建系统。
- 不引入新的 UI 框架、字体服务或运行时依赖。
- 不编辑 `.dumi/tmp`、`.dumi/tmp-production`、`docs-dist` 等生成目录。

## 4. 信息架构

### 4.1 顶部导航

顶部导航按以下顺序展示：

1. 首页
2. 指南
3. 组件
4. Hooks
5. 搜索

右侧操作依次为语言切换、主题切换和 GitHub。桌面端完整展示；移动端将主导航收进菜单抽屉，但品牌标识、搜索和菜单入口始终可见。

### 4.2 指南结构

将当前单一 `docs/guide.md` / `docs/guide.en-US.md` 调整为同一路由下的多页结构：

- `/guide`：介绍与设计目标
- `/guide/installation`：安装与环境要求
- `/guide/quick-start`：快速开始与基础示例
- `/guide/global-config`：ConfigProvider、国际化、文字方向和样式前缀

中文与英文页面一一对应，路径语义保持一致。

### 4.3 组件分组

- 通用：Button
- 数据录入：PopoverSelect
- 数据展示：Table
- 反馈与窗口：Modal
- 全局配置：ConfigProvider

### 4.4 Hooks 分组

- 状态管理：useMergeState
- 交互能力：useDragBounds
- 数据适配：useFieldNames

每个 Hook 增加对应 `.en-US.md` 页面。

## 5. 内容模板

### 5.1 组件页

每个组件页按以下固定顺序组织：

1. frontmatter：分类、标题和导航顺序。
2. 页面标题与一句话定位。
3. “何时使用”：说明适用场景和不应使用的场景（有明确限制时）。
4. “核心能力”：2–5 条可扫描的能力说明。
5. “代码演示”：每个 Demo 都有标题和场景描述；中英文 Demo 数量与顺序一致，Demo TSX 保持同源。
6. “API”：主 Props、配置对象、Ref、静态方法按实际导出分组。
7. “注意事项”或“常见问题”：只记录真实存在的边界、交互约束和迁移信息。

页面不得为了模板完整而编造不存在的能力。Table 当前的迁移说明继续保留，并移动到 API 后的独立章节。

### 5.2 Hook 页

每个 Hook 页按以下顺序组织：

1. Hook 名称与定位。
2. 适用场景。
3. 基本用法。
4. 参数。
5. 返回值。
6. 进阶示例。
7. 注意事项。

中文与英文的代码示例保持相同逻辑，仅翻译注释和展示文案。

### 5.3 首页

首页按以下顺序展示：

1. 品牌 Hero：价值主张、简短说明、开始使用和浏览组件入口。
2. 安装命令：`npm install hi-talent-design antd`，支持复制。
3. 核心能力：Modal、Table、PopoverSelect 三张能力卡。
4. 选择理由：TypeScript、Ant Design 兼容、国际化与业务场景封装。
5. 组件浏览入口。
6. 简洁 Footer。

首页不使用泛化 emoji 作为主要视觉标识；图形采用与文档主题一致的简洁字母或线性图形。

## 6. 视觉系统

### 6.1 品牌气质

视觉方向为“精密工作台”：克制、可信、信息清晰。避免大面积渐变、厚重阴影、玻璃拟态和过度装饰。

### 6.2 品牌标识

- 主标识：圆角方形内的 `HT` 字母标。
- 桌面 Header：HT 字母标 + `HiTalent Design` 字标。
- 移动端和 favicon：仅使用 HT 字母标。
- 标识不替代可访问文本，需提供可读名称或 aria-label。

### 6.3 色彩

- 主品牌色：靛蓝，用于主要操作、当前导航、链接和 focus ring。
- 辅助色：青绿色，仅用于少量成功、效率或能力提示。
- Light：冷白与浅蓝灰表面层级。
- Dark：深蓝灰表面层级，不使用纯黑背景。
- 错误、警告、成功和信息色使用独立语义 token。

所有颜色以语义变量表达，例如 `--htd-doc-surface`、`--htd-doc-text-primary`、`--htd-doc-border`、`--htd-doc-brand`，禁止在各主题组件中重复硬编码同一语义颜色。

### 6.4 排版、圆角与层级

- 正文采用可靠的系统字体栈；代码与命令采用系统等宽字体栈。
- 不依赖外部字体服务。
- 交互元素圆角为 6–8px，内容容器为 10–12px。
- 主要使用留白、细边框和背景差异建立层级；阴影仅用于悬浮层、Header 或需要脱离文档流的元素。
- Markdown 标题、正文、表格、行内代码、代码块和引用保持统一垂直节奏。

## 7. 核心页面布局

### 7.1 首页

Header 下方为单一主 Hero。桌面端左侧展示价值主张和操作，右下区域展示紧凑安装命令；移动端改为单列。Hero 后依次为核心能力卡、选择理由和组件入口。

### 7.2 文档页

桌面端使用三列结构：

- 左侧：分类 Sidebar。
- 中间：正文、Demo 和 API。
- 右侧：页内 Toc。

正文控制最大阅读宽度，Demo 可在允许范围内扩展。API 表格在窄屏中仅自身横向滚动，页面整体不产生横向溢出。

### 7.3 Demo Previewer

Previewer 分为：

1. 演示舞台。
2. 标题和场景说明。
3. 代码与操作区域。

保留 dumi 原有代码展开、复制和 Demo 执行能力。自定义层只调整布局、视觉和必要的无障碍标签，不复制 dumi 的运行逻辑。

## 8. 主题架构

### 8.1 配置层

`.dumirc.ts` 负责：

- locale
- 组件扫描目录
- 导航和 Sidebar 数据
- GitHub、站点名称等基础配置

视觉细节不继续堆叠在配置文件中。

### 8.2 文档主题层

在 `.dumi/` 内建立以下职责：

- design tokens：颜色、字体、间距、圆角、阴影、内容宽度和 Header 高度。
- 基础样式：reset、Markdown、代码、表格和焦点状态。
- 主题槽位：Logo、Header、Sidebar、Hero、Features、Footer。
- 内置组件视觉：Previewer、API Table、CodeGroup、SourceCode、Toc。
- 小型内部组件：BrandMark、安装命令、能力卡等，仅供文档主题使用。

只有需要改变结构的部分覆盖 dumi 槽位；可以通过 token 和稳定选择器完成的部分不重复实现。实施前需基于当前 dumi 2.4.21 主题接口确认每个覆盖点的 props 和导出路径。

### 8.3 内容层

- `docs/`：首页、指南和公共 Hooks 文档。
- `src/components/`：组件实现、Demo 和组件同目录文档。
- Demo TSX 是演示逻辑的唯一来源，Markdown 只引用 Demo。

### 8.4 数据流

```text
Markdown/frontmatter + Demo TSX
            ↓
       dumi 内容解析
            ↓
路由、导航、API 元数据、Demo 元数据
            ↓
     自定义主题槽位渲染
            ↓
light/dark tokens + 响应式布局
```

语言、搜索索引、路由和 API 类型不建立第二套手工数据源。

## 9. 响应式设计

- 桌面端（≥1200px）：Header + Sidebar + 正文 + Toc。
- 平板端（768–1199px）：保留 Sidebar，隐藏 Toc，正文自适应。
- 移动端（<768px）：Sidebar 收进菜单；Header 仅保留品牌、搜索和菜单；Hero 单列；Demo 操作区换行；表格容器内部滚动。

所有图片、代码块、表格和 Demo 必须限制在内容容器中，页面 body 不得横向滚动。

## 10. 明暗主题

- 使用同一套语义 token 分别映射 light/dark 值。
- 跟随 dumi 主题状态，并尊重系统主题。
- Header、Sidebar、正文、Demo、API 表格、搜索结果、代码块、移动菜单和 Footer 均需覆盖 dark 状态。
- 主题切换不得造成明显布局跳动。
- 非必要动效在 `prefers-reduced-motion: reduce` 下关闭。

## 11. 可访问性与降级

- 所有交互元素提供 hover、active、focus-visible 和 disabled 状态。
- 键盘可完成主导航、搜索、语言切换、主题切换、移动菜单和 Demo 代码操作。
- 文字与关键交互对比度以 WCAG AA 为最低目标。
- HT 标识提供可访问名称。
- Clipboard API 不可用时，安装命令仍可手动选择。
- 缺少可选 frontmatter 时回退到 Markdown 一级标题。
- Demo 缺少 description 时仍可渲染；本次内容整理必须补齐当前所有正式 Demo 的说明。
- 搜索、GitHub 或剪贴板能力不可用时，不影响正文阅读。

## 12. 验证方案

### 12.1 静态验证

- `npm run lint`
- `npm run docs:build`
- 无重复路由、失效内部链接和文档构建错误。

### 12.2 双语一致性

- 每个中文页面存在对应英文页面。
- 导航、Sidebar、Demo 数量、顺序和 API 分组一致。
- 代码示例保持同源，仅翻译说明、注释和展示文案。

### 12.3 视觉回归矩阵

视口：1440px、1024px、768px、390px。

主题：light、dark。

页面：首页、指南、Button、Modal、Table、PopoverSelect、ConfigProvider，以及每个 Hook 页面。

### 12.4 功能冒烟

- 搜索和内部跳转。
- 中英文切换。
- light/dark 切换。
- 移动端菜单。
- Demo 展开、收起和复制代码。
- Modal 拖拽、缩放与窗口管理 Demo。
- Table 行列拖拽 Demo。
- PopoverSelect 虚拟滚动和选择 Demo。

## 13. 完成标准

满足以下条件方可视为完成：

1. 文档构建成功，页面无控制台级运行错误。
2. 中英文路由和导航完整对齐。
3. 所有正式组件和 Hook 使用统一内容模板。
4. 首页、文档页和 Demo 与“精密工作台”视觉方向一致。
5. light/dark 和目标视口均可正常阅读、操作，无页面整体横向滚动。
6. 主要键盘焦点清晰可见，关键流程可用键盘完成。
7. 文档主题改动不改变组件库公开 API、业务样式和构建产物。
