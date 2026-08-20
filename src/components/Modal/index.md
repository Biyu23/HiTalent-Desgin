---
category: Components
title: Modal 增强弹窗
toc: content
---

# Modal 增强弹窗

在 Ant Design Modal 基础上增强了拖拽移动（draggable）、双击最大化（maximizable）、自由缩放（resizable）、最小化至全局 Dock（minimizable）及受控状态控制。

## 代码演示

<code src="./demo/draggable.tsx">拖拽移动</code>
<code src="./demo/resizable.tsx">自由缩放</code>
<code src="./demo/maximizable.tsx">最大化</code>
<code src="./demo/minimizable.tsx">最小化与停靠</code>
<code src="./demo/controlled.tsx">受控与 Ref 控制</code>

## API

除下列增强属性与方法外，其余属性完全继承自 Ant Design [ModalProps](https://ant.design/components/modal-cn#api)。

### ModalProps (增强属性)

| 属性                | 说明                                                       | 类型                                                                                                     | 默认值           |
| ------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ---------------- |
| `draggable`         | 是否允许从标题栏/底部拖动（支持双击标题栏快速最大化/还原） | `boolean`                                                                                                | `false`          |
| `resizable`         | 是否允许自由缩放尺寸，或提供缩放配置                       | `boolean \| ModalResizableConfig`                                                                        | `false`          |
| `maximizable`       | 是否支持最大化全屏                                         | `boolean`                                                                                                | `false`          |
| `minimizable`       | 是否支持最小化至全局 Dock（折叠期间保留 DOM 与表单输入）   | `boolean`                                                                                                | `false`          |
| `minimizePosition`  | 最小化悬浮窗的停靠方位                                     | `'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right' \| 'top' \| 'bottom' \| 'left' \| 'right'` | `'bottom-right'` |
| `minimized`         | 受控最小化状态                                             | `boolean`                                                                                                | -                |
| `maximized`         | 受控最大化状态                                             | `boolean`                                                                                                | -                |
| `onMinimizeChange`  | 最小化状态切换时的回调                                     | `(minimized: boolean) => void`                                                                           | -                |
| `onMaximizedChange` | 最大化状态切换时的回调                                     | `(maximized: boolean) => void`                                                                           | -                |

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
