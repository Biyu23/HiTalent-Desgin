---
category: Components
title: Table 增强表格
toc: content
---

# Table 增强表格

在 Ant Design Table 上增加可持久化列状态、列宽调整、行列拖拽、树形移动、预设单元格与工具栏。

## 何时使用

- 用户需要保存列顺序、显隐和调整后的宽度。
- 表格行或列需要通过拖拽重新排序。
- 树形数据需要移动到同级前后或其他节点内部。
- 希望复用日期、数字、标签等常见单元格展示。

排序、筛选、分页、选择和展开继续使用 Ant Design Table 的原生 API。

## 核心能力

- 静态列 schema 与动态 `ColumnState` 分离，状态可直接持久化。
- 同时支持受控 `columnState` 和非受控 `defaultColumnState`。
- 列显隐、宽度、拖拽、重置通过 `info.reason` 返回明确变更原因。
- 扁平行拖拽支持 `before` / `after`；树形模式增加 `inside` 与完整路径。
- `allowDrop` 承载同步业务规则，组件自动阻止拖到自身或后代。

## 代码演示

<code src="./demo/column-drag.tsx" title="列配置、缩放与拖拽" description="受控管理列状态，统一演示显隐、调整宽度、拖拽排序、重置和持久化回调。"></code>

<code src="./demo/row-drag-flat.tsx" title="扁平行拖拽" description="将行放到目标记录之前或之后，并通过 onRowDragEnd 获取最终位置。"></code>

<code src="./demo/row-drag-tree.tsx" title="树形行拖拽" description="在 before、after、inside 三种位置间移动节点，并获取 dragPath 与 targetPath。"></code>

<code src="./demo/sort.tsx" title="表头排序" description="复用 Ant Design sorter 和 onChange，演示前端排序与远程排序状态。"></code>

<code src="./demo/semantic-styles.tsx" title="语义化样式" description="定制表格外层、工具栏、设置面板、拖拽把手与拖拽浮层。"></code>

## API

### TableProps

除下列增强属性外，同时支持 Ant Design `TableProps`（`columns` 使用增强列定义，并额外支持 `NativeProps`）。

| 属性                   | 说明                                   | 类型                                          | 默认值  |
| ---------------------- | -------------------------------------- | --------------------------------------------- | ------- |
| `columns`              | 增强列定义，叶子列建议提供稳定 `id`    | `EnhancedColumnType<RecordType>[]`            | 必填    |
| `showColumnSetting`    | 是否显示列设置入口                     | `boolean`                                     | `true`  |
| `columnSettingTitle`   | 列设置面板标题                         | `ReactNode`                                   | -       |
| `columnSettingLoading` | 列设置加载状态                         | `boolean`                                     | -       |
| `enableColumnResize`   | 是否允许调整列宽                       | `boolean`                                     | `true`  |
| `enableColumnDrag`     | 是否允许拖拽列排序                     | `boolean`                                     | `false` |
| `enableRowDrag`        | 是否启用行拖拽及其规则                 | `boolean \| RowDragConfig<RecordType>`        | `false` |
| `onRowDragEnd`         | 行拖拽提交回调                         | `(result: RowDragResult<RecordType>) => void` | -       |
| `zebraStripe`          | 是否显示斑马纹                         | `boolean`                                     | `true`  |
| `hoverHighlight`       | 是否高亮悬停行                         | `boolean`                                     | `true`  |
| `toolbarRender`        | 自定义工具栏整体渲染                   | `(defaultToolbar: ReactNode) => ReactNode`    | -       |
| `toolbarExtra`         | 工具栏附加内容                         | `ReactNode`                                   | -       |
| `columnState`          | 受控列状态；提供时必须同时提供变更回调 | `ColumnState`                                 | -       |
| `defaultColumnState`   | 非受控初始列状态                       | `ColumnState`                                 | -       |
| `onColumnStateChange`  | 列状态变化回调及变化原因               | `(next: ColumnState, info) => void`           | -       |

### ColumnState

`ColumnState` 是只读的 `ColumnStateItem[]`，可直接序列化持久化。

| 字段     | 说明          | 类型      | 默认值 |
| -------- | ------------- | --------- | ------ |
| `id`     | 稳定列标识    | `string`  | 必填   |
| `hidden` | 是否隐藏该列  | `boolean` | -      |
| `width`  | 列宽，单位 px | `number`  | -      |

### RowDragConfig

| 属性                 | 说明                         | 类型                                         | 默认值  |
| -------------------- | ---------------------------- | -------------------------------------------- | ------- |
| `treeMode`           | 是否按树形数据计算拖放位置   | `boolean`                                    | `false` |
| `childrenColumnName` | 子节点字段名                 | `string`                                     | -       |
| `draggable`          | 全局或按记录判断是否可拖动   | `boolean \| (record) => boolean`             | -       |
| `allowDrop`          | 同步判断当前放置位置是否允许 | `(info: RowDropInfo<RecordType>) => boolean` | -       |
| `handleColumn`       | 是否显示及如何配置拖拽把手列 | `false \| HandleColumnConfig`                | -       |

### TableRef

| 方法/属性          | 说明                      | 类型               |
| ------------------ | ------------------------- | ------------------ |
| `resetColumnState` | 重置列顺序、显隐和宽度    | `() => void`       |
| `nativeElement`    | Ant Design Table 根元素   | `HTMLDivElement`   |
| `scrollTo`         | Ant Design Table 滚动方法 | `(config) => void` |

## 注意事项

- 启用列增强能力时，每个叶子列都应提供稳定且唯一的 `id`。
- `hideable: false` 的列始终可见。
- `onColumnStateChange` 返回纯状态数据，不包含 `render`、ReactNode 等静态列定义。
- `allowDrop` 会在悬停期间多次执行，应保持同步、快速且无副作用。
- 大量行仍应结合分页或虚拟化策略，拖拽能力本身不负责数据窗口化。

## 迁移说明

| 旧接口                               | 新方式                                                    |
| ------------------------------------ | --------------------------------------------------------- |
| `onColumnsChange`                    | `onColumnStateChange`                                     |
| 列定义中的 `hidden` / `defaultWidth` | `columnState` / `defaultColumnState`                      |
| `TableRef.resetAll`                  | `TableRef.resetColumnState`                               |
| `useTableColumns`                    | 请求后构造并持久化 `ColumnState`                          |
| `searchable` / `onColumnSearch`      | Ant Design `filters` / `filterDropdown`                   |
| 行内编辑扩展                         | Ant Design `render` / `onCell` + Form + 受控 `dataSource` |

`TableRef` 同时保留 Ant Design 的 `nativeElement` 和 `scrollTo`。

## 根节点与语义化样式

Table 的 `root` 是同时包含工具栏和 Ant Design Table 的外层边界。`className`、`style` 作用于 Ant Design Table，`rootClassName` 作用于外层边界。

`classNames` 与 `styles` 支持 `root`、`toolbar`、`toolbarExtra`、`settingTrigger`、`settingPopup`、`table`、`headerCell`、`resizeHandle`、`rowDragHandle`、`dragOverlay` 插槽。设置弹层和拖拽浮层位于 Portal 中，但仍自动携带当前前缀与 CSS-in-JS hash。
