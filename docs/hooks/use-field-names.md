---
nav:
  title: Hooks
  order: 3
---

# useFieldNames

为组件提供**自定义字段名映射**能力，让组件能适配后端返回的任意数据结构，无需手动 `map` 转换。

## 为什么需要这个 Hook

后端接口返回的字段名五花八门——有的叫 `deptName`，有的叫 `dataId`，有的用 `isLock` 表示禁用。`useFieldNames` 允许使用者通过一个 `fieldNames` 配置告诉组件"去读哪个字段"，而不是要求所有数据都改成 `{ label, value, disabled }` 的标准格式。

## 基本用法

```tsx | pure
import { useFieldNames } from 'hi-talent-design';

const MySelect = ({ options, fieldNames: customFields }) => {
  const { fieldNames, getFieldValue } = useFieldNames(customFields);

  // fieldNames 是合并了默认值的完整映射对象
  // 默认值：{ label: 'label', value: 'value', children: 'children', disabled: 'disabled' }

  options.forEach((item) => {
    const label = getFieldValue(item, 'label'); // 等价于 item[fieldNames.label]
    const value = getFieldValue(item, 'value'); // 等价于 item[fieldNames.value]
    const disabled = getFieldValue(item, 'disabled');
  });
};
```

## 类型定义

```ts
interface FieldNames {
  label?: string; // 默认 'label'
  value?: string; // 默认 'value'
  children?: string; // 默认 'children'
  disabled?: string; // 默认 'disabled'
}
```

## 使用场景

```tsx | pure
// 后端返回了非标准数据
const backendData = [
  { deptName: '技术部', deptId: 101, isLock: false },
  { deptName: '产品部', deptId: 102, isLock: true },
];

// 只需配置一次 fieldNames，无需手动 map
<PopoverSelect
  options={backendData}
  fieldNames={{
    label: 'deptName',
    value: 'deptId',
    disabled: 'isLock',
  }}
/>;
```
