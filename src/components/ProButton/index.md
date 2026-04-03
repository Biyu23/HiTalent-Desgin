---
category: Components
title: ProButton
subtitle: 高级按钮
demo:
  cols: 2
---

# ProButton 高级按钮

在 Ant Design 原生 `Button` 组件的基础上进行了业务层面的进阶封装。
内置了开发中最常用的**异步 Loading 控制**、**点击防抖拦截**，极大地精简了**二次确认 (Popconfirm)** 与 **气泡提示 (Tooltip)** 的样板代码，并支持更灵活的**多方位图标排布**方案。

## 代码演示

<code src="./demo/auto-loading.tsx">自动 Loading</code>
<code src="./demo/debounce.tsx">前置防抖</code>
<code src="./demo/icon-position.tsx">灵活的图标位置</code>

---

## API 说明

`ProButton` 继承了 Ant Design 原生 `Button` 的所有属性，并拓展了以下高级能力：

| 属性         | 说明                                                        | 类型                                           | 默认值   |
| ------------ | ----------------------------------------------------------- | ---------------------------------------------- | -------- |
| onClick      | 点击事件的回调。如果返回 `Promise`，将自动接管 Loading 状态 | `(e: Event) => void \| Promise<any>`           | -        |
| autoLoading  | 是否开启基于 Promise 的自动 loading 控制                    | `boolean`                                      | `true`   |
| debounce     | 前置防抖/节流的锁定时间（毫秒），大于 0 时生效              | `number`                                       | `0`      |
| iconPosition | 图标与文本的相对排布位置                                    | `'left'` \| `'right'` \| `'top'` \| `'bottom'` | `'left'` |
