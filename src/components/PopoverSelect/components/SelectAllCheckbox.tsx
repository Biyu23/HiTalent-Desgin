import type { CheckboxChangeEvent } from 'antd';
import { Checkbox } from 'antd';
import clsx from 'clsx';
import React, { memo } from 'react';
import { useNamespace } from '../../../configProvider/usePrefixCls';

interface SelectAllCheckboxProps {
  prefixCls: string;
  hashId?: string;
  checked: boolean;
  indeterminate: boolean;
  label: string;
  disabled?: boolean;
  onChange: (e: CheckboxChangeEvent) => void;
}

/** 全选复选框 */
const SelectAllCheckbox = memo<SelectAllCheckboxProps>(
  ({
    prefixCls,
    hashId,
    checked,
    indeterminate,
    label,
    disabled = false,
    onChange,
  }) => {
    const { e } = useNamespace('popover-select', prefixCls);
    return (
      <div className={clsx(e('select-all'), hashId)}>
        <Checkbox
          checked={checked}
          indeterminate={indeterminate}
          disabled={disabled}
          onChange={onChange}
        >
          {label}
        </Checkbox>
      </div>
    );
  },
);

export default SelectAllCheckbox;
