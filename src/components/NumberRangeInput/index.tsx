/* eslint @typescript-eslint/no-unused-vars: ["error", { "ignoreRestSiblings": true }] */
import { ConfigProvider, Flex, InputNumber, Typography } from 'antd';
import clsx from 'clsx';
import React, { forwardRef, memo, useImperativeHandle, useRef } from 'react';
import { useLocale, usePrefixCls } from '../../configProvider';
import { useMergeState } from '../../hooks';
import type {
  NumberRangeInputProps,
  NumberRangeInputRef,
  NumberRangeValue,
} from './type';

export type * from './type';

const EMPTY: NumberRangeValue = [null, null];

const NumberRangeInput = forwardRef<NumberRangeInputRef, NumberRangeInputProps>(
  (props, ref) => {
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
      startInputProps,
      endInputProps,
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
    const startRef = useRef<React.ElementRef<typeof InputNumber>>(null);
    const endRef = useRef<React.ElementRef<typeof InputNumber>>(null);

    useImperativeHandle(
      ref,
      () => ({
        focus: (side = 'start') => {
          (side === 'start' ? startRef : endRef).current?.focus();
        },
        blur: () => {
          startRef.current?.blur();
          endRef.current?.blur();
        },
      }),
      [],
    );

    // 只修改正在编辑的一端，清空用 null 表示，不自动交换或修正外部传入值。
    const change = (index: 0 | 1, next: number | null) => {
      if (
        disabledValues[index] ||
        readOnlyValues[index] ||
        Object.is(next, range[index])
      )
        return;
      setRange(index === 0 ? [next, range[1]] : [range[0], next]);
    };

    // 两端互相约束；空端不参与限制，全局 min/max 始终生效。
    const startMax =
      range[1] === null ? max : Math.min(max ?? Infinity, range[1]);
    const endMin =
      range[0] === null ? min : Math.max(min ?? -Infinity, range[0]);

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
        // 两个输入框视为同一个字段，内部切换焦点不重复通知。
        onFocus={(event: React.FocusEvent<HTMLDivElement>) => {
          if (!event.currentTarget.contains(event.relatedTarget))
            onFocus?.(event);
        }}
        onBlur={(event: React.FocusEvent<HTMLDivElement>) => {
          if (!event.currentTarget.contains(event.relatedTarget))
            onBlur?.(event);
        }}
      >
        <InputNumber<number>
          {...shared}
          {...startInputProps}
          ref={startRef}
          id={id}
          disabled={disabledValues[0]}
          readOnly={readOnlyValues[0]}
          value={range[0]}
          max={startMax}
          placeholder={placeholder?.[0] ?? locale.min}
          onChange={(next) => change(0, next)}
        />
        <Typography.Text type="secondary">{separator}</Typography.Text>
        <InputNumber<number>
          {...shared}
          {...endInputProps}
          ref={endRef}
          id={id ? `${id}_end` : undefined}
          disabled={disabledValues[1]}
          readOnly={readOnlyValues[1]}
          value={range[1]}
          min={endMin}
          placeholder={placeholder?.[1] ?? locale.max}
          onChange={(next) => change(1, next)}
        />
      </Flex>
    );
  },
);
NumberRangeInput.displayName = 'NumberRangeInput';
export default memo(NumberRangeInput);
