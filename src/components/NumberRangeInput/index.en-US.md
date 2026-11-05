---
category: Components
title: NumberRangeInput
toc: content
---

# NumberRangeInput

Enter the minimum and maximum values of a numeric range.

<code src="./demo/basic.tsx">Basic usage</code>
<code src="./demo/advanced.tsx">Clearing, per-end options and focus</code>

## Behavior

Values are `[start, end]`; either endpoint may be `null`. Omit `value` for uncontrolled usage; an explicit `value={undefined}` clears a controlled field.

Each input is constrained by the opposite endpoint and the shared `min/max`. InputNumber may temporarily display out-of-range text while typing and adjust it on blur. Invalid external values are not automatically reordered or corrected; validate them in the caller.

`onFocus/onBlur` fire when entering or leaving the entire group, not when moving between its inputs.

## Per-end options

`startInputProps` and `endInputProps` support `precision`, `step`, `formatter`, `parser`, `prefix` and `suffix`. These override shared formatting options without replacing the group value or range constraints. Both endpoints must use the same underlying unit.

`disabled` and `readOnly` accept a boolean or a pair of booleans. `placeholder` accepts a pair of strings.

## Ref

Use `NumberRangeInputRef` with `focus()` / `focus('start')`, `focus('end')`, or `blur()`.
