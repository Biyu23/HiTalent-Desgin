---
title: useMergeState
toc: content
---

# useMergeState

统一管理受控/非受控状态，并在内部值与外部值格式不同时提供双向转换。

## 适用场景

- 组件同时支持 `value` 与 `defaultValue`。
- 内部使用数组或对象，外部接口使用另一种格式。
- 需要统一的 set、merge、clear 和 refresh 操作。

## 基本用法

```tsx | pure
import { useMergeState } from 'hi-talent-design';

const [value, { set, merge, clear, refresh }] = useMergeState<string[]>({
  defaultValue: [],
  onChange: (next) => console.log('值变更：', next),
});
```

## 参数

```ts
interface UseMergeStateProps<TOrigin, TResult> {
  value?: TResult;
  defaultValue?: TResult;
  onChange?: (value: TResult, ...args: any[]) => void;
  transformToOrigin?: (value: TResult | undefined) => TOrigin;
  transformToResult?: (value: TOrigin) => TResult;
}
```

传入 `value` 属性即进入受控模式；只传 `defaultValue` 时由 Hook 维护内部状态。组件生命周期内不要在两种模式间切换。

## 返回值

| 字段      | 说明                                            |
| --------- | ----------------------------------------------- |
| `value`   | 当前内部值，类型为 `TOrigin`                    |
| `set`     | 设置值，支持函数式更新                          |
| `merge`   | 当前值为普通对象时合并属性，否则使用 patch 覆盖 |
| `clear`   | 清空为传入值；未传值时写入 `undefined`          |
| `refresh` | 不改变当前值，再次触发 `onChange`               |

## 进阶示例：内部数组、外部字符串

```tsx | pure
const [value, { set }] = useMergeState<string[], string>({
  value: props.value,
  onChange: props.onChange,
  transformToOrigin: (source) => (source ? source.split(',') : []),
  transformToResult: (items) => items.join(','),
});
```

`PopoverSelect` 可以在内部始终操作数组，同时向旧接口读写 `"FE,PM,QA"`。

## 注意事项

- 受控模式下 `set` 只触发 `onChange`，新值需要由外部通过 `value` 回传。
- 转换函数应保持纯函数，避免在渲染同步期间产生副作用。
- 数组不会执行 `merge`，传入的 patch 会作为新值覆盖。
