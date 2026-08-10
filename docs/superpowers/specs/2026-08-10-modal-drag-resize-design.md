# Modal 多区域拖动与四角缩放设计

## 背景

当前 Modal 基于 Ant Design Modal 增加了拖动、最小化、最大化、命令式控制和 `destroyAll`。现有拖动能力仅将标题栏作为把手，并通过标题栏的 `mouseenter`/`mouseleave` 动态启停 `react-draggable`。

本次需求包含两项增强：

1. 开启 `draggable` 后，标题栏和 footer 空白区域均可移动弹窗；footer 中的按钮、链接和输入控件仍保持正常交互。
2. 新增可配置的 Modal resize 能力，通过四个角调整尺寸，并补充独立 Demo。

设计需保持现有 API 向后兼容，兼容最大化、最小化、`centered`、自定义 footer 与 `modalRender`。

## 目标与非目标

### 目标

- 标题栏和 footer 空白区域均可作为拖动把手。
- footer 内交互元素不触发拖动。
- 支持左上、右上、左下、右下四角缩放。
- 支持配置最小和最大宽高。
- resize 与 draggable 可独立启用。
- 手动尺寸和位置在 Modal 组件生命周期内保留，包括关闭后重新打开。
- 最大化和最小化切换不丢失普通窗口的手动尺寸与位置。
- 不增加新的运行时依赖。

### 非目标

- 本次不提供四边 resize。
- 本次不提供受控 `size`、`position`、`onResize` 或 `onResizeEnd` API。
- 本次不持久化到组件卸载之后，也不写入本地存储。
- 本次不改变最小化 Dock 卡片的 resize 行为。
- 本次不引入键盘 resize 操作。

## 方案选择

采用“受控窗口包装层 + 自研四角 resize”方案：

- 保留 `react-draggable` 处理移动。
- 使用 Pointer Events 实现四角 resize。
- 在 Modal 层维护普通窗口的尺寸与位置。
- 不引入 `react-rnd` 或 `re-resizable` 等新依赖。

相比替换为 `react-rnd`，该方案对当前拖动、最大化和最小化逻辑的影响更小；相比组合两个第三方组件，该方案能更直接地协调左侧和顶部 resize 引发的位置变化。

## 对外 API

新增导出类型：

```ts
export interface ModalResizableConfig {
  /** 最小宽度，单位 px；默认 320 */
  minWidth?: number;
  /** 最小高度，单位 px；默认 200 */
  minHeight?: number;
  /** 最大宽度，单位 px；最终仍受当前视口限制 */
  maxWidth?: number;
  /** 最大高度，单位 px；最终仍受当前视口限制 */
  maxHeight?: number;
}
```

`ModalProps` 新增：

```ts
/**
 * 是否允许通过四角调整弹窗尺寸。
 * 传入对象时可配置最小和最大宽高。
 * @default false
 */
resizable?: boolean | ModalResizableConfig;
```

能力关系如下：

| `draggable` | `resizable` | 行为                           |
| ----------- | ----------- | ------------------------------ |
| `false`     | `false`     | 保持普通 Ant Design Modal 行为 |
| `true`      | `false`     | 标题栏与 footer 空白区域可移动 |
| `false`     | `true`      | 仅四角可缩放，不能移动         |
| `true`      | `true`      | 同时支持移动和四角缩放         |

`resizable` 从开启切换为关闭时，保留当前尺寸，仅隐藏 resize handle 并停止新的 resize。

## 组件架构

将现有 `DraggableWrapper` 演进为统一窗口交互包装层 `ModalWindowWrapper`：

```text
ModalWindowWrapper
├── react-draggable
│   ├── 处理标题栏和 footer 空白区域拖动
│   ├── 应用受控 position
│   └── 应用动态视口 bounds
├── 用户 modalRender 的渲染结果
└── ResizeHandle × 4
    ├── top-left
    ├── top-right
    ├── bottom-left
    └── bottom-right
```

保留当前 `modalRender` 顺序：

1. Ant Design 提供 `modalNode`。
2. 若调用方传入 `modalRender`，先执行调用方的包装。
3. 最外层再挂载 `ModalWindowWrapper`。

这样能够保持现有 `modalRender` 行为，同时保证窗口交互层可访问最终渲染节点。

内部职责拆分：

- `ModalWindowWrapper`
  - 组合 draggable 和 resize。
  - 挂载包装节点与四个 handle。
  - 读取共享窗口状态。
- `useModalResize`
  - 处理 Pointer Events 生命周期。
  - 测量初始实际尺寸。
  - 计算四角 resize 的宽高和位置。
  - 应用边界并恢复全局样式。
- `useModalWindowState` 或对现有 `useModalState` 的聚焦扩展
  - 保存普通窗口的 `{ x, y, width, height }`。
  - 区分“尚未手动 resize”和“已有手动尺寸”。
  - 管理最大化、关闭重开与属性变化时的保留规则。
- `useDragBounds`
  - 继续负责基于当前矩形计算视口内拖动边界。
  - 调整为支持包装层受控位置。

## 窗口状态模型

普通窗口状态包含：

```ts
interface ModalWindowState {
  position: { x: number; y: number };
  size: { width: number; height: number } | null;
  hasManualSize: boolean;
  isResizing: boolean;
}
```

规则：

- `position` 是基于 Ant Design 初始布局的 transform 位移。
- `size === null` 表示尚未手动 resize，继续使用外部 `width` 和内容自然高度。
- 第一次 resize 开始时测量 `.ant-modal-content` 的实际宽高，并转换为像素尺寸。
- 第一次有效 resize 后，`hasManualSize` 设为 `true`，后续由内部尺寸驱动。
- 用户尚未 resize 时，外部 `width` 变化继续生效。
- 用户完成首次 resize 后，外部 `width` 不覆盖手动尺寸。
- 关闭 Modal 不重置普通窗口状态；同一组件实例重新打开时恢复尺寸和位置。
- 组件卸载时状态自然销毁。
- `draggable` 或 `resizable` 关闭只禁用对应交互，不清理已保存的状态。

## 拖动交互

### 拖动区域

使用 `react-draggable` 的 `handle` 与 `cancel` 选择器，不再依赖标题栏 `mouseenter`/`mouseleave` 动态修改拖动禁用状态。

允许拖动：

- 自定义 Modal 标题栏。
- `.ant-modal-footer` 空白区域。

禁止从以下目标开始拖动：

- `button`
- `a`
- `input`
- `textarea`
- `select`
- `[contenteditable]`
- 常见 Ant Design 可交互控件根节点。
- 标题栏操作按钮。
- 四个 resize handle。
- 带有 `data-modal-no-drag` 属性的自定义元素及其后代。

对于 footer，只有 pointer 起点本身位于非交互区域时才开始拖动。默认 footer 的确认和取消按钮不会移动弹窗；按钮之间及 footer 周围的空白区域可以移动。

### 位置管理与边界

- 使用受控 `{ x, y }` 记录位移。
- `onDrag` 或 `onStop` 更新受控位置，具体更新频率以拖动流畅且不引入跳动为准。
- 每次拖动开始时读取包装节点的 `getBoundingClientRect()`，结合当前位移计算视口 bounds。
- `centered`、`style.top` 等只决定 Ant Design 的初始布局；`x/y` 是其上的用户位移。
- 最大化期间保存但不应用普通窗口位移。
- 取消最大化后恢复普通窗口位移。

### 光标

- 可拖动标题栏与 footer 空白区域显示 `cursor: move`。
- 活跃拖动状态显示 `cursor: grabbing`。
- footer 内按钮、链接、输入控件保持各自光标。
- 最大化时不显示移动光标。

## 四角 resize 交互

### Handle

普通窗口且 `resizable` 启用时渲染：

- `top-left`：`nwse-resize`
- `top-right`：`nesw-resize`
- `bottom-left`：`nesw-resize`
- `bottom-right`：`nwse-resize`

Handle 使用足够的透明命中区域，但视觉标识保持克制，不遮挡 footer 按钮或内容。Handle 必须位于交互层顶部，并被拖动 `cancel` 选择器排除。

### 几何规则

| Handle         | 固定边 | 更新内容                    |
| -------------- | ------ | --------------------------- |
| `bottom-right` | 左、上 | `width`、`height`           |
| `bottom-left`  | 右、上 | `width`、`height`、`x`      |
| `top-right`    | 左、下 | `width`、`height`、`y`      |
| `top-left`     | 右、下 | `width`、`height`、`x`、`y` |

左侧或顶部缩放时，位置变化量必须使用经过尺寸约束后的实际宽高差计算，确保触达最小/最大值后固定边不会继续漂移。

### 尺寸边界

默认值：

- `minWidth: 320`
- `minHeight: 200`
- `maxWidth`：未配置时为当前视口可容纳上限。
- `maxHeight`：未配置时为当前视口可容纳上限。

边界处理顺序：

1. 将配置值归一化为有限非负数。
2. 应用最小宽高。
3. 应用最大宽高。
4. 最大值小于最小值时，以归一化后的最小值作为有效最大值。
5. 再限制到当前视口和固定边能够容纳的范围。
6. 使用实际受限尺寸反推左侧/顶部 handle 的位置变化。

如果视口本身小于默认最小尺寸，以当前视口可容纳尺寸优先，避免窗口被锁死在视口外。

### Pointer Events 生命周期

`pointerdown` 时：

- `preventDefault()` 和 `stopPropagation()`。
- 测量当前窗口矩形。
- 保存起始 pointer、尺寸、位置和 `body` 原始样式。
- 标记 `isResizing = true`，从而暂停 draggable。
- 设置 Pointer Capture。
- 将 `document.body.style.userSelect` 设为 `none`。
- 设置与当前角一致的全局 cursor。

resize 期间监听：

- `pointermove`
- `pointerup`
- `pointercancel`
- `window.blur`

完成、取消或组件卸载时：

- 清理所有监听器或结束当前 resize。
- 清除 `isResizing`。
- 完整恢复 resize 开始前的 `body.userSelect` 和 `body.cursor`。

## 最大化、最小化与关闭兼容

### 最大化

- 最大化期间禁用 draggable。
- 不渲染四角 handle。
- 不应用普通窗口的手动宽高和位移。
- 保留普通窗口状态。
- 取消最大化后恢复此前的 `{ x, y, width, height }`。
- 如果 resize 进行中触发最大化，先安全结束 resize 并恢复全局样式。

### 最小化

- 沿用当前 Dock 卡片逻辑，不为 Dock 卡片增加 resize。
- 最小化不清理普通窗口状态。
- 从最小化恢复后继续使用此前的普通窗口尺寸和位置。
- 最小化期间 Modal 本体不渲染，因此不存在活跃 resize handle。

### 关闭和重新打开

- `open` 从 `true` 变为 `false` 时保留尺寸和位置。
- 同一组件实例重新打开时恢复上次状态。
- 关闭时若 resize 尚未结束，先取消 resize 并恢复全局样式。
- 组件真正卸载后状态自然重置。
- 现有 `destroyAll()` 只触发关闭流程，不额外清除仍挂载组件实例的窗口状态。

## 样式与可访问性

- Resize handle 使用 `role="separator"`。
- 根据角落提供可识别的 `aria-label`，中英文文案通过现有 Modal locale 扩展。
- Handle 不加入 Tab 顺序；本次不声明键盘 resize 能力。
- resize 活跃时添加状态 class，用于光标和可选的视觉反馈。
- 对支持 `prefers-reduced-motion` 的环境，应避免 resize 与现有宽高 transition 叠加产生滞后；直接拖动或 resize 时暂时关闭最大化过渡动画。
- 现有最大化动画仅用于状态切换，不用于 pointermove 的逐帧宽高更新。

## Demo 与文档

新增 `src/components/Modal/demo/resize.tsx`，展示：

- `draggable` 与 `resizable` 同时启用。
- 配置 `minWidth: 360`、`minHeight: 240`、`maxWidth: 900`、`maxHeight: 700`。
- 标题栏移动。
- footer 空白区域移动。
- footer 按钮不会触发移动。
- 四角 resize。
- resize 后最大化与取消最大化恢复。
- 关闭再打开后尺寸与位置仍保留。

中英文文档新增独立“拖动与调整尺寸”Demo，不将 resize 混入现有 `advanced.tsx`，以保持每个示例职责清晰。

类型 API 由现有 `<API>` 文档自动展示新增 `resizable` 和配置类型；如 Dumi 不自动展开联合类型，则在文档中增加 `ModalResizableConfig` API 区块。

## 验证策略

仓库当前没有 Modal 单元测试文件或现成测试脚本，因此本次以静态验证、构建验证和 Demo 交互验证为主。

### 静态与构建验证

- `npm run lint:es`
- `npm run lint:css`
- `npm run build`
- `npm run docs:build`

若仓库现有环境导致与本次变更无关的失败，需明确记录失败命令与原始错误。

### 手工交互验证矩阵

1. 默认 `resizable=false`，现有 Modal 行为不变。
2. 仅 `draggable` 时，标题栏和 footer 空白区域可移动。
3. footer 按钮、链接、输入控件和 `data-modal-no-drag` 不触发移动。
4. 仅 `resizable` 时可四角缩放但不可移动。
5. 四个角的固定边均保持稳定。
6. 配置最小、最大宽高生效。
7. 窗口无法通过拖动或 resize 完全离开当前视口。
8. resize 不会同时触发 draggable。
9. 最大化时不可拖动和 resize；取消最大化恢复之前状态。
10. 最小化并恢复后保留之前状态。
11. 关闭再打开保留状态；卸载重建后恢复初始状态。
12. `pointercancel`、窗口失焦、关闭及卸载后 `body` 样式均恢复。
13. 默认 footer、自定义 footer、`footer={null}` 均不报错。
14. `centered`、数值或字符串 `width`、自定义 `style.top` 和用户 `modalRender` 均能正常使用。
15. 视口尺寸变小后，再次拖动或 resize 能重新应用安全边界。

## 预期改动范围

核心改动预计涉及：

- `src/components/Modal/type.ts`
- `src/components/Modal/index.tsx`
- `src/components/Modal/ModalContext.ts`
- `src/components/Modal/components/DraggableWrapper.tsx`，或替换为 `ModalWindowWrapper.tsx`
- `src/components/Modal/components/ModalHeader.tsx`
- 新增 resize handle 组件与 resize Hook
- `src/hooks/useDragBounds.ts`，若受控位置需要调整接口
- `src/components/Modal/index.less`
- `src/components/Modal/demo/resize.tsx`
- `src/components/Modal/index.md`
- `src/components/Modal/index.en-US.md`
- Modal locale 的中英文 resize handle 文案及类型

不进行与本需求无关的组件重构。
