---
category: Components
title: Button 按钮
toc: content
---

# Button 按钮

在 Ant Design Button 的基础上扩展了异步 Loading、点击节流与提示气泡能力。

## 何时使用

- 提交操作返回 Promise，希望按钮自动进入并结束 Loading 状态。
- 高频点击场景需要忽略冷却时间内的重复点击（节流防重）。
- 按钮在正常或禁用状态下需要快速配置气泡提示（Tooltip）。

## 代码演示

<code src="./demo/auto-loading.tsx" title="自动 Loading" description="onClick 返回 Promise 时自动进入 Loading，并在 Promise 决议后恢复。"></code>

<code src="./demo/throttle.tsx" title="节流点击" description="设置毫秒级 throttle，首次点击立即执行，冷却期内的重复点击被忽略。"></code>

<code src="./demo/tooltip.tsx" title="提示气泡" description="通过 tooltip 属性为按钮配置提示，支持快捷文本与完整 TooltipProps 配置。"></code>

<code src="./demo/semantic-styles.tsx" title="语义化样式" description="通过强类型 root、content 插槽定制按钮，并验证消费方样式覆盖顺序。"></code>

## API

### Button

继承 [Ant Design Button](https://ant.design/components/button-cn#api) 的所有原生属性，新增以下扩展属性：

| 属性        | 说明                                                                                          | 类型                                                                 | 默认值 |
| ----------- | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ------ |
| autoLoading | 是否自动控制 loading 状态（当 `onClick` 返回 Promise 时自动进入 loading，Promise 决议后恢复） | `boolean`                                                            | `true` |
| throttle    | 节流间隔（毫秒）。首次点击立即触发，冷却期内的重复点击被忽略                                  | `number`                                                             | `0`    |
| tooltip     | 提示气泡配置。支持传入 ReactNode 快捷设置文案，或传入完整 `TooltipProps`（不含 children）     | `ReactNode \| Omit<TooltipProps, 'children'>`                        | -      |
| onClick     | 点击事件回调，支持返回 Promise 配合 `autoLoading`                                             | `(event: React.MouseEvent<HTMLElement>) => void \| Promise<unknown>` | -      |

## 语义化样式

`className` 和 `style` 作用于按钮元素。`rootClassName`、`classNames` 与 `styles` 提供 Ant Design 风格的语义化定制能力；可用插槽为 `root`、`content`。消费方样式在内部样式之后合并，因此同名行内属性由消费方覆盖。
