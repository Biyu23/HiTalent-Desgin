---
category: Components
title: ProModal
subtitle: 高级弹窗
demo:
  cols: 1
---

# ProModal 高级弹窗

在 Ant Design 原生 `Modal` 的基础上，深度集成了桌面级的 **窗口管理（拖拽、最大化、最小化）** 能力。

它完美解决了后台系统中填报复杂表单时，需要临时查阅底层页面数据导致“弹窗频繁开关丢失数据”或“多开弹窗互相遮挡”的痛点。

## 代码演示

<code src="./demo/auto-loading.tsx">基础用法与异步提交</code>
<code src="./demo/advanced.tsx">高级窗口管理 (最小化不销毁)</code>
<code src="./demo/multiple-minimize.tsx">多开与自动排列测试</code>

---

## API 说明

`ProModal` 完全继承了 Ant Design 原生 `Modal` 的所有属性，并在此基础上拓展了以下高级窗口控制能力：

### 窗口管理 (Window Management)

| 属性             | 说明                                                                                                         | 类型                                                                                          | 默认值           |
| ---------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- | ---------------- |
| draggable        | 是否允许拖拽（拖拽把手默认为标题栏，全屏时自动禁用）                                                         | `boolean`                                                                                     | `false`          |
| minimizable      | 是否支持最小化。开启后，点击减号会将弹窗挂起到全局悬浮窗，**不会销毁 DOM 及内部表单状态**                    | `boolean`                                                                                     | `false`          |
| maximizable      | 是否支持最大化。开启后，可一键切换为全屏沉浸式体验                                                           | `boolean`                                                                                     | `false`          |
| minimizePosition | 最小化悬浮窗的停靠位置。支持预设字符串或自定义 CSS 样式（如 `{ top: 100, right: 20 }`）                      | `'top-left'` \| `'top-right'` \| `'bottom-left'` \| `'bottom-right'` \| `React.CSSProperties` | `'bottom-right'` |
| maskMinimizable  | 点击遮罩层时是否执行最小化操作（需配合 `minimizable` 使用）。默认为 `false` 时点击遮罩执行正常的关闭销毁逻辑 | `boolean`                                                                                     | `false`          |

> **💡 提示：** > \* 只要开启了 `minimizable`，底层会自动在 `body` 挂载单例 `Flex` 容器。即使同时最小化数十个弹窗，它们也会自动整齐排布，绝不重叠。
>
> - 最小化后的悬浮卡片依然支持独立拖拽，可以随时移出排队容器。
