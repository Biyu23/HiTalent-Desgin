---
category: Components
title: NumberRangeInput 数值区间
toc: content
---

# NumberRangeInput 数值区间

用于输入数值区间的最小值和最大值。

<code src="./demo/basic.tsx">基础用法</code>
<code src="./demo/advanced.tsx">清空、单端配置与焦点控制</code>

## 区间规则

- 值为 `[最小值, 最大值]`，任一端可以是 `null`；两端均为 `null` 表示清空。
- 输入时，两端通过 InputNumber 的上下限相互约束，并受全局 `min/max` 限制。键入过程可以暂时超出范围，失焦时由 InputNumber 按限制调整。
- 外部传入的倒置或越界区间不会自动交换、修正或触发 `onChange`。调用方负责校验外部值，组件不替业务决定修正策略。
- 省略 `value` 为非受控模式；显式传入 `value={undefined}` 为受控空值。
- `onFocus/onBlur` 表示进入、离开整个组件，左右输入框之间切换不会触发。

## 属性

| 属性                            | 说明                                                                                  | 默认值         |
| ------------------------------- | ------------------------------------------------------------------------------------- | -------------- |
| value                           | 受控区间，类型为 `[number \| null, number \| null]`                                   | —              |
| defaultValue                    | 非受控初始区间                                                                        | `[null, null]` |
| onChange                        | 任一端变化时返回完整区间                                                              | —              |
| min / max                       | 两端共用的数值下限、上限                                                              | —              |
| precision / step                | 小数位数、步长                                                                        | step 为 `1`    |
| formatter / parser              | 数字展示与解析，沿用 InputNumber 接口                                                 | —              |
| disabled / readOnly             | 整组设置，或用 `[boolean, boolean]` 分别设置两端                                      | —              |
| placeholder                     | 两端占位文案                                                                          | 语言配置       |
| separator                       | 分隔内容                                                                              | `—`            |
| size / status                   | 输入框尺寸和状态                                                                      | —              |
| startInputProps / endInputProps | 两端分别设置 `precision、step、formatter、parser、prefix、suffix`，优先于同名公共配置 | —              |
| onFocus / onBlur                | 进入、离开整个组件的焦点事件                                                          | —              |

两端独立配置不开放 `value、onChange、min、max`，避免绕过整组的状态和区间规则。两端使用不同格式时，数值仍须使用同一计量单位。

## Ref

类型为 `NumberRangeInputRef`：

- `focus()` 或 `focus('start')`：聚焦最小值。
- `focus('end')`：聚焦最大值。
- `blur()`：移出输入框焦点。
