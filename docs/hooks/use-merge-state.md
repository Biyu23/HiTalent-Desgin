---
nav:
  title: Hooks
  order: 1
---

# useMergeState

为组件提供**受控/非受控双模式**的状态管理能力，是 MyUI 内部所有表单组件的基础 Hook。

## 为什么需要这个 Hook

React 组件中，"受控"（外部传 `value`）和"非受控"（内部维护 `defaultValue`）的状态切换逻辑是高频重复工作。`useMergeState` 封装了这个模式，并提供类型安全的双向数据转换能力——内部用 `TOrigin` 格式维护，对外暴露 `TResult` 格式，完美适配像 PopoverSelect 这样"内部数组、外部字符串"的场景。

## 基本用法

```tsx | pure
import { useMergeState } from 'myui';

const [value, { set, merge, clear }] = useMergeState<string[]>({
  defaultValue: [],
  onChange: (val) => console.log('值变了:', val),
});
```

## 类型定义

```ts
interface UseMergeStateProps<TOrigin, TResult> {
  /** 外部传入的值（受控模式） */
  value?: TResult;
  /** 默认初始值（非受控模式） */
  defaultValue?: TResult;
  /** 值变更回调（TResult 格式） */
  onChange?: (value: TResult, ...args: any[]) => void;
  /** 将外部的 TResult 转换为内部的 TOrigin */
  transformToOrigin?: (value: TResult) => TOrigin;
  /** 将内部的 TOrigin 转换为外部的 TResult */
  transformToResult?: (value: TOrigin) => TResult;
}
```

## 受控 / 非受控模式

- **受控模式**：传入 `value` 时，状态完全由外部驱动，内部不做状态更新，仅通过 `onChange` 通知外部
- **非受控模式**：仅传入 `defaultValue`，内部自行维护状态并触发 `onChange`
- **判断依据**：`'value' in props` 为 `true` 即为受控模式

## 转换函数（Transform）

当内部数据格式与外部不一致时，用 `transformToOrigin` / `transformToResult` 做双向映射。

**典型场景：PopoverSelect 的多选字符串模式**

```tsx | pure
// 外部传入/传出的是字符串 "FE,PM,QA"，内部维护的是数组 ["FE","PM","QA"]
const [value, { set }] = useMergeState<string[], string>({
  value: props.value, // 外部传入 string
  onChange: props.onChange, // 回调传出 string
  transformToOrigin: (s) => (s ? s.split(',') : []), // string → string[]
  transformToResult: (arr) => arr.join(','), // string[] → string
});
```

## 操作方法

| 方法    | 签名                                                              | 说明                                               |
| ------- | ----------------------------------------------------------------- | -------------------------------------------------- |
| `set`   | `(val: TOrigin \| ((prev: TOrigin) => TOrigin), ...args) => void` | 直接设置新值（支持函数式更新）                     |
| `merge` | `(patch: Partial<TOrigin>, ...args) => void`                      | 合并对象属性（仅当前值为普通对象时生效，否则覆盖） |
| `clear` | `(emptyValue?: TOrigin, ...args) => void`                         | 一键清空，可传入自定义空值（如 `[]`、`''`）        |

**示例：**

```tsx | pure
const [data, actions] = useMergeState<UserProfile>({ defaultValue: {} });

// 直接设置
actions.set({ name: 'Alice', age: 30 });

// 合并更新（对象模式下）
actions.merge({ age: 31 }); // 保留 name，只更新 age

// 清空
actions.clear({}); // 重置为空对象
```
