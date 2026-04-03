---
category: Components
title: PopoverSelect
subtitle: 弹出选择器
demo:
  cols: 2
---

# PopoverSelect 弹出选择器

一个基于 Popover 与虚拟滚动打造的高性能、高定制化下拉选择组件。
它完美解决了传统 Select 组件在海量数据下的卡顿问题，并原生支持了后端非标准字段映射、字符串格式提交等复杂企业级业务场景。

## 代码演示

<code src="./demo/basic.tsx">基础单选与搜索</code>
<code src="./demo/multiple.tsx">多选与操作栏控制</code>
<code src="./demo/string-value.tsx">字符串提交与全选</code>
<code src="./demo/virtual.tsx">字段映射与虚拟滚动</code>
<code src="./demo/custom.tsx">高度定制渲染</code>

---

## API

### 基础属性 (Base)

| 属性         | 说明                       | 类型                         | 默认值     |
| ------------ | -------------------------- | ---------------------------- | ---------- |
| mode         | 设置单选还是多选           | `single` \| `multiple`       | `'single'` |
| options      | 数据化配置选项内容         | `OptionType[]`               | `[]`       |
| value        | 指定当前选中的条目（受控） | `ValueType` \| `ValueType[]` | -          |
| defaultValue | 默认选中的条目（非受控）   | `ValueType` \| `ValueType[]` | -          |
| onChange     | 选中值改变时的回调         | `(value, option) => void`    | -          |
| placeholder  | 选择框默认文本             | `ReactNode`                  | `'请选择'` |
| allowClear   | 是否支持一键清除           | `boolean`                    | `false`    |
| disabled     | 是否禁用选择器             | `boolean`                    | `false`    |
| className    | 容器的自定义类名           | `string`                     | -          |
| style        | 容器的自定义样式           | `React.CSSProperties`        | -          |

### 交互与控制 (Interaction)

| 属性          | 说明                                              | 类型      | 默认值  |
| ------------- | ------------------------------------------------- | --------- | ------- |
| showSearch    | 是否在下拉面板顶部显示搜索框                      | `boolean` | `false` |
| showSelectAll | **(仅多选)** 是否显示全选按钮（智能匹配搜索结果） | `boolean` | `false` |
| showConfirm   | **(仅多选)** 是否显示底部确认按钮                 | `boolean` | `true`  |
| showCancelBtn | **(仅多选)** 是否显示底部取消按钮                 | `boolean` | `false` |
| showClearBtn  | **(仅多选)** 是否显示底部清空按钮                 | `boolean` | `false` |

### 数据转换 (Data & Mapping)

| 属性           | 说明                                                                        | 类型                    | 默认值                                    |
| -------------- | --------------------------------------------------------------------------- | ----------------------- | ----------------------------------------- |
| fieldNames     | 自定义 `options` 中 `label`、`value`、`disabled` 等字段的映射键名           | `object`                | `{ label: 'label', value: 'value', ... }` |
| valueType      | **(仅多选)** 提交给外部的值的类型。设为 `string` 时会自动把数组拼接成字符串 | `'string'` \| `'array'` | `'string'`                                |
| valueSeparator | **(仅多选)** 当 `valueType='string'` 时，数据提交拼接用的分隔符             | `string`                | `','`                                     |

### 展示与定制 (Display & Render)

| 属性           | 说明                                                  | 类型                                | 默认值 |
| -------------- | ----------------------------------------------------- | ----------------------------------- | ------ |
| maxTagCount    | **(仅多选)** 最多显示的标签文案数量，超出部分将被折叠 | `number`                            | -      |
| separator      | **(仅多选)** 触发器内多个选中项文案的连接字符         | `string`                            | `', '` |
| virtual        | 是否开启虚拟滚动                                      | `boolean`                           | `true` |
| listHeight     | 虚拟滚动时，下拉列表的最大高度                        | `number`                            | `150`  |
| listItemHeight | 虚拟滚动时，每一项的预估高度，用于精确计算滚动条      | `number`                            | `32`   |
| optionRender   | 自定义渲染下拉列表的每一项内容                        | `(option: OptionType) => ReactNode` | -      |
| dropdownRender | 完全自定义下拉框内容（接管底层 content）              | `(menu: ReactElement) => ReactNode` | -      |
