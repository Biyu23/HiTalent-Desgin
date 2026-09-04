---
category: Components
title: Modal 增强弹窗
toc: content
---

# Modal 增强弹窗

在 Ant Design Modal 基础上增强了拖拽移动（`draggable`）、自由缩放（`resizable`）、双击与按钮最大化（`maximizable`）、最小化至全局 Dock（`minimizable`）及受控状态与 Ref 控制能力。

## 何时使用

- 需要在页面中自由拖动弹窗位置或调整弹窗宽度与高度。
- 弹窗包含较多内容或复杂表格/图表，需要一键最大化至全屏展示。
- 用户需要临时挂起当前弹窗任务，最小化到页面全局 Dock 中暂存，并在稍后无损恢复。
- 需要通过外部状态或命令式 Ref 精确控制弹窗的最小化、最大化与位置尺寸重置。

## 代码演示

<code src="./demo/draggable.tsx" title="拖拽移动" description="开启 draggable 属性，可通过标题栏或底部空白区域拖拽移动弹窗位置。"></code>

<code src="./demo/resizable.tsx" title="自由缩放" description="开启 resizable 属性，可通过拖拽右下角把手调整弹窗宽高，支持 minWidth/minHeight 约束与 onResize 监听。"></code>

<code src="./demo/maximizable.tsx" title="最大化" description="开启 maximizable 属性，支持点击右上角最大化图标或双击标题栏在全屏与默认尺寸间切换。"></code>

<code src="./demo/minimizable.tsx" title="最小化与全局 Dock" description="开启 minimizable 属性支持最小化到全局 Dock，可配置 8 个停靠方位，折叠期间完整保留 DOM 与表单输入状态。"></code>

<code src="./demo/controlled.tsx" title="受控状态与 Ref 控制" description="通过 minimized/maximized 受控属性及 ModalRef 命令式方法精确控制弹窗状态。"></code>

## API

继承 [Ant Design Modal](https://ant.design/components/modal-cn#api) 的所有原生属性，新增以下扩展属性：

### ModalProps

| 属性                | 说明                                                                     | 类型                                                                                                     | 默认值           |
| ------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- | ---------------- |
| `draggable`         | 是否允许拖拽（把手为标题栏与底部）                                       | `boolean`                                                                                                | `false`          |
| `resizable`         | 是否允许缩放，或提供缩放配置                                             | `boolean \| ModalResizableConfig`                                                                        | `false`          |
| `maximizable`       | 是否支持最大化全屏                                                       | `boolean`                                                                                                | `false`          |
| `minimizable`       | 是否支持最小化至全局 Dock（折叠期间保留 DOM 与表单输入）                 | `boolean`                                                                                                | `false`          |
| `minimizePosition`  | 最小化悬浮窗的停靠方位                                                   | `'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right' \| 'top' \| 'bottom' \| 'left' \| 'right'` | `'bottom-right'` |
| `minimized`         | 受控最小化状态                                                           | `boolean`                                                                                                | -                |
| `maximized`         | 受控最大化状态                                                           | `boolean`                                                                                                | -                |
| `onMinimizeChange`  | 最小化状态切换时的回调                                                   | `(minimized: boolean) => void`                                                                           | -                |
| `onMaximizedChange` | 最大化状态切换时的回调                                                   | `(maximized: boolean) => void`                                                                           | -                |
| `classNames`        | 自定义类名配置，扩展 `title`、`actions`、`resizeHandle`、`minimizedDock` | `ModalClassNames`                                                                                        | -                |
| `styles`            | 自定义样式配置，扩展 `resizeHandle`、`minimizedDock`                     | `ModalStyles`                                                                                            | -                |

### ModalResizableConfig

| 属性            | 说明                                 | 类型                                                | 默认值 |
| --------------- | ------------------------------------ | --------------------------------------------------- | ------ |
| `minWidth`      | 允许缩放的最小宽度，单位 px          | `number`                                            | `320`  |
| `minHeight`     | 允许缩放的最小高度，单位 px          | `number`                                            | `200`  |
| `maxWidth`      | 允许缩放的最大宽度，受视口与容器限制 | `number`                                            | -      |
| `maxHeight`     | 允许缩放的最大高度，受视口与容器限制 | `number`                                            | -      |
| `onResizeStart` | 开始缩放拖动时的回调                 | `() => void`                                        | -      |
| `onResize`      | 缩放过程中的实时回调                 | `(size: { width: number; height: number }) => void` | -      |
| `onResizeEnd`   | 结束缩放拖动时的回调                 | `() => void`                                        | -      |

### ModalRef

通过 `ref` 获取组件实例后可调用的命令式方法：

| 方法            | 说明                     | 类型         |
| --------------- | ------------------------ | ------------ |
| `restore`       | 恢复最小化的弹窗         | `() => void` |
| `maximize`      | 最大化弹窗               | `() => void` |
| `unmaximize`    | 取消最大化并恢复普通尺寸 | `() => void` |
| `minimize`      | 最小化弹窗至 Dock 悬浮窗 | `() => void` |
| `resetPosition` | 重置拖拽位置居中         | `() => void` |
| `resetSize`     | 重置手动调整过的宽高尺寸 | `() => void` |

### ModalClassNames

继承 Ant Design `ModalProps['classNames']`，扩展以下字段：

| 属性            | 说明                           | 类型     |
| --------------- | ------------------------------ | -------- |
| `title`         | 弹窗标题区域的 className       | `string` |
| `actions`       | 标题栏操作按钮区域的 className | `string` |
| `resizeHandle`  | 拖拽调整尺寸把手的 className   | `string` |
| `minimizedDock` | 最小化 Dock 卡片的 className   | `string` |

### ModalStyles

继承 Ant Design `ModalProps['styles']`，扩展以下字段：

| 属性            | 说明                       | 类型                  |
| --------------- | -------------------------- | --------------------- |
| `resizeHandle`  | 拖拽调整尺寸把手的行内样式 | `React.CSSProperties` |
| `minimizedDock` | 最小化 Dock 卡片的行内样式 | `React.CSSProperties` |
