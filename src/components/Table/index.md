---
category: Components
title: Table 增强表格
---

# Table 增强表格

Table 基于 Ant Design Table，提供列显隐、受控/非受控列状态、列宽调整、列/行拖拽、树形层级移动、Cell 预设渲染、斑马纹和自定义工具栏。Ant Design 原生的排序、筛选、分页、选择和展开能力可继续使用。

## 列状态设计

列定义只描述静态 schema；显示状态、顺序和用户调整后的像素宽度通过 `ColumnState` 管理。状态数组的顺序就是列顺序，适合直接保存到后端。

- 受控：传入 `columnState` 和 `onColumnStateChange`。
- 非受控：传入 `defaultColumnState`，可选监听 `onColumnStateChange`。
- 列显隐、调整宽度、拖拽排序和重置分别通过 `info.reason` 返回变更原因。
- 启用增强功能时建议给每个叶子列提供稳定的 `id`。
- `hideable: false` 的列始终可见。

### 列拖拽与列配置

演示受控列状态、列显隐、列宽调整和列拖拽。配置变化时 `onColumnStateChange` 返回纯数据，不包含 `render`、ReactNode 等静态列定义。

<code src="./demo/column-drag.tsx"></code>

### 行拖拽排序（扁平列表）

扁平列表支持 `before` / `after`。`onRowDragEnd` 返回原始 row key、记录和最终放置位置。

<code src="./demo/row-drag-flat.tsx"></code>

### 行拖拽排序（树形数据）

树形模式支持 `before` / `after` / `inside`，并返回完整 `dragPath` / `targetPath`。组件会内置阻止拖到自身或自身后代；`allowDrop` 仅用于业务规则，并会在悬停期间多次调用，因此应保持同步、快速且无副作用。

<code src="./demo/row-drag-tree.tsx"></code>

### 表头排序

排序能力由 Ant Design Table 提供，支持前端 sorter 和远程 onChange 两种方式。

<code src="./demo/sort.tsx"></code>

## 迁移说明

本次 API 重构移除了未完成或状态职责混乱的接口：

| 旧接口                               | 新方式                                                    |
| ------------------------------------ | --------------------------------------------------------- |
| `onColumnsChange`                    | `onColumnStateChange`                                     |
| 列定义中的 `hidden` / `defaultWidth` | `columnState` / `defaultColumnState`                      |
| `TableRef.resetAll`                  | `TableRef.resetColumnState`                               |
| `useTableColumns`                    | 业务请求后构造并持久化 `ColumnState`                      |
| `searchable` / `onColumnSearch`      | Ant Design `filters` / `filterDropdown`                   |
| 行内编辑扩展                         | Ant Design `render` / `onCell` + Form + 受控 `dataSource` |

`TableRef` 同时保留 Ant Design 的 `nativeElement` 和 `scrollTo`。
