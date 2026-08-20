import { Checkbox } from 'antd';
import clsx from 'clsx';
import React, { memo, useCallback } from 'react';
import { useNamespace } from '../../../configProvider/usePrefixCls';
import type { RawValueType } from '../type';

interface ListItemProps<ValueType extends RawValueType = RawValueType> {
  item: Record<string, any>;
  isChecked: boolean;
  mode: 'single' | 'multiple';
  prefixCls: string;
  hashId?: string;
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
  const { item, isChecked, mode, prefixCls, hashId, optionRender, onToggle } =
    props;
  const { e, em } = useNamespace('popover-select', prefixCls);

  const handleCheckboxChange = useCallback(() => {
    onToggle(item.value as ValueType);
  }, [onToggle, item.value]);

  const handleRadioClick = useCallback(() => {
    if (!item?.disabled) {
      onToggle(item.value as ValueType);
    }
  }, [onToggle, item.value, item?.disabled]);

  const labelNode = optionRender ? (
    optionRender(item)
  ) : (
    <span
      className={clsx(e('menu-item-text'), hashId)}
      title={typeof item.label === 'string' ? item.label : undefined}
    >
      {item.label}
    </span>
  );

  if (mode === 'multiple') {
    return (
      <Checkbox
        value={item.value}
        checked={isChecked}
        disabled={item?.disabled}
        onChange={handleCheckboxChange}
        className={clsx(e('menu-checkbox'), hashId)}
      >
        {labelNode}
      </Checkbox>
    );
  }

  return (
    <div
      onClick={handleRadioClick}
      className={clsx(e('menu-radio'), hashId, {
        [em('menu-radio', 'disabled')]: item?.disabled,
        [em('menu-radio', 'active')]: isChecked,
      })}
    >
      {labelNode}
    </div>
  );
}

/** 使用 memo + 泛型断言，保持列表渲染性能 */
const ListItem = memo(ListItemInner) as typeof ListItemInner;
export default ListItem;
