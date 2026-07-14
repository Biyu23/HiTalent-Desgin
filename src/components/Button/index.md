---
category: Components
title: Button 按钮
---

# Button 按钮

基于 Ant Design Button 封装，新增 `autoLoading`、`throttle`、`tooltip` 能力，保留全部原生 API。

## 为什么需要这个组件

在业务开发中，按钮常常需要处理异步提交的 loading 状态、防止重复点击、以及禁用时给用户解释原因。这些逻辑分散在各处，Button 把它们内建为组件属性，使用更直接。

## 代码演示

### 自动 Loading

<code src="./demo/auto-loading.tsx"></code>

### 受控 Loading

<code src="./demo/controlled-loading.tsx"></code>

### 节流点击

<code src="./demo/throttle.tsx"></code>

### 禁用提示

<code src="./demo/tooltip.tsx"></code>

## API

<API src="./type.ts" identifier="ButtonProps" hideTitle></API>
