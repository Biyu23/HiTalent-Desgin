import {
  DownOutlined,
  EllipsisOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import type { DropdownProps, MenuProps, TooltipProps } from 'antd';
import { Dropdown, Tooltip } from 'antd';
import React, {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useConfig, useLocale, usePrefixCls } from '../../configProvider';
import { useKeyedActionRunner } from '../../hooks';
import {
  areArraysEqual,
  isThenable,
  setRef,
  withNativeProps,
} from '../../utils';
import Button from '../Button';
import { useResponsiveMeasurements } from './hooks/useResponsiveMeasurements';
import { useStyles } from './style';
import type {
  ResponsiveButtonGroupClickInfo,
  ResponsiveButtonGroupItem,
  ResponsiveButtonGroupOverflowRenderInfo,
  ResponsiveButtonGroupProps,
  ResponsiveButtonGroupRef,
  ResponsiveButtonGroupRenderInfo,
} from './type';
import { getMeasurementButtonProps } from './utils/buttonProps';
import {
  calculateLayout,
  normalizeGap,
  normalizeMinVisibleCount,
} from './utils/layout';

const InternalResponsiveButtonGroup: React.ForwardRefRenderFunction<
  ResponsiveButtonGroupRef,
  ResponsiveButtonGroupProps
> = (props, ref) => {
  const {
    prefixCls: customPrefixCls,
    items,
    mode = 'responsive',
    minVisibleCount: minVisibleCountProp = 0,
    gap: gapProp = 8,
    overflowLabel,
    overflowIcon = <EllipsisOutlined />,
    showOverflowCount = true,
    overflowButtonProps,
    overflowDropdownProps,
    overflowMenuProps,
    renderOverflowButton,
    onItemClick,
    onActionError,
    onVisibleChange,
    classNames,
    styles,
  } = props;

  const prefixCls = usePrefixCls('responsive-button-group', customPrefixCls);
  const { styles: buttonGroupStyles, cx } = useStyles(prefixCls);
  const locale = useLocale('ResponsiveButtonGroup');
  const { direction } = useConfig();

  const gap = normalizeGap(gapProp);
  const minVisibleCount = normalizeMinVisibleCount(
    minVisibleCountProp,
    items.length,
  );

  const { pendingKeys, run } = useKeyedActionRunner<
    string,
    [ResponsiveButtonGroupClickInfo]
  >();
  const [innerOpen, setInnerOpen] = useState(false);
  const previousKeysRef = useRef<{
    visible: string[];
    collapsed: string[];
  }>();

  const isResponsive = mode === 'responsive';
  const { containerWidth, itemWidths, overflowWidth, containerRef } =
    useResponsiveMeasurements(isResponsive, items);

  // 合并内部 container ref 与外部 forwarded ref
  const setMergedRef = useCallback(
    (node: HTMLDivElement | null) => {
      containerRef.current = node;
      setRef(ref, node);
    },
    [ref, containerRef],
  );

  const controlledOpen = overflowDropdownProps?.open;
  const onOpenChange = overflowDropdownProps?.onOpenChange;
  const open = controlledOpen ?? innerOpen;

  // 根据当前平铺项、折叠项及尺寸信息进行排版计算
  const layout = useMemo(
    () =>
      calculateLayout(
        items,
        mode,
        minVisibleCount,
        gap,
        containerWidth,
        itemWidths,
        overflowWidth,
      ),
    [
      containerWidth,
      gap,
      itemWidths,
      items,
      minVisibleCount,
      mode,
      overflowWidth,
    ],
  );

  const measurementReady =
    !isResponsive ||
    items.length === 0 ||
    (containerWidth !== null &&
      items.every((item) => itemWidths.has(item.key)) &&
      (items.length === 0 || overflowWidth !== null));

  // 当平铺项集合或折叠项集合发生实质变化时向外触发 onVisibleChange 回调
  useEffect(() => {
    if (!measurementReady) return;
    const visible = layout.visibleItems.map((item) => item.key);
    const collapsed = layout.collapsedItems.map((item) => item.key);
    const previous = previousKeysRef.current;
    if (
      previous &&
      areArraysEqual(previous.visible, visible) &&
      areArraysEqual(previous.collapsed, collapsed)
    ) {
      return;
    }
    previousKeysRef.current = { visible, collapsed };
    onVisibleChange?.(visible, collapsed);
  }, [
    layout.collapsedItems,
    layout.visibleItems,
    measurementReady,
    onVisibleChange,
  ]);

  // 当折叠项变为 0（例如容器宽度拉大）时，自动关闭可能正展开的“更多”下拉菜单
  useEffect(() => {
    if (measurementReady && layout.collapsedItems.length === 0 && open) {
      if (controlledOpen === undefined) setInnerOpen(false);
      onOpenChange?.(false, { source: 'trigger' });
    }
  }, [
    measurementReady,
    layout.collapsedItems.length,
    open,
    controlledOpen,
    onOpenChange,
  ]);

  const changeOpen: NonNullable<DropdownProps['onOpenChange']> = (
    nextOpen,
    info,
  ) => {
    if (overflowDropdownProps?.open === undefined) setInnerOpen(nextOpen);
    overflowDropdownProps?.onOpenChange?.(nextOpen, info);
  };

  const execute = (
    item: ResponsiveButtonGroupItem,
    source: ResponsiveButtonGroupClickInfo['source'],
    event: ResponsiveButtonGroupClickInfo['event'],
  ) => {
    if (item.disabled || item.loading || pendingKeys.has(item.key)) return;
    const info = { key: item.key, item, source, event };
    const finish = () => {
      if (source === 'overflow') changeOpen(false, { source: 'menu' });
    };
    const fail = (error: unknown) => {
      try {
        onActionError?.(error, info);
      } finally {
        finish();
      }
    };
    try {
      const result = run(
        item.key,
        () => {
          // Convert sync throws to rejections so both callbacks are observed.
          const invoke = (callback?: ResponsiveButtonGroupItem['onClick']) => {
            try {
              return callback?.(info);
            } catch (error) {
              return Promise.reject(error);
            }
          };
          const first = invoke(item.onClick);
          const second = invoke(onItemClick);
          return isThenable(first) || isThenable(second)
            ? Promise.allSettled([first, second]).then((results) => {
                for (const result of results) {
                  if (result.status === 'rejected') throw result.reason;
                }
              })
            : undefined;
        },
        [info],
        item.buttonProps?.throttle,
      );
      if (isThenable(result)) void Promise.resolve(result).then(finish, fail);
      else finish();
    } catch (error) {
      fail(error);
    }
  };

  const renderItemButton = (
    item: ResponsiveButtonGroupItem,
    measuring = false,
  ) => (
    <Button
      key={item.key}
      {...(measuring
        ? getMeasurementButtonProps(item.buttonProps)
        : item.buttonProps)}
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
    const info: ResponsiveButtonGroupOverflowRenderInfo = {
      collapsedItems: collapsed,
      count,
      open: measuring ? false : open,
      defaultNode,
    };
    const result = renderOverflowButton(info);
    return React.isValidElement(result) ? result : <span>{result}</span>;
  };

  const menuItems = useMemo<MenuProps['items']>(
    () =>
      layout.collapsedItems.map((item) => {
        const loading = Boolean(item.loading || pendingKeys.has(item.key));
        const defaultNode = (
          <span className={cx(buttonGroupStyles.menuItemContent)}>
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
        const info: ResponsiveButtonGroupRenderInfo = {
          item,
          defaultNode,
          loading,
        };
        let label = item.renderCollapsedItem?.(info) ?? defaultNode;
        if (!item.renderCollapsedItem && item.tooltip) {
          const tooltipProps: TooltipProps =
            typeof item.tooltip === 'string' ||
            React.isValidElement(item.tooltip)
              ? { title: item.tooltip }
              : item.tooltip;
          label = (
            <Tooltip
              {...tooltipProps}
              placement="right"
              overlayStyle={{
                pointerEvents: 'none',
                ...tooltipProps.overlayStyle,
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
      cx,
      layout.collapsedItems,
      pendingKeys,
    ],
  );

  const handleMenuClick: MenuProps['onClick'] = (info) => {
    const item = layout.collapsedItems.find((item) => item.key === info.key);
    if (item) execute(item, 'overflow', info.domEvent);
  };

  const handleOpenChange: NonNullable<DropdownProps['onOpenChange']> = (
    nextOpen,
    info,
  ) => {
    // 异步操作期间阻止点击菜单项立即关闭
    if (!nextOpen && info.source === 'menu') return;

    changeOpen(nextOpen, info);
  };

  const overflowNode = layout.collapsedItems.length ? (
    <Dropdown
      trigger={['click']}
      {...overflowDropdownProps}
      rootClassName={cx(
        buttonGroupStyles.popup,
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
        onClick: handleMenuClick,
      }}
      onOpenChange={handleOpenChange}
    >
      {renderOverflowTrigger(layout.collapsedItems)}
    </Dropdown>
  ) : null;

  return withNativeProps(
    props,
    <div
      ref={setMergedRef}
      className={cx(prefixCls, buttonGroupStyles.root)}
      dir={direction}
    >
      <div className={buttonGroupStyles.visible} style={{ gap }}>
        {layout.visibleItems.map((item) => renderItemButton(item))}
        {overflowNode}
      </div>
      {isResponsive && items.length > 0 && (
        <div className={buttonGroupStyles.measure} aria-hidden="true">
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
