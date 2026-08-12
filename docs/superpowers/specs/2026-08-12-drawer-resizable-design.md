# Drawer 可拖动调整尺寸设计

## 背景

HiTalent Design 当前基于 Ant Design 5.29.3，公开兼容范围为 `antd >=5 <6`。仓库中的 `src/components/Drawer` 尚未实现，而 Ant Design 6 已提供通过边缘拖动调整 Drawer 宽度或高度的能力。

本次新增 HiTalent Drawer：保留 Ant Design 5 的遮罩、Portal、开关动画、焦点管理、嵌套 Drawer 和 `push` 行为，同时提供与 Ant Design 6 对齐的 resize API。除 Ant Design 6 的行为外，最大尺寸还必须受 Drawer 实际显示容器限制：默认 Portal 场景以视口为界，局部或自定义容器场景以实际容器为界。

## 目标与非目标

### 目标

- 封装 Ant Design 5 Drawer，保持其现有属性和交互兼容。
- 支持 `left`、`right`、`top`、`bottom` 四种展开位置的单轴 resize。
- 拖拽把手始终位于 Drawer 朝向页面内容的内侧边缘。
- 对外提供与 Ant Design 6 一致的 `size`、`defaultSize`、`maxSize`、`resizable` API。
- 支持受控和非受控尺寸。
- 用户配置的最大尺寸最终仍受 Drawer 实际显示容器限制。
- 支持默认 Portal、`getContainer={false}` 和自定义容器。
- 支持 Pointer Events，并在取消、失焦、关闭或卸载时可靠清理全局状态。
- 不新增运行时依赖。
- 提供中英文文档、Demo 和公开类型导出。

### 非目标

- 不支持同时调整宽度和高度；Drawer 只根据 `placement` 调整一个轴向尺寸。
- 不新增 Ant Design 6 API 以外的 `minSize`。
- 不提供键盘 resize 操作。
- 不将拖动后的尺寸持久化到组件卸载之后或本地存储。
- 不重写 Ant Design 的遮罩、Portal、开关动画、焦点陷阱或嵌套 `push`。
- 不升级项目的 Ant Design 或 React 版本。

## 方案比较与选择

### 方案一：封装 Ant Design 5 Drawer，自研单轴 resize

继续由 Ant Design 5 Drawer 处理基础行为，仅在 HiTalent 层维护尺寸状态、渲染拖拽把手，并通过 Pointer Events 计算尺寸。

优点：

- 不新增依赖。
- 保留 Ant Design 5 的完整 Drawer 行为。
- 内部边界清晰，便于测试与后续迁移。
- 可以补充实际容器边界和 Pointer Events 支持。

缺点：需要安全组合 Ant Design 5 的 `drawerRender`、`classNames`、`styles` 和 `panelRef`。

### 方案二：移植 Ant Design 6 / rc-drawer 的 resize 实现

复制上游 `useDrag` 及拖拽把手结构。

优点：行为最接近上游。

缺点：上游依赖新版 rc-drawer 的 DOM 和语义样式结构；当前实现主要使用 Mouse Events，也没有自动把最大尺寸限制到实际容器。直接复制后仍需较多适配。

### 方案三：引入第三方 resize 库

使用 `re-resizable` 等库包装 Drawer。

优点：基础 resize 能力成熟。

缺点：新增运行时依赖，且固定边、Portal、动画、嵌套 `push` 和自定义容器仍需额外协调。

### 结论

采用方案一。公开 API 对齐 Ant Design 6，内部基于 Ant Design 5 Drawer 和 Pointer Events 实现，并增加实际容器边界约束。

## 对外 API

### 类型定义

```ts
export interface DrawerResizableConfig {
  /** 开始调整尺寸时触发 */
  onResizeStart?: () => void;
  /** 调整尺寸过程中触发，参数为当前轴向像素尺寸 */
  onResize?: (size: number) => void;
  /** 结束调整尺寸时触发 */
  onResizeEnd?: () => void;
}

export interface DrawerClassNames
  extends Omit<NonNullable<AntdDrawerProps['classNames']>, 'dragger'> {
  /** 调整尺寸把手的 className */
  dragger?: string;
}

export interface DrawerStyles
  extends Omit<NonNullable<AntdDrawerProps['styles']>, 'dragger'> {
  /** 调整尺寸把手的行内样式 */
  dragger?: React.CSSProperties;
}

export interface DrawerProps
  extends Omit<
    AntdDrawerProps,
    'size' | 'width' | 'height' | 'classNames' | 'styles'
  > {
  /**
   * Drawer 的轴向尺寸。left/right 表示宽度，top/bottom 表示高度。
   * 传入时为受控模式。
   * @default 'default'
   */
  size?: 'default' | 'large' | number | string;

  /**
   * 非受控模式的初始轴向尺寸。
   * @default 378
   */
  defaultSize?: number | string;

  /**
   * resize 时允许的最大轴向尺寸，单位 px；最终仍受实际容器限制。
   */
  maxSize?: number;

  /**
   * 是否允许通过内侧边缘调整尺寸，或提供生命周期回调。
   * @default false
   */
  resizable?: boolean | DrawerResizableConfig;

  /** @deprecated 请使用 size */
  width?: number | string;

  /** @deprecated 请使用 size */
  height?: number | string;

  classNames?: DrawerClassNames;
  styles?: DrawerStyles;
}
```

顶层公开导出：

- `Drawer`
- `DrawerProps`
- `DrawerResizableConfig`
- `DrawerClassNames`
- `DrawerStyles`
- `DrawerLocale`

### 尺寸预设

- `size="default"`：`378px`
- `size="large"`：`736px`
- 数字：按像素处理
- 其他字符串：保留原值，例如 `50%`、`40vw` 或 `calc(...)`

## 尺寸解析与状态模型

### 受控与非受控

- 提供 `size` 时为受控模式。
  - 当前渲染尺寸始终来自 `size`。
  - 拖动只计算尺寸并调用 `resizable.onResize(size)`。
  - 调用方需要更新 `size` 才会实际改变 Drawer 尺寸。
- 未提供 `size`、且当前轴没有对应的旧版 `width`/`height` 时为非受控模式。
  - 组件内部保存用户拖动后的像素尺寸。
  - `defaultSize` 只用于初始尺寸。
  - 同一组件实例关闭后重新打开时保留内部尺寸。
  - 组件卸载后状态重置。
- 若传入当前轴对应的旧版 `width` 或 `height`，该属性作为受控兼容值，其行为与 `size` 相同：调用方需要在 `onResize` 中更新它，或迁移到 `size`。
- `resizable` 从开启切换为关闭时保留当前尺寸，只隐藏把手并结束活跃 resize。

### 初始尺寸优先级

根据当前 `placement` 解析轴向尺寸：

1. `size`
2. 当前轴对应的旧版 `width` 或 `height`
3. 当前方向保存的非受控尺寸
4. `defaultSize`
5. `378`

`width` 和 `height` 只用于兼容 Ant Design 5，并在文档和类型注释中标记弃用。传入当前轴对应的旧版属性时，它与 `size` 一样被视为受控值；`size` 始终具有更高优先级。

### 方向切换

横向轴为 `left/right`，纵向轴为 `top/bottom`。

- 在同一轴内切换位置，例如 `left → right`，可以继续使用同一轴向内部尺寸。
- 在横向和纵向之间切换，例如 `right → top`，不复用上一轴拖动生成的像素尺寸。
- 新轴重新根据 `size`、对应 `width/height`、该轴已有内部尺寸或 `defaultSize` 解析。
- 内部状态可以分别保存横向和纵向尺寸，避免反复切换时把宽度错误当作高度，同时允许回到原轴时恢复该轴上次的非受控尺寸。

### 字符串尺寸

字符串尺寸可以作为初始值或受控值直接传给 Ant Design Drawer。开始拖动时不解析 CSS 字符串，而是读取 Drawer wrapper 的 `getBoundingClientRect()`，将当前实际尺寸转换为像素后进行后续计算。

## 组件架构

```text
Drawer
├── 解析 Ant Design 5/6 风格属性
├── 管理受控/非受控轴向尺寸
├── 拆分并组合 classNames、styles、panelRef、drawerRender
└── AntdDrawer
    └── drawerRender
        ├── DrawerResizeHandle
        └── 用户 drawerRender 的结果或原始 drawerNode

useDrawerResize
├── 测量当前 Drawer wrapper
├── 测量实际显示容器
├── 根据 placement 计算方向
├── 应用 maxSize 与容器边界
├── 管理 Pointer Events 生命周期
└── 恢复全局 userSelect 与 cursor
```

### 文件职责

- `src/components/Drawer/index.tsx`
  - 封装 Ant Design Drawer。
  - 解析属性和尺寸模式。
  - 管理横向/纵向非受控尺寸。
  - 组合 Ref、语义样式与 `drawerRender`。
- `src/components/Drawer/type.ts`
  - 声明公开 Props 和类型。
- `src/components/Drawer/hooks/useDrawerResize.ts`
  - 处理 Pointer Events、几何计算、边界与清理。
- `src/components/Drawer/components/DrawerResizeHandle.tsx`
  - 渲染具有可访问性语义的单轴把手。
- `src/components/Drawer/index.less`
  - 把手位置、命中区域、hover/dragging 状态及 transition 覆盖。

## 渲染与 Ant Design 5 兼容

### `drawerRender`

内部使用 Ant Design 5 的公开 `drawerRender` 在 `.ant-drawer-content-wrapper` 内插入把手，结构如下：

```tsx
<>
  {resizable && <DrawerResizeHandle />}
  {userDrawerRender ? userDrawerRender(drawerNode) : drawerNode}
</>
```

设计约束：

- 不增加影响 Drawer flex 布局或尺寸测量的中间 DOM。
- 调用方 `drawerRender` 仍接收原始 Drawer 内容节点。
- 内部把手位于调用方渲染结果的同级，避免自定义包装遮蔽 resize 能力。
- 把手事件阻止冒泡，嵌套 Drawer 不会同时触发父 Drawer resize。

### `classNames` 与 `styles`

- Ant Design 5 支持的字段原样透传。
- HiTalent 新增的 `dragger` 字段仅用于内部把手，不传给底层 Ant Design 5。
- 不覆盖调用方已有的 `rootClassName`、`className`、`rootStyle` 和事件回调。
- 内部状态 class 与用户 class 通过 class name 合并，而不是替换。

### Ref

- 使用内部 Ref 获取 Drawer 根节点，用于查找当前实例的 content wrapper 和测量显示区域。
- 将内部 Ref 与调用方 `panelRef` 合并，保持 Ant Design 5 的 Ref 行为。
- 不通过全局 `document.querySelector` 获取 Drawer，避免多个或嵌套 Drawer 相互干扰。

## 展开位置与几何计算

拖拽把手始终位于 Drawer 朝向页面内容的一侧，靠屏幕或容器外沿的一侧保持固定。

| `placement` | 把手位置 | 原始 Pointer 位移  | 新尺寸公式          |
| ----------- | -------- | ------------------ | ------------------- |
| `left`      | 右边缘   | `clientX - startX` | `startSize + delta` |
| `right`     | 左边缘   | `clientX - startX` | `startSize - delta` |
| `top`       | 下边缘   | `clientY - startY` | `startSize + delta` |
| `bottom`    | 上边缘   | `clientY - startY` | `startSize - delta` |

由此保证：

- `left` 向右拖时宽度增加。
- `right` 向左拖时宽度增加。
- `top` 向下拖时高度增加。
- `bottom` 向上拖时高度增加。

## 实际容器边界

### 边界来源

resize 开始时测量当前 Drawer 根节点的 `getBoundingClientRect()`：

- 默认 Portal 到 `body`：根节点通常覆盖视口，最大尺寸取当前可视区域。
- `getContainer={false}`：以局部布局中的 Drawer 根节点为界。
- 自定义 `getContainer`：以该自定义容器内的 Drawer 根节点为界。
- 如果根节点矩形无效或轴向尺寸不为有限正数，回退到 `document.documentElement.clientWidth` 或 `clientHeight`。
- 若回退值仍无效，则不开始本次 resize。

使用 Drawer 实际根节点而不是仅根据 `getContainer` 属性推断，可以覆盖调用方为 Drawer 根节点设置 inset、absolute 定位或其他布局约束的情况。

### 最大尺寸

```ts
const effectiveMaxSize = Math.min(
  validMaxSize ?? containerAxisSize,
  containerAxisSize,
);

const nextSize = clamp(rawSize, 0, effectiveMaxSize);
```

规则：

- `left/right` 使用容器宽度。
- `top/bottom` 使用容器高度。
- `maxSize` 只有在有限且大于 `0` 时有效；否则视为未配置。
- 未提供 `maxSize` 时，实际容器轴向尺寸就是最大值。
- 最小尺寸按照 Ant Design 6 的行为固定为 `0`，不新增 `minSize`。
- 用户传入的 `maxSize` 大于容器时，以容器为准。
- wrapper 同时设置轴向 `maxWidth: 100%` 或 `maxHeight: 100%` 作为 CSS 兜底，防止容器在拖动结束后缩小造成页面溢出。

### 容器运行期缩小

- 活跃 resize 每次开始时重新测量边界，不缓存旧视口或容器尺寸。
- 非活跃时由 CSS 的轴向 `maxWidth/maxHeight` 保证视觉不越界。
- 组件不因浏览器或容器缩小而主动覆盖保存的非受控尺寸；容器恢复后可恢复原保存尺寸。
- 下一次拖动从当前实际矩形尺寸开始，而不是从可能更大的保存值开始，避免跳变。

## Pointer Events 生命周期

### 开始

`pointerdown` 时：

1. 确认 Drawer 已打开、`resizable` 已启用且不是退出动画状态。
2. 调用 `preventDefault()` 和 `stopPropagation()`。
3. 从当前实例 Ref 找到 content wrapper 并读取实际矩形。
4. 读取 Drawer 根节点矩形作为实际容器边界。
5. 验证起始尺寸和容器轴向尺寸均为有限正数。
6. 保存 Pointer ID、起始坐标、起始实际尺寸、有效最大尺寸以及 `body` 原始样式。
7. 设置 resize 活跃状态。
8. 设置 Pointer Capture；同时在 `document` 上监听后续事件，作为 Pointer 离开把手后的可靠兜底。
9. 设置 `document.body.style.userSelect = 'none'` 和当前轴向 cursor。
10. 调用 `onResizeStart()`。

若测量失败，不修改全局样式、不注册监听器，也不触发生命周期回调。

### 移动

`pointermove` 时：

1. 忽略 Pointer ID 不匹配的事件。
2. 根据 `placement` 计算带方向的尺寸增量。
3. 使用 `[0, effectiveMaxSize]` 约束尺寸。
4. 若尺寸与上一次有效值相同，不更新状态也不触发回调。
5. 非受控模式更新当前轴向内部尺寸。
6. 调用 `onResize(nextSize)`。

受控模式下，计算基于 resize 开始时测得的实际尺寸和 Pointer 起点，不依赖父组件每帧回传速度，从而避免增量误差。视觉尺寸是否更新仍由调用方更新 `size` 决定。

### 结束与取消

以下情况使用同一幂等 `finishResize` 流程：

- `pointerup`
- `pointercancel`
- `window.blur`
- Drawer 关闭
- `resizable` 关闭
- `placement` 改变
- 组件卸载

`finishResize`：

1. 清理 `document` 和 `window` 监听器。
2. 释放活跃状态。
3. 恢复 resize 开始前的 `body.userSelect` 和 `body.cursor`。
4. 对正常开始过的 resize 调用一次 `onResizeEnd()`。
5. 后续重复调用不产生副作用，也不重复触发结束回调。

调用方回调不参与资源清理的完成条件。内部状态和监听器先完成必要更新，再调用外部回调；回调抛错时也不能留下活跃监听器或全局样式。

## 样式与交互反馈

- 把手视觉厚度为 `4px`。
- 通过伪元素或负 inset 将 Pointer 命中区域扩展到约 `10px`，但不改变布局尺寸。
- 默认透明。
- hover 时使用低透明度主色提示。
- 活跃拖动时提高主色提示透明度。
- `left/right` 使用 `col-resize`。
- `top/bottom` 使用 `row-resize`。
- 设置 `touch-action: none`，避免触屏手势被页面滚动抢占。
- resize 活跃期间关闭 content wrapper 的宽高 transition，并使用轴向 `will-change`。
- 把手 z-index 高于 Drawer 内容，但不能覆盖大面积交互区域。

把手位置：

- `left`：`right: 0; top: 0; bottom: 0`
- `right`：`left: 0; top: 0; bottom: 0`
- `top`：`bottom: 0; left: 0; right: 0`
- `bottom`：`top: 0; left: 0; right: 0`

## 可访问性与国际化

把手使用：

- `role="separator"`
- 横向尺寸调整：`aria-orientation="vertical"`
- 纵向尺寸调整：`aria-orientation="horizontal"`
- 根据 `placement` 提供中英文 `aria-label`

新增 `DrawerLocale`，至少包含四个方向的 resize 文案，以便准确描述被调整的边缘和 Drawer 方向。

把手不进入 Tab 顺序。本次没有键盘 resize 能力，因此不声明可通过键盘操作。

## 异常处理与竞争条件

- 找不到当前实例 content wrapper 时不开始 resize。
- 当前尺寸或容器尺寸无效时不开始 resize。
- Pointer 没有造成有效尺寸变化时不重复更新或触发 `onResize`。
- resize 期间关闭 Drawer、改变 `placement` 或关闭 `resizable` 时立即结束。
- Drawer 关闭或退出动画期间不允许开始新的 resize。
- 嵌套 Drawer 把手事件阻止冒泡，各实例只通过自身 Ref 测量和更新。
- 不覆盖调用方 DOM 事件处理器。
- `body` 样式恢复使用开始前保存的值，不直接重置为空字符串。
- 多个实例原则上不会由同一个 Pointer 同时开始；如外部程序导致竞争，各实例只恢复自己保存的样式。实现时应尽量避免父子实例同时激活，而不引入跨实例全局状态。

## 文档与 Demo

新增：

- `src/components/Drawer/index.md`
- `src/components/Drawer/index.en-US.md`
- `src/components/Drawer/demo/basic.tsx`
- `src/components/Drawer/demo/resizable.tsx`

### 基础 Demo

覆盖：

- `open` 和 `onClose`
- 标题、正文和 footer
- 默认 `right` placement
- 与 Ant Design 5 Drawer 一致的常规行为

### Resizable Demo

覆盖：

- 切换 `left/right/top/bottom`
- 受控 `size`
- `resizable.onResize`
- 展示当前像素尺寸
- 配置大于可用区域的 `maxSize`，证明最终仍受实际容器约束
- 局部容器和 `getContainer={false}`
- 切换 placement 时重置 Demo 的受控尺寸，便于观察方向行为

中英文文档说明受控模式必须在 `onResize` 中更新 `size`，并说明 `maxSize` 会与实际容器边界取较小值。

## 验证策略

仓库当前没有通用测试脚本，因此以静态检查、构建和 Demo 交互验证为主。

### 自动验证

- `npm run lint:es`
- `npm run lint:css`
- `npm run build`
- `npm run docs:build`

若仓库已有、与本次改动无关的问题导致命令失败，需记录命令、错误和影响范围，不把失败描述为通过。

### 手工验证矩阵

1. `resizable=false` 时与普通 Ant Design 5 Drawer 行为一致。
2. `left` 的右边缘向右拖增大、向左拖减小。
3. `right` 的左边缘向左拖增大、向右拖减小。
4. `top` 的下边缘向下拖增大、向上拖减小。
5. `bottom` 的上边缘向上拖增大、向下拖减小。
6. 四种位置的外侧固定边均不移动。
7. 未配置 `maxSize` 时不能超过实际容器边界。
8. `maxSize` 小于容器时按 `maxSize` 限制。
9. `maxSize` 大于容器时按容器限制。
10. 默认 Portal 场景以视口为边界。
11. `getContainer={false}` 以局部 Drawer 根节点为边界。
12. 自定义容器场景以实际 Drawer 根节点为边界。
13. 受控 `size` 下回调返回正确像素值，父组件更新后尺寸同步。
14. 非受控模式拖动后关闭重开保留尺寸。
15. `defaultSize` 仅影响非受控初始尺寸。
16. `size="default"` 与 `size="large"` 分别解析为 378 和 736。
17. 百分比、vw 和 `calc()` 字符串初始尺寸可正常渲染，开始拖动后从实际像素尺寸连续变化。
18. `left ↔ right` 与 `top ↔ bottom` 切换保持对应轴尺寸。
19. 横向与纵向切换不会把宽度误当作高度。
20. resize 期间关闭 Drawer、切换 placement 或关闭 `resizable` 会安全结束。
21. `pointercancel`、窗口失焦和组件卸载后监听器及 `body` 样式恢复。
22. 未移动 Pointer 时不重复触发 `onResize`。
23. 自定义 `drawerRender`、`classNames`、`styles` 和 `panelRef` 均保持工作。
24. 嵌套 Drawer 与 `push` 正常，父子把手不会同时响应。
25. 运行期间缩小浏览器或局部容器后不产生横向或纵向页面溢出。
26. hover、dragging 光标与视觉反馈符合当前方向。
27. 中英文环境下把手具有正确的 `aria-label` 和 `aria-orientation`。

## 预计改动范围

- 新增 `src/components/Drawer/index.tsx`
- 新增 `src/components/Drawer/type.ts`
- 新增 `src/components/Drawer/index.less`
- 新增 `src/components/Drawer/hooks/useDrawerResize.ts`
- 新增 `src/components/Drawer/components/DrawerResizeHandle.tsx`
- 新增 Drawer 中英文文档与 Demo
- 修改 `src/components/index.ts`，导出 Drawer 与公开类型
- 修改 `src/locales/type.ts`
- 修改 `src/locales/zh_CN.ts`
- 修改 `src/locales/en_US.ts`
- 修改 `src/locales/index.ts` 和 `src/index.ts`，导出 `DrawerLocale`

不进行与 Drawer 功能无关的组件重构，也不修改当前工作区中已有的 Button 未提交变更。
