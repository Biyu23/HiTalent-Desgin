import {
  DownOutlined,
  EllipsisOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Dropdown, Tooltip } from 'antd';
import React, { forwardRef, memo, useCallback, useMemo } from 'react';
import { useLocale, usePrefixCls } from '../../configProvider';
import { setRef, withNativeProps } from '../../utils';
import Button from '../Button';
import { parseTooltipConfig } from '../Button/utils/tooltip';
import { useButtonGroupActions } from './hooks/useButtonGroupActions';
import { useResponsiveLayout } from './hooks/useResponsiveLayout';
import { useStyles } from './style';
import type {
  ResponsiveButtonGroupItem,
  ResponsiveButtonGroupProps,
  ResponsiveButtonGroupRef,
} from './type';
import { getMeasurementButtonProps } from './utils/buttonProps';

const InternalResponsiveButtonGroup: React.ForwardRefRenderFunction<
  ResponsiveButtonGroupRef,
  ResponsiveButtonGroupProps
> = (props, ref) => {
  const {
    prefixCls: customPrefixCls,
    items,
    overflowLabel,
    overflowIcon = <EllipsisOutlined />,
    showOverflowCount = true,
    overflowButtonProps,
    overflowDropdownProps,
    overflowMenuProps,
    renderOverflowButton,
    classNames,
    styles,
  } = props;

  const prefixCls = usePrefixCls('responsive-button-group', customPrefixCls);
  const { styles: buttonGroupStyles, cx } = useStyles();
  const locale = useLocale('ResponsiveButtonGroup');

  const { visibleItems, collapsedItems, ready, gap, measuring, containerRef } =
    useResponsiveLayout(props);
  const { pendingKeys, open, execute, onOpenChange } = useButtonGroupActions(
    props,
    ready && collapsedItems.length === 0,
  );
  const setMergedRef = useCallback(
    (node: HTMLDivElement | null) => {
      containerRef.current = node;
      setRef(ref, node);
    },
    [ref, containerRef],
  );

  const renderItemButton = (
    item: ResponsiveButtonGroupItem,
    measuring = false,
  ) => (
    <Button
      key={item.key}
      {...(measuring
        ? getMeasurementButtonProps(item.buttonProps)
        : item.buttonProps)}
      // 两种展示形态共用组内执行器，按钮自身不再重复管理 Loading 和节流。
      autoLoading={false}
      throttle={0}
      disabled={item.disabled}
      danger={item.danger}
      loading={item.loading || pendingKeys.has(item.key)}
      tooltip={measuring ? undefined : item.tooltip}
      icon={item.icon}
      tabIndex={measuring ? -1 : item.buttonProps?.tabIndex}
      onClick={
        measuring ? undefined : (event) => execute(item, 'button', event)
      }
    >
      {item.label}
    </Button>
  );

  const renderOverflowTrigger = (
    collapsed: readonly ResponsiveButtonGroupItem[],
    measuring = false,
  ) => {
    const count = collapsed.length;
    const defaultNode = (
      <Button
        {...(measuring
          ? getMeasurementButtonProps(overflowButtonProps)
          : overflowButtonProps)}
        className={cx(
          buttonGroupStyles.overflowTrigger,
          classNames?.overflowTrigger,
          overflowButtonProps?.className,
        )}
        style={{ ...styles?.overflowTrigger, ...overflowButtonProps?.style }}
        tabIndex={measuring ? -1 : overflowButtonProps?.tabIndex}
        icon={overflowIcon}
      >
        <span className={buttonGroupStyles.overflowLabel}>
          {overflowLabel ?? locale.more}
        </span>
        {showOverflowCount && (
          <span className={buttonGroupStyles.overflowCount}>{count}</span>
        )}
        <DownOutlined className={buttonGroupStyles.overflowArrow} />
      </Button>
    );
    if (!renderOverflowButton) return defaultNode;
    const result = renderOverflowButton({
      // 测量时传入全部项，预留计数所需宽度，避免折叠数量反过来影响布局。
      collapsedItems: collapsed,
      count,
      open: measuring ? false : open,
      defaultNode,
    });
    return React.isValidElement(result) ? result : <span>{result}</span>;
  };

  const menuItems = useMemo<MenuProps['items']>(
    () =>
      collapsedItems.map((item) => {
        const loading = Boolean(item.loading || pendingKeys.has(item.key));
        const defaultNode = (
          <span className={buttonGroupStyles.menuItemContent}>
            {(loading || item.icon) && (
              <span className={buttonGroupStyles.menuItemIcon}>
                {loading ? <LoadingOutlined spin /> : item.icon}
              </span>
            )}
            <span className={buttonGroupStyles.menuItemLabel}>
              {item.label}
            </span>
          </span>
        );
        let label =
          item.renderCollapsedItem?.({
            item,
            defaultNode,
            loading,
          }) ?? defaultNode;
        if (!item.renderCollapsedItem) {
          const { needTooltip, tooltipTitle, tooltipProps } =
            parseTooltipConfig(item.tooltip);
          if (needTooltip)
            label = (
              <Tooltip
                placement="right"
                {...tooltipProps}
                title={tooltipTitle}
                styles={{
                  ...tooltipProps.styles,
                  root: { pointerEvents: 'none', ...tooltipProps.styles?.root },
                }}
              >
                {defaultNode}
              </Tooltip>
            );
        }
        return {
          key: item.key,
          label,
          danger: item.danger,
          disabled: item.disabled || loading,
        };
      }),
    [
      buttonGroupStyles.menuItemContent,
      buttonGroupStyles.menuItemIcon,
      buttonGroupStyles.menuItemLabel,
      collapsedItems,
      pendingKeys,
    ],
  );

  const overflowNode = collapsedItems.length ? (
    <Dropdown
      trigger={['click']}
      {...overflowDropdownProps}
      rootClassName={cx(
        classNames?.popup,
        overflowDropdownProps?.rootClassName,
      )}
      overlayStyle={{
        ...styles?.popup,
        ...overflowDropdownProps?.overlayStyle,
      }}
      open={open}
      menu={{
        ...overflowMenuProps,
        items: menuItems,
        onClick: ({ key, domEvent }) => {
          const item = collapsedItems.find((item) => item.key === key);
          if (item) execute(item, 'overflow', domEvent);
        },
      }}
      onOpenChange={onOpenChange}
    >
      {renderOverflowTrigger(collapsedItems)}
    </Dropdown>
  ) : null;

  return withNativeProps(
    props,
    <div ref={setMergedRef} className={cx(prefixCls, buttonGroupStyles.root)}>
      <div className={buttonGroupStyles.visible} style={{ gap }}>
        {visibleItems.map((item) => renderItemButton(item))}
        {overflowNode}
      </div>
      {measuring && (
        <div className={buttonGroupStyles.measure} data-rbg-measure-container>
          {items.map((item) => (
            <span
              key={item.key}
              data-rbg-measure="item"
              className={buttonGroupStyles.measureItem}
            >
              {renderItemButton(item, true)}
            </span>
          ))}
          <span
            data-rbg-measure="overflow"
            className={buttonGroupStyles.measureItem}
          >
            {renderOverflowTrigger(items, true)}
          </span>
        </div>
      )}
    </div>,
  );
};

const ResponsiveButtonGroup = memo(forwardRef(InternalResponsiveButtonGroup));
ResponsiveButtonGroup.displayName = 'ResponsiveButtonGroup';

export default ResponsiveButtonGroup;
export type * from './type';
