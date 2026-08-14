# Table 固定底部行设计

## 背景

现有增强 `Table` 基于 Ant Design Table，已经支持列显隐、列宽调整、行列拖拽、固定列、分页和滚动。Ant Design 原生 `summary` 属性虽然会透传，但业务方需要自行维护 `Table.Summary.Cell` 的数量和索引，列隐藏或重排后容易错位。

本次参考 AG Grid 的 `pinnedBottomRowData`：汇总值及底部行内容全部由业务方计算，Table 只负责将这些记录按当前列结构渲染并固定在底部。

## 目标

- 新增 `pinnedBottomRowData`，接收一条或多条由用户准备的底部固定行数据。
- 固定行复用当前可见列的 `dataIndex` 和 `render`，不增加专用汇总计算 API。
- 固定行不参与分页、排序、筛选、选择、展开或行拖拽。
- 固定行与列显隐、列重排、列宽、分组列、固定列和横向滚动保持对齐。
- 保持 Ant Design 原生 `summary` 回调兼容。
- 提供中英文文档和可交互 Demo。

## 非目标

- 不在 Table 内计算求和、平均值或其他聚合结果。
- 不区分固定行中的“标签列”和“数值列”。
- 不提供 `summaryLabel`、列级 `summary` 或其他汇总专用配置。
- 不修改或拼接业务方传入的 `dataSource`。
- 不提供顶部固定行。
- 不增加固定／非固定切换开关。
- 不为本次功能引入新的测试框架。

## 公开 API

`TableOwnProps<RecordType>` 增加：

```ts
interface TableOwnProps<RecordType> {
  /**
   * 固定在表格底部的记录。数据及汇总结果由业务方计算，
   * 不参与分页、排序、筛选、选择、展开和行拖拽。
   */
  pinnedBottomRowData?: readonly RecordType[];
}
```

### 使用示例

```tsx
const columns = [
  {
    id: 'name',
    dataIndex: 'name',
    title: '用户名称',
  },
  {
    id: 'totalPerformance',
    dataIndex: 'totalPerformance',
    title: '总业绩',
    render: (value: number) => `$${value.toFixed(2)}`,
  },
  {
    id: 'joinedPerformance',
    dataIndex: 'joinedPerformance',
    title: '入职业绩',
    render: (value: number) => `$${value.toFixed(2)}`,
  },
];

const pinnedBottomRowData = [
  {
    id: 'summary',
    name: '汇总',
    totalPerformance: 12500,
    joinedPerformance: 6800,
  },
];

<Table
  columns={columns}
  dataSource={dataSource}
  pinnedBottomRowData={pinnedBottomRowData}
  pagination={{ pageSize: 10 }}
  scroll={{ x: 1200, y: 420 }}
/>;
```

用户可以在任意字段中放置“汇总”“合计”、业务名称、金额或其他内容。Table 不识别这些值的业务含义。

## 行为约定

### 显示条件

- `pinnedBottomRowData` 为 `undefined` 或空数组时，不生成底部固定行。
- 数组包含多条记录时，按数组顺序生成多条底部固定行。
- 固定行始终显示业务方传入的值；切换页码、筛选或排序不会重新计算或改变固定行数据。
- 业务方需要在外部数据变化时重新计算并传入新的 `pinnedBottomRowData`。

### 单元格取值与渲染

对每条固定记录和每个最终可见叶子列：

1. 按列的 `dataIndex` 读取值，支持字符串、数字及数组形式的嵌套路径。
2. 如果列定义了 `render`，调用 `render(value, pinnedRecord, pinnedRowIndex)`。
3. 如果没有 `render`，直接渲染读取到的值。
4. `pinnedRowIndex` 是该记录在 `pinnedBottomRowData` 中的索引，从 `0` 开始。
5. 如果 `render` 返回 Ant Design 的 `RenderedCell` 结构，则复用其 `children` 及合法单元格属性。
6. 没有 `dataIndex` 且没有 `render` 的列渲染为空。

固定行复用列的 `align`、`className` 和固定列信息。列的 `onCell` 不在固定行上执行，避免把正文行的点击、编辑、拖拽或业务事件绑定到底部固定行。

### 与原生 `summary` 的关系

- 业务方显式传入 Ant Design 原生 `summary` 时，原生 `summary` 优先。
- 原生 `summary` 存在时不渲染 `pinnedBottomRowData`，避免产生两套底部区域。
- 未传入原生 `summary` 时，Table 才根据 `pinnedBottomRowData` 生成固定行。
- 现有未使用 `pinnedBottomRowData` 的表格行为不变。

## 内部架构

### `components/Table/components/PinnedBottomRows.tsx`

职责：

- 接收固定行数据、最终处理后的列和系统列偏移信息。
- 展平分组列，按最终视觉顺序生成 `Table.Summary.Row` 与 `Table.Summary.Cell`。
- 读取列值并复用列的 `render`、`align` 和 `className`。
- 使用 `Table.Summary fixed` 将整组行固定在底部。
- 为每个 Summary Cell 提供正确的视觉索引，使 Ant Design 计算固定列位置。

该组件只负责渲染，不计算或修改底部行数据。

### `components/Table/utils/pinnedRows.ts`

提供纯辅助方法：

- 展平最终可见分组列。
- 按 `dataIndex` 读取嵌套字段。
- 识别并拆分 `render` 返回的普通 `ReactNode` 与 `RenderedCell`。
- 计算行选择列、展开列等 Ant Design 系统前置列所需的视觉索引偏移。

### `components/Table/index.tsx`

`InternalTable` 的职责变化：

1. 从 props 中单独解构 `pinnedBottomRowData` 和原生 `summary`。
2. 继续通过现有 `processColumns` 生成最终列结构。
3. 如果存在原生 `summary`，直接将其传给 Ant Design Table。
4. 否则，当 `pinnedBottomRowData` 非空时构造内部 `summary` 回调并渲染 `PinnedBottomRows`。
5. 固定行数据不传入 `dataSource`，因此不会进入正文数据处理流程。

## 列对齐规则

固定行单元格以最终视觉叶子列为准，而不是原始 `columns`：

- 分组列递归展平并保持视觉顺序。
- 隐藏列已在 `processColumns` 阶段移除，不生成对应固定单元格。
- 列拖拽后的顺序直接反映在固定行中。
- 行拖拽把手列由增强 Table 插入，固定行在该列渲染空单元格。
- `rowSelection` 和展开列由 Ant Design 内部插入；固定行在数据列前补齐相应空单元格，并调整后续 `index`。
- 固定列继续使用 Ant Design Summary Cell 的索引和内部上下文，不自行实现 `position: sticky`。

## 数据隔离

`pinnedBottomRowData` 不会被拼入 `dataSource`，因此固定行：

- 不占用分页条目或影响总数；
- 不参与前端排序和筛选；
- 不产生选择框；
- 不触发展开逻辑；
- 不参与行拖拽；
- 不被 `onChange` 的 `extra.currentDataSource` 返回；
- 不受正文斑马纹和悬停高亮逻辑影响。

“拼上去”仅表示视觉上附加在表格底部，不表示修改业务数据数组。

## 异常与边界处理

- 空 `pinnedBottomRowData` 不渲染固定区域。
- 固定记录字段缺失时，对应单元格为空。
- 列 `render` 抛出的异常不在组件内部捕获，遵循普通 React render 行为，由应用 Error Boundary 处理。
- `pinnedBottomRowData` 被视为只读数据，组件不修改记录或数组。
- 固定行不依赖 `rowKey`；使用数组索引作为内部 Summary Row key，因为它们不参与正文列表协调。
- 自定义 `components.header` 和 `components.body` 的现有合并逻辑不变；固定区域继续使用 Ant Design Summary 结构。

## 样式

在现有 `index.less` 中为固定底部行增加命名空间样式：

- 使用独立 class 与正文行区分；
- 使用项目现有 token 设置背景色和顶部边框；
- 不应用正文斑马纹和 hover 样式；
- 单元格继承列宽和对齐，不写死业务截图中的颜色或高度。

## Demo 与文档

新增 `src/components/Table/demo/pinned-bottom-rows.tsx`，展示：

- 业务方使用 `useMemo` 根据当前页或其他业务数据自行计算汇总记录；
- 第一列传入“汇总”，金额列传入已计算数值；
- 金额列复用普通列的 `render` 格式化为 `$0.00`；
- 传入两条固定记录，验证多行顺序；
- `scroll.x` 和 `scroll.y` 下固定底部及横向同步；
- 列隐藏、列拖拽和列宽调整后保持对齐。

同步更新：

- `src/components/Table/index.md`
- `src/components/Table/index.en-US.md`

文档补充 `pinnedBottomRowData` 类型、外部计算职责、列渲染复用规则、原生 `summary` 优先级以及固定行不参与正文数据处理的说明。

## 验证方案

仓库当前没有单元测试命令，本次不引入额外测试框架。完成实现后执行：

1. `npm run build`
2. `npm run lint`
3. `npm run docs:build`

通过 Demo 手动验证：

- 未传入、空数组、单行及多行固定数据；
- 直接字段、嵌套 `dataIndex` 和缺失字段；
- 默认渲染、列 `render` 及 `RenderedCell` 返回值；
- 分页、页大小变化、筛选和排序不改变固定行；
- 列隐藏、列重排、列宽调整和分组列；
- `rowSelection`、展开列及行拖拽把手；
- 左右固定列与横纵向滚动；
- 原生 `summary` 覆盖 `pinnedBottomRowData`；
- 自定义 `components` 保持原有行为。

## 完成标准

- `pinnedBottomRowData` 能渲染一条或多条固定底部行。
- 固定行内容完全由用户传入的数据和现有列 `render` 决定。
- Table 不执行任何汇总计算，也不修改 `dataSource`。
- 固定行不参与分页、排序、筛选、选择、展开或拖拽。
- 固定行在列显隐、重排、分组、系统列及横向滚动场景下保持对齐。
- 原生 Ant Design `summary` 仍可使用且优先级明确。
- 中英文文档与 Demo 完整。
- 构建、Lint 和文档构建通过。
