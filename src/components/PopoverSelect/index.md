---
category: Components
title: PopoverSelect 气泡选择
toc: content
---

# PopoverSelect 气泡选择

以 Popover 承载选择面板，提供虚拟滚动、全选、字段映射、自定义渲染与灵活值格式。

## 何时使用

- 选项数量大，需要虚拟滚动保持打开、搜索和滚动流畅。
- 后端字段并非固定的 `label` / `value` 结构。
- 多选需要确认、取消、清空或针对当前搜索结果全选。
- 旧接口使用逗号分隔字符串，而组件内部仍希望以数组操作。

简单、少量且无需定制的选项可以直接使用 Ant Design Select。

## 核心能力

- 基于 `rc-virtual-list` 处理万级选项。
- `fieldNames` 直接适配后端数据，无需先执行 `map`。
- `valueType` 在数组和分隔字符串之间转换。
- 单选、多选、全选和确认机制共享一致状态模型。
- `optionRender` 与 `dropdownRender` 扩展选项和面板内容。

## 代码演示

<code src="./demo/multiple.tsx" title="多选确认与标签截断" description="multiple 模式支持确认/取消/清空草稿操作，并可通过 maxTagCount 实现超出自动 +N 截断展示。"></code>

<code src="./demo/string-value.tsx" title="字符串提交与智能全选" description="valueType='string' 自动在逗号拼接字符串与数组间双向转换，全选联动当前搜索过滤结果。"></code>

## API

除下表属性外，组件同时支持 `className`、`style` 和 CSS 变量等 `NativeProps`。

| 属性                   | 说明                       | 类型                                   | 默认值         |
| ---------------------- | -------------------------- | -------------------------------------- | -------------- |
| `options`              | 数据选项                   | `OptionType[]`                         | `[]`           |
| `placeholder`          | 选择框提示内容             | `ReactNode`                            | -              |
| `showSearch`           | 是否显示搜索框             | `boolean`                              | `false`        |
| `allowClear`           | 是否允许清除               | `boolean`                              | `false`        |
| `mode`                 | 单选或多选                 | `single \| multiple`                   | `single`       |
| `value`                | 受控选中值                 | `ValueType \| ValueType[]`             | -              |
| `defaultValue`         | 非受控初始值               | `ValueType \| ValueType[]`             | -              |
| `onChange`             | 值和选项变化回调           | `(value, options?) => void`            | -              |
| `fieldNames`           | 后端字段映射               | `FieldNames`                           | -              |
| `dropdownRender`       | 自定义完整面板             | `(menu: ReactElement) => ReactElement` | -              |
| `showConfirm`          | 多选时是否显示确认按钮     | `boolean`                              | `true`         |
| `showCancelBtn`        | 是否显示取消按钮           | `boolean`                              | `false`        |
| `showClearBtn`         | 是否显示清空按钮           | `boolean`                              | `false`        |
| `optionRender`         | 自定义选项内容             | `(item: OptionType) => ReactNode`      | -              |
| `separator`            | 多选值的展示分隔符         | `string`                               | `, `           |
| `maxTagCount`          | 多选时最多展示的标签数量   | `number`                               | -              |
| `virtual`              | 是否启用虚拟滚动           | `boolean`                              | `true`         |
| `listHeight`           | 列表最大高度，单位 px      | `number`                               | `150`          |
| `listItemHeight`       | 虚拟列表单项高度，单位 px  | `number`                               | `34`           |
| `valueType`            | 提交数组或分隔字符串       | `string \| array`                      | `string`       |
| `valueSeparator`       | 字符串提交格式的分隔符     | `string`                               | `,`            |
| `showSelectAll`        | 多选时是否显示全选         | `boolean`                              | `false`        |
| `showArrow`            | 是否显示下拉箭头           | `boolean`                              | `true`         |
| `disabled`             | 是否禁用组件               | `boolean`                              | `false`        |
| `ellipsis`             | 是否支持文本截断与 Tooltip | `boolean \| { tooltip?: string }`      | `true`         |
| `open`                 | 下拉弹窗展开状态（受控）   | `boolean`                              | -              |
| `onOpenChange`         | 下拉弹窗状态变化回调       | `(open: boolean) => void`              | -              |
| `afterOpenChange`      | 弹窗动画完成回调           | `(open: boolean) => void`              | -              |
| `placement`            | 气泡框展开位置             | `TooltipPlacement`                     | `'bottomLeft'` |
| `getPopupContainer`    | 浮层渲染挂载父节点         | `(triggerNode) => HTMLElement`         | -              |
| `autoAdjustOverflow`   | 是否自动调整遮挡位置       | `boolean`                              | `true`         |
| `destroyTooltipOnHide` | 关闭时是否销毁浮层         | `boolean`                              | `false`        |

## 注意事项

- 大数据量下应为 `value` 字段提供稳定且唯一的值。
- `fieldNames` 只负责读取字段，不会修改原始数据。
- 字符串模式的分隔符必须与后端约定一致，选项值本身不应包含同一分隔符。
- 自定义渲染应保持选项高度稳定，以免影响虚拟列表测量。
