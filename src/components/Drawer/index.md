---
category: Components
title: Drawer 抽屉
toc: content
---

# Drawer 抽屉

在 Ant Design Drawer 基础上，增加按展开方向调整尺寸与最小化到全局 Dock 的能力，支持状态暂存与多窗口协同。

## 核心特性

- **自适应方向缩放**：根据 `placement` 在内侧边缘渲染拖拽把手（`left`/`right` 调整宽度，`top`/`bottom` 调整高度），支持 `minSize`（默认 100px 防塌陷）与 `maxSize` 边界限制。
- **全局 Dock 最小化**：支持 8 个全局停靠方位与多实例排列，最小化期间持久保留 DOM、表单输入、滚动位置与调整后的尺寸。
- **双模式尺寸控制**：支持受控 `size` 与非受控 `defaultSize`，并兼容 `default`（378px）、`large`（736px）及自定义像素或百分比。
- **命令式控制与协同**：通过 `DrawerRef` 可在外部执行 `minimize` / `restore`，并与 Modal 共用全局 Dock。

## 代码演示

<code src="./demo/resizable-body.tsx" title="基础与尺寸调整" description="拖拽内侧边缘调整宽度或高度，支持 4 个展开方向并限制最小/最大尺寸。"></code>

<code src="./demo/minimize.tsx" title="最小化与任务暂存" description="从标题栏或通过 DrawerRef 最小化到全局 Dock，恢复后持久保留表单与调整后的尺寸。"></code>

<code src="./demo/controlled-minimize.tsx" title="受控停靠方位" description="受控管理 minimized 状态，并在 8 个全局停靠方位间切换。"></code>

<code src="./demo/resizable.tsx" title="局部容器渲染" description="在局部父容器中挂载抽屉，尺寸调整自动限制在父容器边界内。"></code>

<code src="./demo/shared-dock.tsx" title="Modal 与 Drawer 共享 Dock" description="弹窗与抽屉可同时停靠在同一全局 Dock 中，并支持独立恢复与关闭。"></code>

<code src="./demo/custom-style.tsx" title="自定义样式" description="通过 styles 和 classNames 深度定制头部、主体、底部、遮罩、内容区、拖拽把手及最小化卡片等各层级样式。"></code>

## API

除下列增强属性外，完全兼容 Ant Design `DrawerProps`。

### DrawerProps

| 属性               | 说明                                                                      | 类型                                                                                     | 默认值         |
| ------------------ | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | -------------- |
| `resizable`        | 是否允许拖拽调整尺寸，或提供 resize 生命周期回调                          | `boolean \| DrawerResizableConfig`                                                       | `false`        |
| `minSize`          | 调整尺寸允许的最小像素值（防止抽屉塌陷为 0 导致无法重新拖拽）             | `number`                                                                                 | `100`          |
| `maxSize`          | 调整尺寸允许的最大像素值，同时受限于实际容器可用边界                      | `number`                                                                                 | 容器尺寸       |
| `size`             | 轴向受控尺寸（水平方向为宽，垂直方向为高）                                | `'default' \| 'large' \| number \| string`                                               | -              |
| `defaultSize`      | 非受控模式下的初始轴向尺寸                                                | `number \| string`                                                                       | `378`          |
| `minimizable`      | 是否允许最小化到全局 Dock（自动保留 DOM 与表单状态）                      | `boolean`                                                                                | `false`        |
| `minimized`        | 受控最小化状态                                                            | `boolean`                                                                                | -              |
| `minimizePosition` | 最小化卡片停靠位置                                                        | `top-left \| top-right \| bottom-left \| bottom-right \| top \| bottom \| left \| right` | `bottom-right` |
| `onMinimizeChange` | 最小化或恢复状态变更回调                                                  | `(minimized: boolean) => void`                                                           | -              |
| `onClose`          | 点击关闭、ESC 或从 Dock 卡片关闭的回调（程序化关闭时 event 为 undefined） | `(event?) => void`                                                                       | -              |
| `classNames`       | 语义化 class，扩展 `dragger`、`minimizeButton`、`minimizedDock`           | `DrawerClassNames`                                                                       | -              |
| `styles`           | 语义化 style，扩展 `dragger`、`minimizeButton`、`minimizedDock`           | `DrawerStyles`                                                                           | -              |

### DrawerRef

通过 `ref` 获取命令式控制对象；面板 DOM 仍可通过 `panelRef` 获取。

| 方法       | 说明                      | 类型         |
| ---------- | ------------------------- | ------------ |
| `minimize` | 最小化当前抽屉到全局 Dock | `() => void` |
| `restore`  | 从全局 Dock 恢复当前抽屉  | `() => void` |

### DrawerResizableConfig

| 属性            | 说明                                     | 类型                     |
| --------------- | ---------------------------------------- | ------------------------ |
| `onResizeStart` | 开始调整尺寸时触发                       | `() => void`             |
| `onResize`      | 调整尺寸过程中触发，参数为当前轴向像素值 | `(size: number) => void` |
| `onResizeEnd`   | 结束调整尺寸时触发                       | `() => void`             |

## 注意事项

- **最小尺寸与边界保护**：`minSize` 默认保底为 100px，防止抽屉被拖拽折叠至 0px 导致把手不可抓取；`maxSize` 始终会自动与宿主容器可用尺寸取较小值。
- **状态保留机制**：开启 `minimizable` 时内部会保持 `destroyOnHidden: false`，最小化时抽屉隐藏但 DOM 节点与表单输入状态完全保留。
- **受控与非受控**：未传 `size` 时为非受控模式，拖拽尺寸由组件内部持久记录，同一实例关闭重开仍会保留；传入 `size` 时需在 `onResize` 回调中同步更新。
- **局部容器**：使用 `getContainer={false}` 时，请确保父容器具有相对定位（如 `position: relative`），抽屉尺寸将受限于父容器。
