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
import { useLocale, usePrefixCls } from '../../configProvider';
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

  // 外部数值在入口归一化，布局计算直接使用处理后的值。
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

  // 首次测量前的全量平铺只是临时布局，不应通知业务方或触发菜单关闭。
  const measurementReady =
    !isResponsive ||
    items.length === 0 ||
    (containerWidth !== null &&
      items.every((item) => itemWidths.has(item.key)) &&
      overflowWidth !== null);

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
    // 受控时只通知调用方，非受控时同时更新内部状态。
    if (controlledOpen === undefined) setInnerOpen(nextOpen);
    onOpenChange?.(nextOpen, info);
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
      // 错误通知即使抛错，也要完成本次菜单收尾。
      try {
        onActionError?.(error, info);
      } finally {
        finish();
      }
    };
    const result = run(
      item.key,
      () => {
        // 按顺序立即调用两个业务回调；单项回调抛错也不阻断统一回调。
        const results = [item.onClick, onItemClick].map((callback) => {
          try {
            return callback?.(info);
          } catch (error) {
            return Promise.reject(error);
          }
        });

        // 纯同步操作不创建异步任务，避免短暂进入 Loading。
        if (!results.some(isThenable)) return;

        // 等待全部任务结束再清除 Loading；按回调顺序报告第一个错误。
        return Promise.allSettled(results).then((settledResults) => {
          for (const result of settledResults) {
            if (result.status === 'rejected') throw result.reason;
          }
        });
      },
      [info],
      item.buttonProps?.throttle,
    );
    if (isThenable(result)) void Promise.resolve(result).then(finish, fail);
    else finish();
  };

  // 测量副本保留影响宽度的外观，移除交互属性并退出键盘导航。
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
    const info: ResponsiveButtonGroupOverflowRenderInfo = {
      // 测量时传入全部项，预留计数所需宽度，避免折叠数量反过来影响布局。
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
              placement="right"
              {...tooltipProps}
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
    // 菜单点击统一由 execute 收尾：同步立即关闭，异步等待全部回调结束。
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
    <div ref={setMergedRef} className={cx(prefixCls, buttonGroupStyles.root)}>
      <div className={buttonGroupStyles.visible} style={{ gap }}>
        {layout.visibleItems.map((item) => renderItemButton(item))}
        {overflowNode}
      </div>
      {isResponsive && items.length > 0 && (
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
