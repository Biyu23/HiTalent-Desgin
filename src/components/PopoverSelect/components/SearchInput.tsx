import { SearchOutlined } from '@ant-design/icons';
import { Input } from 'antd';
import React, { memo } from 'react';
import { useNamespace } from '../../../configProvider/usePrefixCls';

interface SearchInputProps {
  prefixCls: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

/** 搜索输入框 */
const SearchInput = memo<SearchInputProps>(
  ({ prefixCls, placeholder, value, onChange }) => {
    const { e } = useNamespace('popover-select', prefixCls);
    return (
      <div className={e('search')}>
        <Input
          prefix={<SearchOutlined />}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          allowClear
          variant="borderless"
        />
      </div>
    );
  },
);

export default SearchInput;
