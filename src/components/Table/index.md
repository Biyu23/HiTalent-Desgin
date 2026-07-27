---
category: Components
title: Table 增强表格
---

# Table 增强表格

在 Ant Design Table 的基础上，提供了列显隐设置、列宽拖拽调整、列/行拖拽排序、表头搜索、Cell 预设渲染、行内编辑、斑马纹、自定义操作栏等桌面级数据表格体验。

## 为什么需要这个组件

Ant Design 的 Table 功能强大但缺少一些企业级场景的高频能力：列太多时需要让用户自定义显示哪些列、列宽需要可拖拽调整并持久化、希望快速给单元格加状态标签/进度条/日期格式化等预设渲染、需要在表格内直接编辑单元格而不用弹窗。HiTalent Design Table 将这些能力内置为一个组件，零配置开箱即用，同时支持受控/非受控两种模式，方便接入后端持久化。

### 列拖拽 & 列配置

演示列显隐设置、列宽拖拽调整、列拖拽排序功能。当列配置发生变化时，`onColumnsChange` 回调自动触发，可在此回调中调用接口保存列配置到后端。

<code src="./demo/column-drag.tsx"></code>

### 行拖拽排序（扁平列表）

演示普通的扁平列表行拖拽排序功能。拖拽行左侧手柄图标即可调整行的顺序。拖拽结束后 `onRowDragEnd` 回调返回被拖拽行和目标行的信息，可在此回调中更新数据源并保存到后端。

<code src="./demo/row-drag-flat.tsx"></code>

### 行拖拽排序（树形数据）

演示树形数据的拖拽排序功能。启用 `treeMode: true` 后，支持 `before` / `after` / `inside` 三种放置位置，可将行拖入另一行内部构建父子层级关系。同时支持配置 `allowDrop` 防止将父节点拖入其子节点内部造成循环引用。

<code src="./demo/row-drag-tree.tsx"></code>

### 表头排序

演示表头排序功能，包括前端排序（自定义 `sorter` 函数）和远程排序（`sorter: true` + `onChange` 回调）两种模式。排序能力由 antd Table 内置提供，HiTable 原生继承该能力，列定义中配置 `sorter` 即可启用。支持中文拼音排序、数字排序、日期排序，以及默认排序。

<code src="./demo/sort.tsx"></code>
