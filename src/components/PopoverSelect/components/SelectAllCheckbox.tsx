import type { CheckboxChangeEvent } from 'antd';
import { Checkbox } from 'antd';
import React, { memo } from 'react';

interface SelectAllCheckboxProps {
  prefixCls: string;
  checked: boolean;
  indeterminate: boolean;
  label: string;
  onChange: (e: CheckboxChangeEvent) => void;
}

/** 全选复选框 */
const SelectAllCheckbox = memo<SelectAllCheckboxProps>(
  ({ prefixCls, checked, indeterminate, label, onChange }) => (
    <div className={`${prefixCls}-select-all`}>
      <Checkbox
        checked={checked}
        indeterminate={indeterminate}
        onChange={onChange}
      >
        {label}
      </Checkbox>
    </div>
  ),
);

export default SelectAllCheckbox;
