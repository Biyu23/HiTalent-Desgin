import { SearchOutlined } from '@ant-design/icons';
import { Input, Popover } from 'antd';
import React, { memo, useCallback, useState } from 'react';
import { useLocale } from '../../../configProvider/useLocale';
import { usePrefixCls } from '../../../configProvider/usePrefixCls';

interface SearchIconProps {
  /** 列 key */
  columnKey: string;
  /** 搜索占位文本 */
  placeholder?: string;
  /** 搜索回调 */
  onSearch: (columnKey: string, searchText: string) => void;
}

/**
 * SearchIcon — 表头搜索图标
 *
 * 点击图标弹出 Popover，内含 Input.Search 允许用户输入关键词。
 * 触发 onSearch(columnKey, text) 回调，外部自行处理过滤逻辑。
 */
const SearchIcon: React.FC<SearchIconProps> = ({
  columnKey,
  placeholder: placeholderProp,
  onSearch,
}) => {
  const prefixCls = usePrefixCls('table-search-icon');
  const locale = useLocale('Table');
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [isActive, setIsActive] = useState(false);

  const placeholder = placeholderProp || locale.searchPlaceholder;

  const handleSearch = useCallback(
    (val: string) => {
      onSearch(columnKey, val);
      setIsActive(!!val);
    },
    [columnKey, onSearch],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setValue(val);
      handleSearch(val);
    },
    [handleSearch],
  );

  const handleOpenChange = useCallback((newOpen: boolean) => {
    setOpen(newOpen);
  }, []);

  const searchContent = (
    <div style={{ width: 200 }}>
      <Input
        size="small"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        allowClear
        prefix={<SearchOutlined />}
      />
    </div>
  );

  return (
    <Popover
      trigger="click"
      placement="bottomRight"
      open={open}
      onOpenChange={handleOpenChange}
      content={searchContent}
      overlayClassName={`${prefixCls}-popover`}
      destroyTooltipOnHide
    >
      <SearchOutlined
        className={`${prefixCls}${isActive ? ` ${prefixCls}-active` : ''}`}
        aria-label={placeholder}
      />
    </Popover>
  );
};

export default memo(SearchIcon);
