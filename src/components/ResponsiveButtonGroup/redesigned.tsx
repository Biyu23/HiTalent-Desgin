import {
  DownOutlined,
  EllipsisOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import type { DropdownProps, MenuProps, TooltipProps } from 'antd';
import { Dropdown, Tooltip } from 'antd';
import clsx from 'clsx';
import React, {
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ConfigContext, useLocale, usePrefixCls } from '../../configProvider';
import { areArraysEqual, isThenable, withNativeProps } from '../../util';
import {
  ComponentNamespaceProvider,
  useResolvedComponentNamespace,
} from '../_util/namespace';
import { useKeyedActionRunner } from '../_util/useActionRunner';
import Button from '../Button';
import { useResponsiveMeasurements } from './hooks/useResponsiveMeasurements';
import { useStyle } from './style';
import type {
  ResponsiveButtonGroupClickInfo,
  ResponsiveButtonGroupItem,
  ResponsiveButtonGroupOverflowRenderInfo,
  ResponsiveButtonGroupProps,
  ResponsiveButtonGroupRenderInfo,
} from './type';
import { getMeasurementButtonProps } from './utils/buttonProps';
import {
  getCollapseOrder,
  normalizeGap,
  normalizeMinVisibleCount,
} from './utils/layout';

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

function calculateLayout(
  items: readonly ResponsiveButtonGroupItem[],
  mode: ResponsiveButtonGroupProps['mode'],
  direction: 'ltr' | 'rtl',
  minVisibleCount: number,
  gap: number,
  containerWidth: number | null,
  itemWidths: ReadonlyMap<string, number>,
  overflowWidth: number | null,
) {
  if (mode === 'expanded' || items.length === 0) {
    return { visibleItems: [...items], collapsedItems: [] };
  }
  const order = getCollapseOrder(items, direction);
  const maxCollapsed = items.length - minVisibleCount;
  if (mode === 'collapsed') {
    return splitItems(items, new Set(order.slice(0, maxCollapsed)));
  }
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
  if (itemWidthTotal + gap * Math.max(0, items.length - 1) <= containerWidth) {
    return { visibleItems: [...items], collapsedItems: [] };
  }
  if (overflowWidth === null) {
    return { visibleItems: [...items], collapsedItems: [] };
  }
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

const ResponsiveButtonGroup: React.FC<ResponsiveButtonGroupProps> = (props) => {
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
  const { wrapSSR, hashId } = useStyle(prefixCls);
  const namespace = useResolvedComponentNamespace(
    'responsive-button-group',
    customPrefixCls,
    hashId,
  );
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
  const open = overflowDropdownProps?.open ?? innerOpen;
  const candidateItems = useMemo(() => {
    const order = getCollapseOrder(items, direction);
    const indexes = new Set(
      order.slice(0, Math.min(candidateCount, items.length)),
    );
    return items.filter((_, index) => indexes.has(index));
  }, [candidateCount, direction, items]);
  const layout = useMemo(
    () =>
      calculateLayout(
        items,
        mode,
        direction,
        minVisibleCount,
        gap,
        containerWidth,
        itemWidths,
        overflowWidth,
      ),
    [
      containerWidth,
      direction,
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

  useEffect(() => {
    if (layout.collapsedItems.length === 0 && open) {
      if (overflowDropdownProps?.open === undefined) setInnerOpen(false);
      overflowDropdownProps?.onOpenChange?.(false, { source: 'trigger' });
    }
  }, [layout.collapsedItems.length, open, overflowDropdownProps]);

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

  const renderOverflowTrigger = useCallback(
    (collapsed: readonly ResponsiveButtonGroupItem[], measuring = false) => {
      const count = collapsed.length;
      const defaultNode = (
        <Button
          {...(measuring
            ? getMeasurementButtonProps(overflowButtonProps)
            : overflowButtonProps)}
          className={clsx(
            namespace.element('overflow-trigger'),
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
          <span>{overflowLabel ?? locale.more}</span>
          {showOverflowCount && <span>{count}</span>}
          <DownOutlined />
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
      locale,
      namespace,
      open,
      overflowButtonProps,
      overflowIcon,
      overflowLabel,
      renderOverflowButton,
      showOverflowCount,
      styles?.overflowTrigger,
    ],
  );

  const menuItems = useMemo<MenuProps['items']>(
    () =>
      layout.collapsedItems.map((item) => {
        const loading = Boolean(item.loading || pendingKeys.has(item.key));
        const defaultNode = (
          <span className={classNames?.menuItem} style={styles?.menuItem}>
            {(loading || item.icon) &&
              (loading ? <LoadingOutlined spin /> : item.icon)}
            <span>{item.label}</span>
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
          label = <Tooltip {...tooltipProps}>{defaultNode}</Tooltip>;
        }
        return {
          key: item.key,
          label,
          danger: item.danger,
          disabled: item.disabled || loading,
        };
      }),
    [
      classNames?.menuItem,
      layout.collapsedItems,
      pendingKeys,
      styles?.menuItem,
    ],
  );
  const itemMap = useMemo(
    () => new Map(layout.collapsedItems.map((item) => [item.key, item])),
    [layout.collapsedItems],
  );
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
    if (!nextOpen && info.source === 'menu') return;
    if (overflowDropdownProps?.open === undefined) setInnerOpen(nextOpen);
    overflowDropdownProps?.onOpenChange?.(nextOpen, info);
  };

  const overflowNode = layout.collapsedItems.length ? (
    <Dropdown
      trigger={['click']}
      {...overflowDropdownProps}
      rootClassName={clsx(
        namespace.prefixCls,
        namespace.hashId,
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

  return wrapSSR(
    <ComponentNamespaceProvider value={namespace}>
      {withNativeProps(
        props,
        <div
          ref={setContainerRef}
          className={clsx(
            namespace.prefixCls,
            namespace.hashId,
            rootClassName,
            classNames?.root,
          )}
          style={styles?.root}
          role="group"
          dir={direction}
        >
          <div
            className={clsx(namespace.element('visible'), classNames?.visible)}
            style={{ ...styles?.visible, gap }}
          >
            {layout.visibleItems.map((item) => renderItemButton(item))}
            {overflowNode}
          </div>
          {mode === 'responsive' && items.length > 0 && (
            <div className={namespace.element('measure')} aria-hidden="true">
              {items.map((item) => (
                <span
                  key={item.key}
                  ref={getItemRef(item.key)}
                  className={namespace.element('measure-item')}
                >
                  {renderItemButton(item, true)}
                </span>
              ))}
              <span
                ref={setOverflowRef}
                className={namespace.element('measure-item')}
              >
                {renderOverflowTrigger(candidateItems, true)}
              </span>
            </div>
          )}
        </div>,
      )}
    </ComponentNamespaceProvider>,
  );
};

export default memo(ResponsiveButtonGroup);
