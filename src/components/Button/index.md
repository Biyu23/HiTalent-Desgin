---
category: Components
title: Button 按钮
---

# Button 按钮

扩展自 Ant Design Button，在保留其全部原生能力的基础上，提供更丰富的图标位置支持、异步操作自动 Loading 以及内置防抖能力。

## 为什么需要这个组件

Ant Design 的 Button 功能完备，但在复杂业务场景下仍需手动维护状态——异步提交时要手写 `loading` 开关、高频点击时需要自建防抖逻辑、图标位置也仅支持 `left`。HiTalent Design Button 将这些高频需求内建为组件属性，让开发者专注于业务逻辑而非状态管理。

## 代码演示

### 基础用法

<code src="./demo/basic.tsx"></code>

### 图标位置

<code src="./demo/icon-position.tsx"></code>

### 自动 Loading

<code src="./demo/auto-loading.tsx"></code>

### 受控 Loading

<code src="./demo/controlled-loading.tsx"></code>

### 防抖点击

<code src="./demo/debounce.tsx"></code>

## API

<API src="./type.ts" identifier="ButtonProps" hideTitle></API>
