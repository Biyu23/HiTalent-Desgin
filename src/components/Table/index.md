---
category: Components
title: Table 增强表格
---

# Table 增强表格

在 Ant Design Table 的基础上，提供了列显隐设置、列宽拖拽调整、列/行拖拽排序、表头搜索、Cell 预设渲染、行内编辑、斑马纹、自定义操作栏等桌面级数据表格体验。

## 为什么需要这个组件

Ant Design 的 Table 功能强大但缺少一些企业级场景的高频能力：列太多时需要让用户自定义显示哪些列、列宽需要可拖拽调整并持久化、希望快速给单元格加状态标签/进度条/日期格式化等预设渲染、需要在表格内直接编辑单元格而不用弹窗。HiTalent Design Table 将这些能力内置为一个组件，零配置开箱即用，同时支持受控/非受控两种模式，方便接入后端持久化。

## 代码演示

### 基础用法

<code src="./demo/basic.tsx"></code>

### 综合高级

<code src="./demo/advanced.tsx"></code>

### Cell 预设渲染

<code src="./demo/cell-preset.tsx"></code>

### 列宽调整

<code src="./demo/column-resize.tsx"></code>

### 列拖拽排序

<code src="./demo/column-drag.tsx"></code>

### 行拖拽排序

<code src="./demo/row-drag.tsx"></code>

### 行内编辑

<code src="./demo/inline-edit.tsx"></code>

### 自定义操作栏

<code src="./demo/toolbar-extra.tsx"></code>

### 列配置持久化

<code src="./demo/column-persist.tsx"></code>

## API

### TableProps

<API src="./type.ts" identifier="TableProps" hideTitle></API>

### EnhancedColumnType

列定义扩展类型，在 antd `ColumnType` 基础上新增以下属性：

<API src="./type.ts" identifier="EnhancedColumnType" hideTitle></API>

### TableRef

<API src="./type.ts" identifier="TableRef" hideTitle></API>

### CellPresetType

<API src="./type.ts" identifier="CellPresetType" hideTitle></API>

## 列配置持久化

Table 内置了受控/非受控双模式的列配置管理（显隐/顺序/列宽），只需传入 `visibleKeys` / `onVisibleKeysChange` 等受控 props 即可与后端对接。

为了方便接入后端 API，我们提供了 **`useTableColumns`** hook，封装了完整的异步 fetch/save 生命周期：

```tsx
import { useTableColumns } from 'hi-talent-design';
// 或: import { useTableColumns } from 'hi-talent-design/components/Table/hooks/useTableColumns';

const MyPage = ({ currentModule }) => {
  const { tableProps, loading } = useTableColumns({
    // 从后端获取列配置
    request: () => getReportColumns(currentModule).then(parseResponse),
    // 保存列配置到后端（可选，不传则不持久化）
    updateRequest: (configs) =>
      editReportColumns({
        itemSortAll: JSON.stringify(configs),
        module: currentModule,
      }),
  });

  return (
    <HiTable
      columns={columns}
      dataSource={data}
      {...tableProps}
      columnSettingLoading={loading}
    />
  );
};
```

### ColumnConfigItem

`request` 和 `updateRequest` 使用的列配置数据项：

| 属性    | 类型      | 说明                      |
| ------- | --------- | ------------------------- |
| key     | `string`  | 列标识（对应 column.key） |
| visible | `boolean` | 是否可见                  |
| order   | `number`  | 排序序号                  |
| width   | `number`  | 列宽（px），可选          |

### useTableColumns 配置

<API identifier="UseTableColumnsOptions" hideTitle></API>

### useTableColumns 返回值

<API identifier="UseTableColumnsResult" hideTitle></API>

## 相关类型

### TagPresetProps

<API src="./type.ts" identifier="TagPresetProps" hideTitle></API>

### ProgressPresetProps

<API src="./type.ts" identifier="ProgressPresetProps" hideTitle></API>

### DatePresetProps

<API src="./type.ts" identifier="DatePresetProps" hideTitle></API>

### NumberPresetProps

<API src="./type.ts" identifier="NumberPresetProps" hideTitle></API>

### RowDragResult

<API src="./type.ts" identifier="RowDragResult" hideTitle></API>
