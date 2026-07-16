import type { CheckboxChangeEvent } from 'antd';
import { Checkbox, Typography } from 'antd';
import clsx from 'clsx';
import React, { memo, useCallback } from 'react';
import type { RawValueType } from '../type';

interface ListItemProps<ValueType extends RawValueType = RawValueType> {
  item: Record<string, any>;
  isChecked: boolean;
  mode: 'single' | 'multiple';
  prefixCls: string;
  optionRender?: (item: any) => React.ReactNode;
  onToggle: (value: ValueType) => void;
}

/**
 * 单个列表项渲染
 *
 * 根据 mode 切换 Checkbox（多选）或 Radio 样式（单选）渲染。
 */
function ListItemInner<ValueType extends RawValueType = RawValueType>(
  props: ListItemProps<ValueType>,
) {
  const { item, isChecked, mode, prefixCls, optionRender, onToggle } = props;

  const handleCheckboxChange = useCallback(
    (e: CheckboxChangeEvent) => {
      onToggle(e.target.value as ValueType);
    },
    [onToggle],
  );

  const labelNode = optionRender ? (
    optionRender(item)
  ) : (
    <Typography.Text ellipsis={{ tooltip: item.label }}>
      {item.label}
    </Typography.Text>
  );

  if (mode === 'multiple') {
    return (
      <Checkbox
        key={item.value}
        value={item.value}
        checked={isChecked}
        disabled={item?.disabled}
        onChange={handleCheckboxChange}
        className={`${prefixCls}-menu-checkbox`}
      >
        {labelNode}
      </Checkbox>
    );
  }

  return (
    <div
      key={item.value}
      onClick={() => !item?.disabled && onToggle(item.value)}
      className={clsx({
        [`${prefixCls}-menu-radio`]: true,
        [`${prefixCls}-menu-radio-disabled`]: item?.disabled,
        [`${prefixCls}-menu-radio-active`]: isChecked,
      })}
    >
      {labelNode}
    </div>
  );
}

/** 使用 memo + 泛型断言，保持列表渲染性能 */
const ListItem = memo(ListItemInner) as typeof ListItemInner;
export default ListItem;
