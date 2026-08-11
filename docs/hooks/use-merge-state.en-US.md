---
title: useMergeState
toc: content
---

# useMergeState

Unifies controlled and uncontrolled state, with bidirectional conversion when internal and external value formats differ.

## When to use

- A component supports both `value` and `defaultValue`.
- Internal arrays or objects map to a different API format.
- State updates need shared set, merge, clear, and refresh operations.

## Basic usage

```tsx | pure
import { useMergeState } from 'hi-talent-design';

const [value, { set, merge, clear, refresh }] = useMergeState<string[]>({
  defaultValue: [],
  onChange: (next) => console.log('Value changed:', next),
});
```

## Parameters

```ts
interface UseMergeStateProps<TOrigin, TResult> {
  value?: TResult;
  defaultValue?: TResult;
  onChange?: (value: TResult, ...args: any[]) => void;
  transformToOrigin?: (value: TResult | undefined) => TOrigin;
  transformToResult?: (value: TOrigin) => TResult;
}
```

Providing the `value` property enables controlled mode. With only `defaultValue`, the Hook owns internal state. Do not switch modes during a component lifecycle.

## Return value

| Field     | Description                                                 |
| --------- | ----------------------------------------------------------- |
| `value`   | Current internal value with type `TOrigin`                  |
| `set`     | Set a value directly or through a functional update         |
| `merge`   | Merge plain objects; otherwise replace with the patch       |
| `clear`   | Clear to a supplied value, or to `undefined` when omitted   |
| `refresh` | Trigger `onChange` again without changing the current value |

## Advanced example: internal array, external string

```tsx | pure
const [value, { set }] = useMergeState<string[], string>({
  value: props.value,
  onChange: props.onChange,
  transformToOrigin: (source) => (source ? source.split(',') : []),
  transformToResult: (items) => items.join(','),
});
```

PopoverSelect can work with arrays internally while reading and writing `"FE,PM,QA"` for a legacy API.

## Notes

- In controlled mode, `set` only calls `onChange`; the owner must pass the new `value` back.
- Keep transform functions pure and free of render-time side effects.
- Arrays are not merged; the supplied patch replaces the current value.
