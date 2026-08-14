---
category: Components
title: Drawer 抽屉
toc: content
---

# Drawer 抽屉

在 Ant Design Drawer 的基础上，增加按展开方向调整尺寸和最小化到全局 Dock 的能力。

## 何时使用

- 抽屉承载表格、表单或详情，用户需要按内容调整可视区域。
- 需要暂时收起复杂任务，继续操作当前页面，并在恢复后保留任务上下文。
- 抽屉位于局部容器中，尺寸必须限制在容器边界内。

## 核心能力

- `left` / `right` 调整宽度，`top` / `bottom` 调整高度。
- 把手始终位于朝向页面内容的内侧边缘，外侧固定边保持不动。
- `maxSize` 与实际 Drawer 容器尺寸取较小值。
- 支持受控 `size` 与非受控 `defaultSize`。
- 最小化到 8 个全局停靠方位，支持多实例排列、滚动和独立拖动。
- 最小化期间保留 DOM、表单状态、滚动位置和用户调整后的尺寸。
- Modal 与 Drawer 共用同一个全局 Dock。

## 代码演示

<code src="./demo/resizable-body.tsx" title="基础用法" description="拖拽边缘调整抽屉宽度或高度。"></code>

<code src="./demo/resizable.tsx" title="局部容器" description="在局部容器内渲染抽屉，尺寸受限于容器范围。"></code>

<code src="./demo/minimize.tsx" title="最小化与命令式控制" description="从标题栏或 DrawerRef 最小化，恢复后保留内容和调整后的尺寸。"></code>

<code src="./demo/controlled-minimize.tsx" title="受控最小化" description="使用 minimized 和 onMinimizeChange 控制状态，并切换 8 个停靠方位。"></code>

<code src="./demo/shared-dock.tsx" title="共享全局 Dock" description="Modal 与 Drawer 可以停靠在同一位置并独立恢复或关闭。"></code>

## API

除下列增强属性外，同时支持 Ant Design `DrawerProps`。

| 属性               | 说明                                                                       | 类型                                                                                     | 默认值         |
| ------------------ | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | -------------- |
| `size`             | 轴向尺寸；left/right 为宽度，top/bottom 为高度；受控模式                   | `'default' \| 'large' \| number \| string`                                               | -              |
| `defaultSize`      | 非受控模式的初始轴向尺寸                                                   | `number \| string`                                                                       | `378`          |
| `maxSize`          | resize 最大尺寸，最终仍受实际 Drawer 容器限制                              | `number`                                                                                 | 容器尺寸       |
| `resizable`        | 是否允许 resize，或提供 resize 生命周期回调                                | `boolean \| DrawerResizableConfig`                                                       | `false`        |
| `minimizable`      | 是否允许最小化到全局 Dock                                                  | `boolean`                                                                                | `false`        |
| `minimized`        | 受控最小化状态                                                             | `boolean`                                                                                | -              |
| `minimizePosition` | 最小化卡片的停靠位置                                                       | `top-left \| top-right \| bottom-left \| bottom-right \| top \| bottom \| left \| right` | `bottom-right` |
| `onMinimizeChange` | 最小化或恢复请求回调                                                       | `(minimized: boolean) => void`                                                           | -              |
| `onClose`          | 点击关闭、按下 ESC 或从 Dock 关闭的回调；程序化关闭时 event 为 undefined   | `(event?) => void`                                                                       | -              |
| `width`            | 旧版横向受控尺寸，建议改用 `size`                                          | `number \| string`                                                                       | -              |
| `height`           | 旧版纵向受控尺寸，建议改用 `size`                                          | `number \| string`                                                                       | -              |
| `classNames`       | Ant Design 语义 class，并增加 `dragger`、`minimizeButton`、`minimizedDock` | `DrawerClassNames`                                                                       | -              |
| `styles`           | Ant Design 语义样式，并增加 `dragger`、`minimizeButton`、`minimizedDock`   | `DrawerStyles`                                                                           | -              |

### DrawerRef

组件 `ref` 返回命令式控制对象；`panelRef` 仍用于获取 Drawer 面板 DOM。

| 方法       | 说明                    | 类型         |
| ---------- | ----------------------- | ------------ |
| `minimize` | 最小化 Drawer           | `() => void` |
| `restore`  | 从全局 Dock 恢复 Drawer | `() => void` |

### DrawerResizableConfig

| 属性            | 说明                    | 类型                     |
| --------------- | ----------------------- | ------------------------ |
| `onResizeStart` | 开始调整尺寸时触发      | `() => void`             |
| `onResize`      | 尺寸变化时触发，单位 px | `(size: number) => void` |
| `onResizeEnd`   | 结束或取消调整时触发    | `() => void`             |

## 最小化状态

- 未提供 `minimized` 时，组件在内部保存最小化状态。
- 提供 `minimized` 时为受控模式；必须在 `onMinimizeChange` 中更新状态才会改变视觉结果。
- `open=false` 时不会显示 Drawer 或 Dock。`minimize()` 不会主动把 `open` 改为 `true`。
- 启用 `minimizable` 后，组件会保留隐藏 DOM；从 Dock 恢复时表单和 resize 尺寸不会丢失。
- 启用 `minimizable` 后，关闭按钮固定在标题栏右侧；`closable=false`、自定义 `closeIcon` 和 closable 对象配置仍然有效。
- 同一组件库前缀下，Modal 与 Drawer 会按 `minimizePosition` 共用全局 Dock。

## 尺寸模式

- 提供 `size` 时为受控模式，必须在 `onResize` 中更新 `size` 才会改变视觉尺寸。
- 未提供 `size`、且未提供当前轴对应的 `width` / `height` 时为非受控模式；拖动结果由组件保存，同一实例关闭重开后仍会保留。
- `width` / `height` 作为 Ant Design 5 兼容属性，同样视为受控值。
- `size="default"` 为 378px，`size="large"` 为 736px；CSS 字符串会作为初始或受控尺寸使用。

## 展开方向

| placement | 把手位置 | 增大尺寸的拖动方向 |
| --------- | -------- | ------------------ |
| `left`    | 右边缘   | 向右               |
| `right`   | 左边缘   | 向左               |
| `top`     | 下边缘   | 向下               |
| `bottom`  | 上边缘   | 向上               |

## 注意事项

- `maxSize` 会与实际 Drawer 根容器的可用宽度或高度取较小值。
- `getContainer={false}` 时应确保父容器具有定位上下文，例如 `position: relative`；最小化卡片仍进入全局 Dock。
- 本组件不提供 `minSize`，最小尺寸与 Ant Design 6 一致为 0。
- 把手使用 `role="separator"`，暂不提供键盘 resize 操作。
- 不再需要最小化实例时应通过关闭操作同步清理业务层的 `open` 状态。
