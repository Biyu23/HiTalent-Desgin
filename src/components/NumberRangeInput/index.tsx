/* eslint @typescript-eslint/no-unused-vars: ["error", { "ignoreRestSiblings": true }] */
import { ConfigProvider, Flex, InputNumber, Typography } from 'antd';
import clsx from 'clsx';
import React, { memo } from 'react';
import { useLocale, usePrefixCls } from '../../configProvider';
import { useMergeState } from '../../hooks';
import type { NumberRangeInputProps, NumberRangeValue } from './type';

export type * from './type';

const EMPTY: NumberRangeValue = [null, null];

const NumberRangeInput = (props: NumberRangeInputProps) => {
  const {
    value,
    defaultValue,
    onChange,
    placeholder,
    separator = '—',
    disabled: customDisabled,
    readOnly,
    size,
    status,
    min,
    max,
    precision,
    step = 1,
    formatter,
    parser,
    prefixCls: customPrefixCls,
    className,
    style,
    id,
    onFocus,
    onBlur,
    ...rest
  } = props;
  const locale = useLocale('NumberRangeInput');
  const prefixCls = usePrefixCls('number-range-input', customPrefixCls);
  const { componentDisabled } = ConfigProvider.useConfig();
  const disabled = customDisabled ?? componentDisabled;
  const disabledValues = Array.isArray(disabled)
    ? disabled
    : [disabled, disabled];
  const readOnlyValues = Array.isArray(readOnly)
    ? readOnly
    : [readOnly, readOnly];
  const [range, setRange] = useMergeState<NumberRangeValue>(props, {
    defaultValue: EMPTY,
    transformToOrigin: (next) => next ?? EMPTY,
  });
  const change = (index: 0 | 1, next: number | null) => {
    if (
      disabledValues[index] ||
      readOnlyValues[index] ||
      Object.is(next, range[index])
    )
      return;
    setRange(index === 0 ? [next, range[1]] : [range[0], next]);
  };

  const shared = {
    min,
    max,
    precision,
    step,
    formatter,
    parser,
    size,
    status,
    controls: false as const,
    style: { flex: 1, minWidth: 0 },
  };

  return (
    <Flex
      align="center"
      gap="small"
      {...rest}
      className={clsx(prefixCls, className)}
      style={style}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      <InputNumber<number>
        {...shared}
        id={id}
        disabled={disabledValues[0]}
        readOnly={readOnlyValues[0]}
        value={range[0]}
        max={range[1] === null ? max : Math.min(max ?? Infinity, range[1])}
        placeholder={placeholder?.[0] ?? locale.min}
        onChange={(next) => change(0, next)}
      />
      <Typography.Text type="secondary">{separator}</Typography.Text>
      <InputNumber<number>
        {...shared}
        id={id ? `${id}_end` : undefined}
        disabled={disabledValues[1]}
        readOnly={readOnlyValues[1]}
        value={range[1]}
        min={range[0] === null ? min : Math.max(min ?? -Infinity, range[0])}
        placeholder={placeholder?.[1] ?? locale.max}
        onChange={(next) => change(1, next)}
      />
    </Flex>
  );
};
NumberRangeInput.displayName = 'NumberRangeInput';
export default memo(NumberRangeInput);
