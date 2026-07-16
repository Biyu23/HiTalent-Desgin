import { SearchOutlined } from '@ant-design/icons';
import { Input } from 'antd';
import React, { memo } from 'react';

interface SearchInputProps {
  prefixCls: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

/** 搜索输入框 */
const SearchInput = memo<SearchInputProps>(
  ({ prefixCls, placeholder, value, onChange }) => (
    <div className={`${prefixCls}-search`}>
      <Input
        prefix={<SearchOutlined />}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        allowClear
        variant="borderless"
      />
    </div>
  ),
);

export default SearchInput;
