---
title: useFieldNames
toc: content
---

# useFieldNames

将非标准后端字段映射为组件需要的 `label`、`value`、`children` 和 `disabled`，避免重复转换数据。

## 适用场景

- 不同接口使用 `deptName`、`dataId`、`isLock` 等业务字段。
- 组件应直接消费原始数据，而不是在每次请求后执行 `map`。
- 树形与扁平选项需要共享同一套字段读取方式。

## 基本用法

```tsx | pure
import { useFieldNames } from 'hi-talent-design';

const { fieldNames, getFieldValue } = useFieldNames({
  label: 'deptName',
  value: 'deptId',
  disabled: 'isLock',
});

const label = getFieldValue(record, 'label');
```

## 参数

```ts
interface FieldNames {
  label?: string;
  value?: string;
  children?: string;
  disabled?: string;
}
```

未传字段会分别回退到 `label`、`value`、`children` 和 `disabled`。

## 返回值

| 字段            | 说明                                      |
| --------------- | ----------------------------------------- |
| `fieldNames`    | 合并默认值后的完整 `Required<FieldNames>` |
| `getFieldValue` | 根据语义字段读取记录中的真实字段值        |

## 进阶示例：直接使用接口数据

```tsx | pure
const departments = [
  { deptName: '技术部', deptId: 101, isLock: false },
  { deptName: '产品部', deptId: 102, isLock: true },
];

<PopoverSelect
  options={departments}
  fieldNames={{
    label: 'deptName',
    value: 'deptId',
    disabled: 'isLock',
  }}
/>;
```

## 注意事项

- 映射只改变读取方式，不会复制或修改原始对象。
- 传入的字段名必须在记录中存在；不存在时读取结果为 `undefined`。
- `value` 对应字段仍应保持稳定且唯一。
