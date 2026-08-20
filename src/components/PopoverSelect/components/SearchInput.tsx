import { SearchOutlined } from '@ant-design/icons';
import { Input } from 'antd';
import clsx from 'clsx';
import React, { memo } from 'react';
import { useNamespace } from '../../../configProvider/usePrefixCls';

interface SearchInputProps {
  prefixCls: string;
  hashId?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

/** 搜索输入框 */
const SearchInput = memo<SearchInputProps>(
  ({ prefixCls, hashId, placeholder, value, onChange }) => {
    const { e } = useNamespace('popover-select', prefixCls);
    return (
      <div className={clsx(e('search'), hashId)}>
        <Input
          prefix={<SearchOutlined />}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          allowClear
        />
      </div>
    );
  },
);

export default SearchInput;
