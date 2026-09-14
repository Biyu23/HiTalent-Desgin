---
category: Components
title: SearchForm 搜索表单
toc: content
---

# SearchForm 搜索表单

`SearchForm` 用于承载列表页、文件管理、候选人库等场景的多条件筛选能力。组件支持平铺模式、菜单抽屉模式以及联合协同模式，状态统一流转并内置已选条件区（Active Filters）。

## 何时使用

- 筛选字段较少（4~8 个），需要快速在页面顶部平铺检索并支持阈值折叠展开。
- 筛选字段分类明确且数量较多（十几个到几十个），需要侧边抽屉进行业务分组与快捷勾选。
- 需要将“常用平铺筛选”与“高级抽屉筛选”组合使用，共用同一套已选标签与查询逻辑。

## 代码演示

<code src="./demo/basic.tsx" title="平铺模式与阈值展开" description="平铺展示筛选表单项，超出默认展示数量时提供平滑的展开更多/收起操作。"></code>

<code src="./demo/menu.tsx" title="菜单模式与业务分组" description="使用侧边抽屉承载快捷布尔筛选、多级业务分组和底部固定操作栏。"></code>

<code src="./demo/combined.tsx" title="联合协同模式" description="顶部平铺高频常用筛选，末尾按钮唤起侧边高级抽屉，状态统一互通。"></code>

<code src="./demo/custom-tag.tsx" title="自定义已选条件标签" description="通过 formatTag 自定义已选条件在标签区的渲染文案与折叠逻辑。"></code>

## API

`className`、`style` 设置根容器。`classNames` 和 `styles` 均支持 `form`、`actions`、`activeFilters`、`menu`、`drawer`、`quickFilters`、`group`；`actions` 同时用于抽屉操作区。

### SearchForm

| 属性                | 说明                                                                       | 类型                                                                                          | 默认值       |
| ------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------ |
| mode                | 展示模式：`inline`（平铺） \| `menu`（抽屉菜单） \| `combined`（联合模式） | `'inline' \| 'menu' \| 'combined'`                                                            | `'inline'`   |
| fields              | 筛选项字段定义列表                                                         | `SearchFormFieldItem[]`                                                                       | `[]`         |
| groups              | 业务分组配置（menu 模式下有效）                                            | `SearchFieldGroup[]`                                                                          | -            |
| form                | 外部传入的 Ant Design Form 实例（支持外部受控操作）                        | `FormInstance`                                                                                | -            |
| initialValues       | 初始默认表单值                                                             | `Record<string, unknown>`                                                                     | -            |
| onSearch            | 触发搜索查询回调                                                           | `(values: Values, info: { source: 'submit' \| 'change' \| 'tag-remove' \| 'reset' }) => void` | -            |
| onReset             | 触发重置回调                                                               | `() => void`                                                                                  | -            |
| onValuesChange      | 字段值变动回调                                                             | `(changedValues: Partial<Values>, allValues: Values) => void`                                 | -            |
| searchMode          | 搜索触发方式：`submit`（点击搜索统一提交） \| `change`（表单项变动即触发） | `'submit' \| 'change'`                                                                        | `'submit'`   |
| defaultVisibleCount | 平铺展示模式下默认显示的字段数量阈值，超出部分支持展开/收起                | `number`                                                                                      | `4`          |
| defaultExpanded     | 是否默认展开全部平铺字段                                                   | `boolean`                                                                                     | `false`      |
| expanded            | 是否受控平铺展开状态                                                       | `boolean`                                                                                     | -            |
| onExpandedChange    | 平铺展开/收起状态变化回调                                                  | `(expanded: boolean) => void`                                                                 | -            |
| showActiveFilters   | 是否展示已选条件区（Active Filters Bar）                                   | `boolean`                                                                                     | `true`       |
| showSearchButton    | 是否展示搜索按钮                                                           | `boolean`                                                                                     | `true`       |
| showResetButton     | 是否展示重置按钮                                                           | `boolean`                                                                                     | `true`       |
| searchText          | 搜索按钮文案                                                               | `ReactNode`                                                                                   | `'搜索'`     |
| resetText           | 重置按钮文案                                                               | `ReactNode`                                                                                   | `'重置'`     |
| menuTitle           | 抽屉面板标题（menu / combined 模式）                                       | `ReactNode`                                                                                   | `'搜索条件'` |
| menuTrigger         | 唤起抽屉的按钮文案或节点                                                   | `ReactNode`                                                                                   | `'高级筛选'` |
| actionExtra         | 自定义操作区额外内容渲染                                                   | `ReactNode`                                                                                   | -            |
| disabled            | 是否禁用全部字段                                                           | `boolean`                                                                                     | `false`      |
| classNames          | 语义化类名定制                                                             | `SearchFormClassNames`                                                                        | -            |
| styles              | 语义化样式定制                                                             | `SearchFormStyles`                                                                            | -            |

### SearchFormFieldItem

| 属性          | 说明                                                 | 类型                                                     | 默认值  |
| ------------- | ---------------------------------------------------- | -------------------------------------------------------- | ------- |
| name          | 字段唯一标识，对应 Form 的 name                      | `string`                                                 | -       |
| label         | 字段标签文案                                         | `ReactNode`                                              | -       |
| children      | 字段表单控件渲染内容（元素或接收 form 的渲染函数）   | `ReactNode \| ((form: FormInstance) => ReactNode)`       | -       |
| formItemProps | 传递给内部 `Form.Item` 的属性                        | `FormItemProps`                                          | -       |
| initialValue  | 初始默认值                                           | `unknown`                                                | -       |
| span          | 栅格列数（24 栅格制）                                | `number`                                                 | -       |
| group         | 所属分组 key（menu 模式有效）                        | `string`                                                 | -       |
| quick         | 是否作为快捷布尔筛选（呈现在抽屉顶部 Quick Filters） | `boolean`                                                | `false` |
| pinned        | 是否在平铺收起状态下始终固定展示                     | `boolean`                                                | `false` |
| formatTag     | 自定义已选条件标签文案，返回 false/null 时不生成标签 | `(value, allValues, form) => ReactNode \| false \| null` | -       |
| onClear       | 自定义单个 Tag 清除时的回调逻辑                      | `(form: FormInstance) => void`                           | -       |
| hidden        | 是否隐藏字段                                         | `boolean \| ((values, form) => boolean)`                 | -       |

### SearchFieldGroup

| 属性            | 说明             | 类型        | 默认值 |
| --------------- | ---------------- | ----------- | ------ |
| key             | 分组唯一标识     | `string`    | -      |
| title           | 分组标题         | `ReactNode` | -      |
| defaultExpanded | 是否默认展开     | `boolean`   | `true` |
| extra           | 分组右侧扩展内容 | `ReactNode` | -      |

### SearchFormRef

| 方法        | 说明                          | 类型           |
| ----------- | ----------------------------- | -------------- |
| form        | 获取内部 Ant Design Form 实例 | `FormInstance` |
| submit      | 手动触发提交查询              | `() => void`   |
| resetFields | 重置所有字段并触发查询        | `() => void`   |
| openMenu    | 打开侧边抽屉面板              | `() => void`   |
| closeMenu   | 关闭侧边抽屉面板              | `() => void`   |
