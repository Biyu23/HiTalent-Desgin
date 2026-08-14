# Table 底部汇总行设计

## 背景

现有增强 `Table` 基于 Ant Design Table，已经支持列显隐、列宽调整、列拖拽、行拖拽、固定列、分页和滚动。Ant Design 原生 `summary` 属性会由当前组件透传，但业务方仍需自行计算汇总值和维护单元格索引；列隐藏或重排后也容易出现错位。

本次为增强 `Table` 增加列级自动汇总能力，使汇总行能够按当前页计算、固定在表格底部，并随列显隐、列重排和横向滚动保持对齐。

## 目标

- 通过列级配置声明需要汇总的字段。
- 内置有限数值求和。
- 支持业务自定义汇总单元格内容。
- 只统计当前分页展示的数据。
- 汇总行固定在表格底部，并与横向滚动、固定列保持同步。
- 汇总行跟随列显隐、列排序和分组列变化。
- 保持 Ant Design 原生 `summary` 回调兼容。
- 提供中英文文档和可交互 Demo。

## 非目标

- 不计算服务端未加载的数据。
- 不缓存或累计跨页数据。
- 不提供平均值、最大值、最小值等额外内置聚合器。
- 不隐式转换数字字符串。
- 不增加固定／非固定汇总行切换开关。
- 不为本次功能引入新的测试框架。

## 公开 API

### 列级 `summary`

仅叶子列支持 `summary`：

```ts
export interface SummaryContext<RecordType> {
  /** 当前页参与汇总的记录。 */
  data: readonly RecordType[];
  /** 从当前列 dataIndex 读取到的原始值。 */
  values: readonly unknown[];
  /** 忽略非有限数字后的求和结果。 */
  sum: number;
}

export type ColumnSummary<RecordType> =
  | 'sum'
  | ((context: SummaryContext<RecordType>) => React.ReactNode);
```

`EnhancedLeafColumnType<RecordType>` 增加：

```ts
summary?: ColumnSummary<RecordType>;
```

行为约定：

- `summary: 'sum'` 直接渲染内置求和结果。
- 函数形式接收 `data`、`values` 和 `sum`，可格式化内置结果，也可基于 `data` 自行计算并返回任意 `ReactNode`。
- 只有 `typeof value === 'number' && Number.isFinite(value)` 的值参与内置求和。
- `null`、`undefined`、`NaN`、正负 `Infinity`、数字字符串及其他类型均被忽略。
- 没有可参与计算的值时，`sum` 为 `0`。
- 字符串及数组形式的 `dataIndex` 均支持，包括嵌套路径。
- 没有 `dataIndex` 的列，其 `values` 为等长的 `undefined` 数组；自定义函数仍可使用完整 `data`。

### 自定义展示内容

组件不提供独立的汇总标签属性，也不假设哪一列用于显示“汇总”“合计”或业务名称。需要展示文字的列同样通过函数形式的 `summary` 返回内容：

```ts
{
  id: 'name',
  dataIndex: 'name',
  title: '用户名称',
  summary: () => '汇总',
}
```

因此，每个可见叶子列的汇总单元格完全由该列自己的 `summary` 决定；未配置 `summary` 的列保持为空。

### 启用条件与原生兼容

- 最终可见叶子列中至少有一列配置 `summary` 时，组件自动生成汇总行。
- 被隐藏列不生成汇总单元格，也不执行其 `summary`。
- 业务方显式传入 Ant Design 原生 `summary` 回调时，原生回调优先；组件不生成自动汇总行。
- 现有未使用列级 `summary` 的表格行为不变。

### 使用示例

```tsx
const columns = [
  {
    id: 'name',
    dataIndex: 'name',
    title: '用户名称',
    summary: () => '汇总',
  },
  {
    id: 'totalPerformance',
    dataIndex: 'totalPerformance',
    title: '总业绩',
    summary: ({ sum }) => `$${sum.toFixed(2)}`,
  },
  {
    id: 'joinedPerformance',
    dataIndex: 'joinedPerformance',
    title: '入职业绩',
    summary: 'sum',
  },
];

<Table
  columns={columns}
  dataSource={dataSource}
  pagination={{ pageSize: 10 }}
  scroll={{ x: 1200, y: 420 }}
/>;
```

## 内部架构

### `components/Table/components/TableSummary.tsx`

职责：

- 接收当前页数据、最终处理后的可见列和系统列偏移信息。
- 展平分组列，按视觉顺序生成 `Table.Summary.Cell`。
- 为未配置列、内置求和列和自定义汇总列生成对应内容。
- 使用 `Table.Summary fixed` 固定汇总行。
- 为每个 Summary Cell 提供正确的视觉索引，使 Ant Design 能计算固定列位置。

该组件只负责汇总行渲染，不维护分页、列状态或业务数据。

### `components/Table/utils/summary.ts`

提供无 React 状态的纯辅助方法：

- 展平最终可见分组列。
- 按字符串或数组 `dataIndex` 读取嵌套字段。
- 收集列值并对有限 `number` 求和。
- 计算行选择列、展开列和其他系统前置列所需的视觉索引偏移。

### `components/Table/index.tsx`

`InternalTable` 的职责变化：

1. 从 props 中单独解构原生 `summary`。
2. 继续通过现有 `processColumns` 生成最终列结构。
3. 如果存在原生 `summary`，直接将其传给 Ant Design Table。
4. 否则检查最终可见叶子列是否存在列级 `summary`。
5. 存在时构造自动 `summary` 回调，由 Ant Design 将当前页数据传给 `TableSummary`。
6. 不存在时不传入自动汇总回调。

## 数据流

1. `columns` 与 `ColumnState` 进入现有列处理流程。
2. `processColumns` 完成显隐、顺序和宽度处理。
3. 分页、排序和筛选继续由 Ant Design 处理。
4. Ant Design 调用 `summary(currentPageData)`，其中参数为当前渲染页的数据。
5. `TableSummary` 遍历最终可见叶子列：
   - 未配置 `summary` 的列渲染空单元格；
   - `'sum'` 列读取当前页值并渲染数值总和；
   - 函数列构建 `SummaryContext` 并调用自定义函数，可返回“汇总”等文字或任意业务内容。
6. Ant Design 负责固定汇总行、固定列布局及横向滚动同步。

切换分页、筛选、排序、列显隐或列顺序后，React 使用新的当前页数据和最终列结构重新生成汇总行。

## 列对齐规则

汇总单元格顺序以最终视觉叶子列为准，而不是原始 `columns`：

- 分组列递归展平，但保持视觉顺序。
- 隐藏列已在 `processColumns` 阶段移除。
- 行拖拽把手列由当前组件插入，按普通可见列输出一个空汇总单元格。
- `rowSelection` 和展开列由 Ant Design 内部插入；自动汇总在数据列前补齐对应空单元格，并调整后续 `index`。
- 固定列继续使用 Ant Design Summary Cell 的索引和内部上下文，不自行计算 `position: sticky`。

## 异常与边界处理

- 空页仍显示汇总行，内置总和为 `0`。
- 非数值字段不会产生 `NaN`。
- 自定义汇总函数抛出的异常不在组件内部捕获，遵循普通 React render 行为，由应用 Error Boundary 处理。
- 自定义函数应保持同步且无副作用；本次不支持异步汇总。
- 列级 `summary` 配置在列被隐藏时不会执行。
- 原生 `summary` 与自动汇总不叠加，避免出现两组汇总行。
- 自定义 `components.header` 和 `components.body` 的现有合并逻辑不变。

## 样式

优先使用 Ant Design Table Summary 的 DOM 和固定布局能力，仅在现有 `index.less` 中增加必要的命名空间样式：

- 汇总行背景色与正文区分。
- 汇总行顶部边框。
- 汇总单元格继承表格的对齐方式和列宽，不另设固定宽度。

颜色和间距使用项目现有 Less token，不写死业务截图颜色。

## Demo 与文档

新增 `src/components/Table/demo/summary.tsx`，展示：

- 多个金额列的当前页自动求和。
- 使用自定义函数格式化 `$0.00`。
- 前端分页切页后汇总变化。
- `scroll.x` 和 `scroll.y` 下固定底部及横向同步。
- 列隐藏、列拖拽和列宽调整后保持对齐。

同步更新：

- `src/components/Table/index.md`
- `src/components/Table/index.en-US.md`

文档补充：

- `summary` 叶子列属性。
- 使用自定义函数渲染“汇总”等业务文字。
- 当前页统计范围。
- 数值过滤规则。
- 自定义格式化方式。
- 原生 `summary` 优先级。

## 验证方案

仓库当前没有单元测试命令，本次不引入额外测试框架。完成实现后执行：

1. `npm run build`
2. `npm run lint`
3. `npm run docs:build`

通过 Demo 手动验证：

- 普通数值求和。
- 空数据与空分页。
- `null`、`undefined`、`NaN`、正负 `Infinity` 和数字字符串。
- 自定义汇总文字和金额格式化。
- 当前页切换、页大小变化、筛选和排序。
- 列隐藏、列重排、列宽调整和分组列。
- `rowSelection`、展开列及行拖拽把手。
- 左右固定列与横纵向滚动。
- 原生 `summary` 覆盖自动汇总。
- 自定义 `components` 保持原有行为。

## 完成标准

- 配置至少一个列级 `summary` 后出现固定汇总行。
- 内置求和严格遵循有限 `number` 规则。
- 前端分页时只统计当前页。
- 自定义文字、数值格式化生效。
- 汇总单元格在列显隐、重排、分组、系统列及横向滚动场景下保持对齐。
- 原生 Ant Design `summary` 仍可使用且优先级明确。
- 中英文文档与 Demo 完整。
- 构建、Lint 和文档构建通过。
