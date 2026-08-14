---
category: Components
title: Modal 高级弹窗
toc: content
---

# Modal 高级弹窗

在 Ant Design Modal 上增加拖拽、缩放、最大化与多窗口最小化，构建可保留任务上下文的桌面级工作窗口。

## 何时使用

- 用户需要移动弹窗以查看背后的信息。
- 表单或复杂内容需要调整窗口尺寸、最大化阅读。
- 多项并行任务需要暂时最小化，并在恢复后保留表单和组件状态。

短确认、一次性提示等简单反馈无需启用窗口能力，保持 Ant Design Modal 的默认使用方式即可。

## 核心能力

- 从标题栏和底部空白区域拖动，同时避开按钮、输入框等交互控件。
- 从右下角缩放，并通过 `ModalResizableConfig` 控制最小/最大尺寸。
- 最大化、还原、最小化与 Dock 自动排列。
- 最小化时保留 DOM 和表单状态。
- 通过 `ModalRef` 命令式控制单个实例，通过静态方法统一清理实例。

## 代码演示

<code src="./demo/basic.tsx" title="基础用法" description="使用 open 控制显示，并通过 onCancel 和 onOk 处理关闭与确认。"></code>

<code src="./demo/form-submit.tsx" title="表单提交" description="结合 Form 校验和 confirmLoading 完成异步提交，并在关闭后重置表单。"></code>

<code src="./demo/resize.tsx" title="拖动与调整尺寸" description="从标题栏或底部空白区域移动弹窗，并从右下角缩放；交互控件仍可正常点击。"></code>

<code src="./demo/advanced.tsx" title="高级窗口管理" description="组合 draggable、resizable、maximizable 和 minimizable，最小化后仍保留内容状态。"></code>

<code src="./demo/imperative-control.tsx" title="命令式控制（Ref API）" description="通过 ModalRef 从组件外部执行 minimize、restore、maximize 与 unmaximize。"></code>

<code src="./demo/multiple-minimize.tsx" title="多窗口最小化" description="同时最小化多个实例并在全局 Dock 中自动排列，每个最小化卡片仍可独立拖动。"></code>

<code src="./demo/destroy-all.tsx" title="销毁所有弹窗" description="使用 Modal.destroyAll() 清理普通、最大化和最小化的全部实例，适合路由切换。"></code>

## API

### ModalProps

除下列窗口增强属性外，同时支持 Ant Design `ModalProps`（不包含其 `closable`、`title` 和 `onCancel` 定义）。

| 属性                | 说明                                | 类型                                                                                     | 默认值         |
| ------------------- | ----------------------------------- | ---------------------------------------------------------------------------------------- | -------------- |
| `closable`          | 是否显示关闭按钮                    | `boolean`                                                                                | `true`         |
| `title`             | 弹窗标题                            | `ReactNode`                                                                              | -              |
| `onCancel`          | 点击关闭、按下 ESC 或统一销毁的回调 | `(event?) => void`                                                                       | -              |
| `draggable`         | 是否允许从标题栏拖动                | `boolean`                                                                                | `false`        |
| `resizable`         | 是否允许缩放                        | `boolean`                                                                                | `false`        |
| `minimizable`       | 是否允许最小化到全局 Dock           | `boolean`                                                                                | `false`        |
| `maximizable`       | 是否允许最大化                      | `boolean`                                                                                | `false`        |
| `minimizePosition`  | 最小化卡片的停靠位置                | `top-left \| top-right \| bottom-left \| bottom-right \| top \| bottom \| left \| right` | `bottom-right` |
| `minimized`         | 受控最小化状态                      | `boolean`                                                                                | -              |
| `maximized`         | 受控最大化状态                      | `boolean`                                                                                | -              |
| `onMinimizeChange`  | 最小化状态变化回调                  | `(minimized: boolean) => void`                                                           | -              |
| `onMaximizedChange` | 最大化状态变化回调                  | `(maximized: boolean) => void`                                                           | -              |

### ModalResizableConfig

| 属性        | 说明                       | 类型     | 默认值 |
| ----------- | -------------------------- | -------- | ------ |
| `minWidth`  | 最小宽度，单位 px          | `number` | `320`  |
| `minHeight` | 最小高度，单位 px          | `number` | `200`  |
| `maxWidth`  | 最大宽度，最终仍受视口限制 | `number` | -      |
| `maxHeight` | 最大高度，最终仍受视口限制 | `number` | -      |

### ModalRef

| 方法         | 说明                     | 类型         |
| ------------ | ------------------------ | ------------ |
| `restore`    | 恢复最小化的弹窗         | `() => void` |
| `maximize`   | 最大化弹窗               | `() => void` |
| `unmaximize` | 取消最大化并恢复普通尺寸 | `() => void` |
| `minimize`   | 最小化弹窗               | `() => void` |

### ModalStaticMethods

| 方法         | 说明                                          | 类型         |
| ------------ | --------------------------------------------- | ------------ |
| `destroyAll` | 销毁全部普通、最大化和最小化状态的 Modal 实例 | `() => void` |

## 注意事项

- 只有标题栏和底部空白区域会触发拖动；表单控件、按钮和可编辑区域不会抢占交互。
- 缩放配置应为实际内容保留合理的 `minWidth` 和 `minHeight`。
- 最小化会保留 DOM；不再需要实例时应正常关闭，路由级清理可使用 `Modal.destroyAll()`。
- 多窗口层级与 Dock 由全局上下文管理，请避免在不同 React 根节点间共享同一组实例。
