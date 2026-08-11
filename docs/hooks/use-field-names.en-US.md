---
title: useFieldNames
toc: content
---

# useFieldNames

Maps backend-specific fields to the `label`, `value`, `children`, and `disabled` semantics components expect, without repeatedly transforming records.

## When to use

- APIs expose business fields such as `deptName`, `dataId`, or `isLock`.
- A component should consume original records instead of running `map` after every request.
- Tree and flat options need one shared field-reading strategy.

## Basic usage

```tsx | pure
import { useFieldNames } from 'hi-talent-design';

const { fieldNames, getFieldValue } = useFieldNames({
  label: 'deptName',
  value: 'deptId',
  disabled: 'isLock',
});

const label = getFieldValue(record, 'label');
```

## Parameter

```ts
interface FieldNames {
  label?: string;
  value?: string;
  children?: string;
  disabled?: string;
}
```

Omitted fields fall back to `label`, `value`, `children`, and `disabled` respectively.

## Return value

| Field           | Description                                                  |
| --------------- | ------------------------------------------------------------ |
| `fieldNames`    | Complete `Required<FieldNames>` after applying defaults      |
| `getFieldValue` | Reads the actual record key associated with a semantic field |

## Advanced example: consume API records directly

```tsx | pure
const departments = [
  { deptName: 'Engineering', deptId: 101, isLock: false },
  { deptName: 'Product', deptId: 102, isLock: true },
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

## Notes

- Mapping changes only how values are read; source records are not copied or mutated.
- A mapped key that does not exist on the record returns `undefined`.
- The field mapped to `value` should remain stable and unique.
