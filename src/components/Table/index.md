---
category: Components
title: Table 表格
toc: content
---

# Table

Table 在 Ant Design Table 基础上提供列状态、列设置、列宽调整、列拖拽和行拖拽能力。列状态使用 `useMergedState` 管理，行列拖拽保持相互隔离。

## 代码演示

<code src="./demo/candidate-drag.tsx" title="候选人扁平拖拽" description="在高密度候选人列表中组合行选择、行列拖拽、列配置、列宽、横向滚动和分页。"></code>

<code src="./demo/team-tree-drag.tsx" title="团队树形拖拽" description="树形团队指标表，支持跨层级行拖拽、列拖拽、列配置和汇总行。"></code>

<code src="./demo/candidate-sort.tsx" title="候选人排序" description="独立展示受控排序状态，不与行拖拽混用。"></code>

## API 要点

- `columnState` 存在时为受控状态，不存在时使用 `defaultColumnState` 初始化内部状态。
- `onColumnStateChange` 仅通知新的列状态，不参与受控判断。
- `columnSetting`、`columnResize`、`columnDrag` 和 `rowDrag` 分别启用对应能力。
- 行拖拽完成后通过 `onRowDragEnd` 返回 source、target、placement 和不可变生成的 `nextDataSource`。
- 所有可增强叶子列必须提供唯一字符串 `key`。
- 排序和行拖拽表达不同的数据顺序语义，建议由业务场景互斥启用。
