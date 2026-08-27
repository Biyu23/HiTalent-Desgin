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
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ConfigContext, useLocale, usePrefixCls } from '../../configProvider';
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
  getCollapseOrder,
  normalizeGap,
  normalizeMinVisibleCount,
} from './utils/layout';

/**
 * 根据已计算出的折叠索引集合将所有项拆分为平铺项和折叠项
 */
function splitItems(
  items: readonly ResponsiveButtonGroupItem[],
  collapsedIndexes: ReadonlySet<number>,
) {
  const visibleItems: ResponsiveButtonGroupItem[] = [];
  const collapsedItems: ResponsiveButtonGroupItem[] = [];
  items.forEach((item, index) =>
    (collapsedIndexes.has(index) ? collapsedItems : visibleItems).push(item),
  );
  return { visibleItems, collapsedItems };
}

/**
 * 自适应排版核心计算：
 * 1. expanded 模式或 items 为空：全量平铺。
 * 2. collapsed 模式：按优先级折叠至 minVisibleCount。
 * 3. responsive 模式：对比总宽度与容器可用宽度，不足时按优先级从低到高逐个折叠。
 */
function calculateLayout(
  items: readonly ResponsiveButtonGroupItem[],
  mode: ResponsiveButtonGroupProps['mode'],
  minVisibleCount: number,
  gap: number,
  containerWidth: number | null,
  itemWidths: ReadonlyMap<string, number>,
  overflowWidth: number | null,
) {
  if (mode === 'expanded' || items.length === 0) {
    return { visibleItems: [...items], collapsedItems: [] };
  }
  const order = getCollapseOrder(items);
  const maxCollapsed = items.length - minVisibleCount;
  if (mode === 'collapsed') {
    return splitItems(items, new Set(order.slice(0, maxCollapsed)));
  }
  // 未完成初始测量时，先平铺渲染以获取真实尺寸
  if (
    containerWidth === null ||
    items.some((item) => !Number.isFinite(itemWidths.get(item.key)))
  ) {
    return { visibleItems: [...items], collapsedItems: [] };
  }
  const itemWidthTotal = items.reduce(
    (sum, item) => sum + (itemWidths.get(item.key) || 0),
    0,
  );
  // 所有平铺按钮无需折叠即可完整容纳
  if (itemWidthTotal + gap * Math.max(0, items.length - 1) <= containerWidth) {
    return { visibleItems: [...items], collapsedItems: [] };
  }
  if (overflowWidth === null) {
    return { visibleItems: [...items], collapsedItems: [] };
  }
  // 逐项折叠并验证：剩余平铺按钮 + 间距 + “更多”触发器按钮总宽度 <= 容器可用宽度
  const collapsedIndexes = new Set<number>();
  let visibleWidth = itemWidthTotal;
  for (let count = 1; count <= maxCollapsed; count += 1) {
    const index = order[count - 1];
    collapsedIndexes.add(index);
    visibleWidth -= itemWidths.get(items[index].key) || 0;
    if (
      visibleWidth + overflowWidth + gap * (items.length - count) <=
      containerWidth
    ) {
      return splitItems(items, collapsedIndexes);
    }
  }
  return splitItems(items, collapsedIndexes);
}

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
    buttonProps,
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
    rootClassName,
    classNames,
    styles,
  } = props;

  const prefixCls = usePrefixCls('responsive-button-group', customPrefixCls);
  const { styles: buttonGroupStyles, cx } = useStyles(prefixCls);
  const locale = useLocale('ResponsiveButtonGroup');
  const { direction = 'ltr' } = useContext(ConfigContext);

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
  const [candidateCount, setCandidateCount] = useState(1);
  const stabilizationRef = useRef(0);
  const previousKeysRef = useRef<{
    visible: string[];
    collapsed: string[];
  }>();

  const {
    containerWidth,
    itemWidths,
    overflowWidth,
    setContainerRef,
    getItemRef,
    setOverflowRef,
  } = useResponsiveMeasurements();

  // 合并内部 container ref 与外部 forwarded ref
  const setMergedRef = useCallback(
    (node: HTMLDivElement | null) => {
      setContainerRef(node);
      setRef(ref, node);
    },
    [ref, setContainerRef],
  );

  const open = overflowDropdownProps?.open ?? innerOpen;

  // 测量溢出按钮时使用的候选折叠项（避免因数字位数变化导致测量抖动）
  const candidateItems = useMemo(() => {
    const order = getCollapseOrder(items);
    const indexes = new Set(
      order.slice(0, Math.min(candidateCount, items.length)),
    );
    return items.filter((_, index) => indexes.has(index));
  }, [candidateCount, items]);

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
    mode !== 'responsive' ||
    (containerWidth !== null &&
      items.every((item) => itemWidths.has(item.key)) &&
      (layout.collapsedItems.length === 0 || overflowWidth !== null));

  // 开发环境下对重复 item.key 做出警告
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    const keys = new Set<string>();
    items.forEach((item) => {
      if (keys.has(item.key)) {
        console.error(
          `ResponsiveButtonGroup received duplicate item key "${item.key}".`,
        );
      }
      keys.add(item.key);
    });
  }, [items]);

  // 根据当前实际折叠数量动态修正候选折叠项数量，确保更多按钮测量宽度准确
  useEffect(() => {
    const count = Math.max(1, layout.collapsedItems.length);
    if (mode !== 'responsive' || count === candidateCount) {
      stabilizationRef.current = 0;
      return;
    }
    if (stabilizationRef.current >= Math.min(items.length + 1, 8)) return;
    stabilizationRef.current += 1;
    setCandidateCount(count);
  }, [candidateCount, items.length, layout.collapsedItems.length, mode]);

  // 平铺与折叠集合变化时触发 onVisibleChange
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
  }, [layout, measurementReady, onVisibleChange]);

  // 当折叠项变为 0 时自动关闭已展开的下拉菜单
  useEffect(() => {
    if (layout.collapsedItems.length === 0 && open) {
      if (overflowDropdownProps?.open === undefined) setInnerOpen(false);
      overflowDropdownProps?.onOpenChange?.(false, { source: 'trigger' });
    }
  }, [layout.collapsedItems.length, open, overflowDropdownProps]);

  // 统一执行点击事件并处理异步 Promise 状态与节流
  const execute = useCallback(
    (
      item: ResponsiveButtonGroupItem,
      source: ResponsiveButtonGroupClickInfo['source'],
      event: ResponsiveButtonGroupClickInfo['event'],
    ) => {
      if (item.disabled || item.loading) return;
      const info: ResponsiveButtonGroupClickInfo = {
        key: item.key,
        item,
        source,
        event,
      };
      const action = (actionInfo: ResponsiveButtonGroupClickInfo) => {
        const first = item.onClick?.(actionInfo);
        const second = onItemClick?.(actionInfo);
        const asyncResults = [first, second].filter(isThenable);
        return asyncResults.length ? Promise.all(asyncResults) : undefined;
      };
      return run(
        item.key,
        action,
        [info],
        item.buttonProps?.throttle ?? buttonProps?.throttle,
      );
    },
    [buttonProps?.throttle, onItemClick, run],
  );

  // 渲染单个平铺按钮（measuring 为 true 时用于隐藏测量，剥离多余事件与属性）
  const renderItemButton = useCallback(
    (item: ResponsiveButtonGroupItem, measuring = false) => (
      <Button
        key={item.key}
        {...(measuring ? getMeasurementButtonProps(buttonProps) : buttonProps)}
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
          measuring
            ? undefined
            : (event) => {
                const result = execute(item, 'button', event);
                if (isThenable(result)) {
                  void Promise.resolve(result).catch((error: unknown) =>
                    onActionError?.(error, {
                      key: item.key,
                      item,
                      source: 'button',
                      event,
                    }),
                  );
                }
                return undefined;
              }
        }
      >
        {item.label}
      </Button>
    ),
    [buttonProps, execute, onActionError, pendingKeys],
  );

  // 渲染“更多”触发器按钮
  const renderOverflowTrigger = useCallback(
    (collapsed: readonly ResponsiveButtonGroupItem[], measuring = false) => {
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
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={
            overflowButtonProps?.['aria-label'] ?? locale.moreActions(count)
          }
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
        open,
        defaultNode,
      };
      const result = renderOverflowButton(info);
      return React.isValidElement(result) ? result : <span>{result}</span>;
    },
    [
      classNames?.overflowTrigger,
      cx,
      locale,
      open,
      overflowButtonProps,
      overflowIcon,
      overflowLabel,
      prefixCls,
      renderOverflowButton,
      showOverflowCount,
      styles?.overflowTrigger,
    ],
  );

  // 构造折叠下拉菜单的 Menu 项
  const menuItems = useMemo<MenuProps['items']>(
    () =>
      layout.collapsedItems.map((item) => {
        const loading = Boolean(item.loading || pendingKeys.has(item.key));
        const defaultNode = (
          <span
            className={cx(
              buttonGroupStyles.menuItemContent,
              classNames?.menuItem,
            )}
          >
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
    [classNames?.menuItem, cx, layout.collapsedItems, pendingKeys, prefixCls],
  );

  const itemMap = useMemo(
    () => new Map(layout.collapsedItems.map((item) => [item.key, item])),
    [layout.collapsedItems],
  );

  // 点击下拉菜单项：若为异步操作则保持展开并展示 Loading，完成后自动收起
  const handleMenuClick: MenuProps['onClick'] = (info) => {
    const item = itemMap.get(info.key);
    if (!item) return;
    const result = execute(item, 'overflow', info.domEvent);
    const close = () => {
      if (overflowDropdownProps?.open === undefined) setInnerOpen(false);
      overflowDropdownProps?.onOpenChange?.(false, { source: 'menu' });
    };
    if (isThenable(result)) {
      void Promise.resolve(result).then(close, (error: unknown) => {
        onActionError?.(error, {
          key: item.key,
          item,
          source: 'overflow',
          event: info.domEvent,
        });
        close();
      });
    } else close();
  };

  const handleOpenChange: NonNullable<DropdownProps['onOpenChange']> = (
    nextOpen,
    info,
  ) => {
    // 异步操作期间阻止点击菜单项立即关闭
    if (!nextOpen && info && (info as any).source === 'menu') return;

    if (overflowDropdownProps?.open === undefined) {
      setInnerOpen(nextOpen);
    }
    overflowDropdownProps?.onOpenChange?.(nextOpen, info);
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
      className={cx(
        prefixCls,
        buttonGroupStyles.root,
        rootClassName,
        classNames?.root,
      )}
      style={styles?.root}
      role="group"
      dir={direction}
    >
      <div
        className={cx(buttonGroupStyles.visible, classNames?.visible)}
        style={{ ...styles?.visible, gap }}
      >
        {layout.visibleItems.map((item) => renderItemButton(item))}
        {overflowNode}
      </div>
      {mode === 'responsive' && items.length > 0 && (
        <div className={buttonGroupStyles.measure} aria-hidden="true">
          {items.map((item) => (
            <span
              key={item.key}
              ref={getItemRef(item.key)}
              className={buttonGroupStyles.measureItem}
            >
              {renderItemButton(item, true)}
            </span>
          ))}
          <span ref={setOverflowRef} className={buttonGroupStyles.measureItem}>
            {renderOverflowTrigger(candidateItems, true)}
          </span>
        </div>
      )}
    </div>,
  );
};

const ForwardResponsiveButtonGroup = forwardRef<
  ResponsiveButtonGroupRef,
  ResponsiveButtonGroupProps
>(InternalResponsiveButtonGroup);

const ResponsiveButtonGroup = memo(
  ForwardResponsiveButtonGroup,
) as unknown as (<
  Props extends ResponsiveButtonGroupProps = ResponsiveButtonGroupProps,
>(
  props: Props & React.RefAttributes<ResponsiveButtonGroupRef>,
) => React.ReactElement) & {
  displayName?: string;
};

ForwardResponsiveButtonGroup.displayName = 'ResponsiveButtonGroup';

export default ResponsiveButtonGroup;
export type * from './type';
