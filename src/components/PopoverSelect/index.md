---
category: Components
title: PopoverSelect 气泡选择
---

# PopoverSelect 气泡选择

下拉菜单基于 Popover 气泡形式展开的高级选择器，内置虚拟滚动、全选控制、字段映射与灵活的提交格式。

## 为什么需要这个组件

Ant Design 的 Select 在海量数据时性能堪忧，且样式固定难以深度定制。PopoverSelect 基于 Popover 气泡实现，内置虚拟滚动使之轻松处理万级数据，支持字段映射适配任意后端数据结构，提交格式可在字符串与数组间灵活切换——对于对接老旧数据库中 `varchar` 类型字段的场景尤为实用。

## 代码演示

### 基础单选

<code src="./demo/basic.tsx"></code>

### 多选带确认机制

<code src="./demo/multiple.tsx"></code>

### 字符串提交与全选

<code src="./demo/string-value.tsx"></code>

### 字段映射与虚拟滚动

<code src="./demo/virtual.tsx"></code>

### 高度定制渲染

<code src="./demo/custom.tsx"></code>

### 空状态与无匹配

<code src="./demo/empty-state.tsx"></code>

### 禁用选项

<code src="./demo/disabled-options.tsx"></code>

## API

<API src="./type.ts" identifier="PopoverSelectProps" hideTitle></API>
