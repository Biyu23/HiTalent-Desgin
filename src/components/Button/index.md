---
category: Components
title: Button 按钮
toc: content
---

# Button 按钮

在 Ant Design Button 的完整能力上，增加异步 Loading、点击节流与禁用提示。

## 何时使用

- 提交操作返回 Promise，希望按钮自动显示并结束 Loading。
- 高频操作需要忽略冷却时间内的重复点击。
- 按钮禁用时仍需向用户解释原因。

普通导航或不需要这些能力的操作，可以继续直接使用 Ant Design Button。

## 核心能力

- `autoLoading` 自动跟随 `onClick` 返回的 Promise。
- `throttle` 立即执行首次点击，并忽略冷却时间内的后续点击。
- `tooltip` 接受快捷字符串或完整 TooltipProps。
- 其余原生属性、Ref 和样式能力保持兼容。

## 代码演示

<code src="./demo/auto-loading.tsx" title="自动 Loading" description="onClick 返回 Promise 时自动进入 Loading，并在 Promise 完成后恢复。"></code>

<code src="./demo/throttle.tsx" title="节流点击" description="设置毫秒级 throttle；首次点击立即执行，冷却时间内的重复点击会被忽略。"></code>

<code src="./demo/tooltip.tsx" title="禁用提示" description="为按钮配置 tooltip，在禁用或需要补充说明时仍能展示原因。"></code>

## 注意事项

- `onClick` 不返回 Promise 时，`autoLoading` 不会等待异步任务。
- 需要由表单统一管理状态时，建议关闭 `autoLoading` 并使用受控 `loading`。
- `throttle` 用于避免重复触发，不替代服务端幂等校验。
