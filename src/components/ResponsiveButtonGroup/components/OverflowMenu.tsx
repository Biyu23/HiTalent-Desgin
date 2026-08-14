import { LoadingOutlined } from '@ant-design/icons';
import type { DropdownProps, MenuProps } from 'antd';
import { Dropdown } from 'antd';
import React, { memo, useMemo } from 'react';
import type {
  ResponsiveButtonGroupItem,
  ResponsiveButtonGroupRenderInfo,
} from '../type';

interface OverflowMenuProps {
  prefixCls: string;
  items: readonly ResponsiveButtonGroupItem[];
  loadingKeys: ReadonlySet<React.Key>;
  children: React.ReactElement;
  dropdownProps?: Omit<DropdownProps, 'children' | 'menu'>;
  menuProps?: Omit<MenuProps, 'items' | 'onClick'>;
  open: boolean;
  onOpenChange: NonNullable<DropdownProps['onOpenChange']>;
  onItemClick: (
    item: ResponsiveButtonGroupItem,
    event: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>,
  ) => void | Promise<unknown>;
}

const OverflowMenu: React.FC<OverflowMenuProps> = (props) => {
  const {
    prefixCls,
    items,
    loadingKeys,
    children,
    dropdownProps,
    menuProps,
    open,
    onOpenChange,
    onItemClick,
  } = props;

  const menuItems = useMemo<MenuProps['items']>(() => {
    return items.map((item) => {
      const loading = item.loading || loadingKeys.has(item.key);
      const defaultNode = (
        <span className={`${prefixCls}-menu-item-content`}>
          {(loading || item.icon) && (
            <span className={`${prefixCls}-menu-item-icon`}>
              {loading ? <LoadingOutlined spin /> : item.icon}
            </span>
          )}
          <span className={`${prefixCls}-menu-item-label`}>{item.label}</span>
        </span>
      );
      const renderInfo: ResponsiveButtonGroupRenderInfo = {
        item,
        defaultNode,
        loading,
      };

      return {
        key: String(item.key),
        danger: item.danger,
        disabled: item.disabled || loading,
        label: item.renderCollapsedItem
          ? item.renderCollapsedItem(renderInfo)
          : defaultNode,
      };
    });
  }, [items, loadingKeys, prefixCls]);

  const handleMenuClick: MenuProps['onClick'] = (info) => {
    const item = items.find(
      (currentItem) => String(currentItem.key) === info.key,
    );
    if (!item) return;
    return onItemClick(item, info.domEvent);
  };

  return (
    <Dropdown
      trigger={['click']}
      {...dropdownProps}
      open={open}
      menu={{ ...menuProps, items: menuItems, onClick: handleMenuClick }}
      onOpenChange={onOpenChange}
    >
      {children}
    </Dropdown>
  );
};

export default memo(OverflowMenu);
