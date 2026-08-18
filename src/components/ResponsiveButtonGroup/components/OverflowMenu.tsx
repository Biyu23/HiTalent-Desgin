import { LoadingOutlined } from '@ant-design/icons';
import type { DropdownProps, MenuProps } from 'antd';
import { Dropdown, Tooltip } from 'antd';
import React, { memo, useMemo } from 'react';
import { useNamespace } from '../../../configProvider/usePrefixCls';
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
  const { e } = useNamespace('responsive-button-group', prefixCls);

  const itemMap = useMemo(() => {
    const map = new Map<string, ResponsiveButtonGroupItem>();
    items.forEach((item) => {
      map.set(String(item.key), item);
    });
    return map;
  }, [items]);

  const menuItems = useMemo<MenuProps['items']>(() => {
    return items.map((item) => {
      const loading = Boolean(item.loading || loadingKeys.has(item.key));
      const defaultNode = (
        <span className={e('menu-item-content')}>
          {(loading || item.icon) && (
            <span className={e('menu-item-icon')}>
              {loading ? <LoadingOutlined spin /> : item.icon}
            </span>
          )}
          <span className={e('menu-item-label')}>{item.label}</span>
        </span>
      );
      const renderInfo: ResponsiveButtonGroupRenderInfo = {
        item,
        defaultNode,
        loading,
      };

      let node: React.ReactNode = defaultNode;
      if (item.renderCollapsedItem) {
        node = item.renderCollapsedItem(renderInfo);
      } else if (item.tooltip) {
        const tooltipProps =
          typeof item.tooltip === 'string' || React.isValidElement(item.tooltip)
            ? { title: item.tooltip }
            : item.tooltip;
        node = (
          <Tooltip {...tooltipProps} placement="right">
            {defaultNode}
          </Tooltip>
        );
      }

      return {
        key: String(item.key),
        danger: item.danger,
        disabled: Boolean(item.disabled || loading),
        label: node,
      };
    });
  }, [items, loadingKeys, e]);

  const handleMenuClick: MenuProps['onClick'] = (info) => {
    const item = itemMap.get(info.key);
    if (!item || item.disabled || item.loading || loadingKeys.has(item.key)) {
      return;
    }
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
