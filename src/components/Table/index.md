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
- 列状态中的 `width` 表示显式覆盖值；未设置时跟随 `columns.width` 更新。调整列宽后保留用户宽度，调用 `resetColumnState()` 恢复默认列状态。
- 子节点字段按 `rowDrag.childrenKey`、`expandable.childrenColumnName`、顶层 `childrenColumnName`、`children` 的顺序解析，表格展示与拖拽使用相同字段。
- `virtual` 模式默认使用 `div` 行和单元格；自定义 `components.body.row` 时需透传属性并通过 `forwardRef` 转发 DOM ref，以支持行高测量与拖拽。
- 函数形式的 `components.body` 完整接管表体，保持原样透传，同时禁用内置行拖拽；需要内置行拖拽时请使用对象形式的 `components.body`。
- 列设置支持函数形式的 `columns.title`，使用空标题上下文调用；需要当前排序/筛选状态的标题可通过闭包读取业务状态。
- `hoverHighlight={false}` 禁用行悬浮高亮，保留斑马纹和选中背景；原生 `rowHoverable={false}` 同样生效。
- 行拖拽支持鼠标和键盘：聚焦手柄后按空格或 Enter 开始，上下方向键选择目标，再按空格或 Enter 提交，Esc 取消。树形模式中，左右方向键按“之前、内部、之后”的顺序切换放置方式。不提供触摸拖拽或拖拽朗读提示。
- 整行拖拽（`rowDrag.handle=false`）可聚焦行本身进行键盘操作；保留 `onRow` 的指针、鼠标和键盘回调，业务回调调用 `preventDefault()` 可阻止本次拖拽启动。
- `rowDrag.autoExpandDelay` 默认 600ms，对树节点与详情行统一生效；设置为 `false` 时禁用自动展开并取消待执行的展开。松手提交前会重新校验最新的 `canDrag` 和 `canDrop`。
- 列宽调整与列拖拽跟随实际 LTR/RTL 布局方向；固定分组下的子列继承 `fixed`，遵循固定列不可拖动的约束。
- 切换行拖拽模式保留展开状态；移除受控 `expandedRowKeys` 后，从最后一次受控值继续本地管理。自动展开会合并当前展开键。
- 拖拽期间关闭行拖拽、切换模式或替换行数据会取消当前行拖拽。调整列宽期间关闭 `columnResize` 或将该列设为 `resizable: false` 会取消调整。
- `onCell`、`onHeaderCell` 返回的业务属性（包括 `column`）会保留并传给自定义单元格组件。
- 列设置中的未保存选择保留至保存或关闭；父组件重渲染不会覆盖草稿，重新打开时读取最新列状态。
- 拖拽兼容 `ConfigProvider.antdPrefixCls`、嵌套 Table 和虚拟表格横向滚动；内嵌表格的元素与拖拽事件不会参与外表排序。
