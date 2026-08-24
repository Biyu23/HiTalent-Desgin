---
category: Components
title: Drawer 抽屉
toc: content
---

# Drawer 抽屉

在 Ant Design Drawer 基础上，扩展了内侧边缘拖拽调整尺寸与最小化到全局 Dock 的能力，支持状态暂存与多窗口协同。

## 何时使用

- 需要根据内容动态调整抽屉宽度或高度（支持上下左右 4 个展开方向）。
- 用户正在进行复杂表单输入或任务处理，需要临时最小化到全局 Dock 并在稍后完整恢复。
- 需要在页面中同时协同管理多个抽屉或与 Modal 共享统一的悬浮任务栏。

## 代码演示

<code src="./demo/resizable.tsx" title="拖拽调整尺寸" description="通过拖拽内侧边缘调整宽度或高度，支持 4 个展开方向及 minSize / maxSize 约束。"></code>

<code src="./demo/minimizable.tsx" title="最小化与任务暂存" description="开启 minimizable 支持最小化到全局 Dock，并通过 DrawerRef 提供命令式控制，保留表单输入状态。"></code>

<code src="./demo/controlled.tsx" title="受控停靠方位" description="受控管理 minimized 状态与 8 个全局停靠方位。"></code>

<code src="./demo/shared-dock.tsx" title="与 Modal 共享 Dock" description="抽屉与弹窗可同时停靠在同一全局 Dock 中，并支持独立恢复与关闭。"></code>

<code src="./demo/custom-style.tsx" title="自定义样式" description="通过 styles 和 classNames 定制拖拽把手及最小化卡片样式。"></code>

## API

继承 [Ant Design Drawer](https://ant.design/components/drawer-cn#api) 的所有原生属性，新增以下扩展属性：

### DrawerProps

| 属性               | 说明                                                              | 类型                                                                                                     | 默认值           |
| ------------------ | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ---------------- |
| `size`             | 轴向受控尺寸（水平方向为宽，垂直方向为高）                        | `'default' \| 'large' \| number \| string`                                                               | -                |
| `defaultSize`      | 非受控模式下的初始轴向尺寸                                        | `number \| string`                                                                                       | `378`            |
| `minSize`          | 调整尺寸允许的最小像素尺寸                                        | `number`                                                                                                 | `100`            |
| `maxSize`          | 调整尺寸允许的最大像素尺寸，同时受限于实际容器可用边界            | `number`                                                                                                 | -                |
| `resizable`        | 是否允许通过内侧边缘拖拽调整尺寸，或提供生命周期回调配置          | `boolean \| DrawerResizableConfig`                                                                       | `false`          |
| `minimizable`      | 是否支持最小化到全局 Dock（自动保留 DOM 与表单状态）              | `boolean`                                                                                                | `false`          |
| `minimized`        | 受控最小化状态                                                    | `boolean`                                                                                                | -                |
| `minimizePosition` | 最小化卡片停靠位置                                                | `'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right' \| 'top' \| 'bottom' \| 'left' \| 'right'` | `'bottom-right'` |
| `onMinimizeChange` | 最小化状态变化回调                                                | `(minimized: boolean) => void`                                                                           | -                |
| `onClose`          | 关闭回调（从最小化 Dock 程序化关闭时 event 为 undefined）         | `(event?: React.MouseEvent \| React.KeyboardEvent) => void`                                              | -                |
| `classNames`       | 自定义类名配置，扩展 `dragger`、`minimizeButton`、`minimizedDock` | `DrawerClassNames`                                                                                       | -                |
| `styles`           | 自定义样式配置，扩展 `dragger`、`minimizedDock`                   | `DrawerStyles`                                                                                           | -                |

### DrawerRef

通过 `ref` 获取命令式控制对象；面板 DOM 仍可通过 `panelRef` 获取。

| 方法       | 说明                      | 类型         |
| ---------- | ------------------------- | ------------ |
| `minimize` | 最小化当前抽屉到全局 Dock | `() => void` |
| `restore`  | 从全局 Dock 恢复当前抽屉  | `() => void` |

### DrawerResizableConfig

| 属性            | 说明                                       | 类型                     |
| --------------- | ------------------------------------------ | ------------------------ |
| `onResizeStart` | 开始调整尺寸时触发                         | `() => void`             |
| `onResize`      | 调整尺寸过程中触发，参数为当前轴向像素尺寸 | `(size: number) => void` |
| `onResizeEnd`   | 结束调整尺寸时触发                         | `() => void`             |

### DrawerClassNames

继承 Ant Design `DrawerProps['classNames']`，扩展以下字段：

| 属性             | 说明                         | 类型     |
| ---------------- | ---------------------------- | -------- |
| `minimizeButton` | 标题栏最小化按钮的 className | `string` |
| `minimizedDock`  | 最小化 Dock 卡片的 className | `string` |
| `dragger`        | 拖拽调整尺寸把手的 className | `string` |

### DrawerStyles

继承 Ant Design `DrawerProps['styles']`，扩展以下字段：

| 属性            | 说明                       | 类型                  |
| --------------- | -------------------------- | --------------------- |
| `minimizedDock` | 最小化 Dock 卡片的行内样式 | `React.CSSProperties` |
| `dragger`       | 拖拽调整尺寸把手的行内样式 | `React.CSSProperties` |

## 注意事项

- **最小尺寸与边界保护**：`minSize` 默认保底为 100px，防止抽屉被拖拽折叠至 0px 导致把手不可抓取；`maxSize` 始终会自动与宿主容器可用尺寸取较小值。
- **状态保留机制**：开启 `minimizable` 时内部会保持 `destroyOnClose: false`，最小化时抽屉隐藏但 DOM 节点与表单输入状态完全保留。
- **受控与非受控**：未传 `size` 时为非受控模式，拖拽尺寸由组件内部持久记录；传入 `size` 时需在 `onResize` 回调中同步更新。
- **全局 Dock 协同**：与 Modal 共用相同的全局悬浮 Dock 管理器，多个弹窗和抽屉卡片会自动流式排列。
