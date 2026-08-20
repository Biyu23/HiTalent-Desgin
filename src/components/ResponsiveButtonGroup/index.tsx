import { DownOutlined, EllipsisOutlined } from '@ant-design/icons';
import type { DropdownProps } from 'antd';
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
import { ConfigContext } from '../../configProvider/context';
import { useLocale } from '../../configProvider/useLocale';
import { useNamespace } from '../../configProvider/usePrefixCls';
import { areArraysEqual, isThenable, withNativeProps } from '../../util';
import Button from '../Button';
import OverflowMenu from './components/OverflowMenu';
import { useItemAction } from './hooks/useItemAction';
import { useItemMeasurements } from './hooks/useItemMeasurements';
import { useStyle } from './style';
import type {
  ResponsiveButtonGroupItem,
  ResponsiveButtonGroupOverflowRenderInfo,
  ResponsiveButtonGroupProps,
} from './type';
import { getMeasurementButtonProps } from './utils/buttonProps';
import {
  getCollapseOrder,
  getResponsiveLayout,
  normalizeGap,
  normalizeMinVisibleCount,
} from './utils/layout';

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
    onVisibleChange,
  } = props;
  const { prefixCls, e } = useNamespace(
    'responsive-button-group',
    customPrefixCls,
  );
  const locale = useLocale('ResponsiveButtonGroup');
  const { wrapSSR, hashId } = useStyle(prefixCls);
  const { direction } = useContext(ConfigContext);
  const gap = normalizeGap(gapProp);
  const minVisibleCount = normalizeMinVisibleCount(
    minVisibleCountProp,
    items.length,
  );
  const { loadingKeys, executeItemAction } = useItemAction({
    items,
    buttonThrottle: buttonProps?.throttle,
    onItemClick,
  });
  const [innerOpen, setInnerOpen] = useState(false);
  const visibleContainerRef = useRef<HTMLDivElement | null>(null);
  const previousCollapsedCountRef = useRef<number | null>(null);
  const onOpenChangeRef = useRef(overflowDropdownProps?.onOpenChange);
  onOpenChangeRef.current = overflowDropdownProps?.onOpenChange;
  const lastLayoutRef = useRef<{
    visibleKeys: React.Key[];
    collapsedKeys: React.Key[];
  }>();
  const {
    containerWidth,
    itemWidths,
    overflowWidths,
    setContainerRef,
    getItemMeasureRef,
    getOverflowMeasureRef,
  } = useItemMeasurements();

  const open = overflowDropdownProps?.open ?? innerOpen;
  const overflowText = overflowLabel ?? locale.more;
  const measurementButtonProps = useMemo(
    () => getMeasurementButtonProps(buttonProps),
    [buttonProps],
  );
  const measurementOverflowButtonProps = useMemo(
    () => getMeasurementButtonProps(overflowButtonProps),
    [overflowButtonProps],
  );
  const measurementItemButtonProps = useMemo(() => {
    return new Map(
      items.map((item) => [
        item.key,
        getMeasurementButtonProps(item.buttonProps),
      ]),
    );
  }, [items]);

  const layout = useMemo(
    () =>
      getResponsiveLayout({
        items,
        mode,
        direction,
        minVisibleCount,
        gap,
        containerWidth,
        itemWidths,
        overflowWidths,
      }),
    [
      items,
      mode,
      direction,
      minVisibleCount,
      gap,
      containerWidth,
      itemWidths,
      overflowWidths,
    ],
  );
  const { visibleItems, collapsedItems } = useMemo(() => {
    if (layout.collapsedKeys.length === 0) {
      return { visibleItems: items, collapsedItems: [] };
    }
    if (layout.visibleKeys.length === 0) {
      return { visibleItems: [], collapsedItems: items };
    }
    const collapsedKeySet = new Set(layout.collapsedKeys);
    const visible: ResponsiveButtonGroupItem[] = [];
    const collapsed: ResponsiveButtonGroupItem[] = [];
    items.forEach((item) => {
      if (collapsedKeySet.has(item.key)) {
        collapsed.push(item);
      } else {
        visible.push(item);
      }
    });
    return { visibleItems: visible, collapsedItems: collapsed };
  }, [items, layout.visibleKeys.length, layout.collapsedKeys]);

  const maxCollapsedCount = items.length - minVisibleCount;
  const measuredCollapsedItems = useMemo(() => {
    const collapseOrder = getCollapseOrder(items, direction);

    return Array.from({ length: maxCollapsedCount }, (_, index) => {
      const collapsedIndexes = new Set(collapseOrder.slice(0, index + 1));
      return items.filter((_, itemIndex) => collapsedIndexes.has(itemIndex));
    });
  }, [items, maxCollapsedCount, direction]);

  const measurementReady = useMemo(() => {
    if (mode !== 'responsive') return true;
    if (containerWidth === null) return false;
    for (let i = 0; i < items.length; i += 1) {
      if (!itemWidths.has(items[i].key)) return false;
    }
    for (let count = 1; count <= maxCollapsedCount; count += 1) {
      if (!overflowWidths.has(count)) return false;
    }
    return true;
  }, [
    mode,
    containerWidth,
    items,
    itemWidths,
    maxCollapsedCount,
    overflowWidths,
  ]);

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    const keys = new Set<string>();
    items.forEach((item) => {
      const normalizedKey = String(item.key);
      if (keys.has(normalizedKey)) {
        console.warn(
          `[ResponsiveButtonGroup] item key "${String(
            item.key,
          )}" 重复，key 必须唯一。`,
        );
      }
      keys.add(normalizedKey);
    });
  }, [items]);

  useEffect(() => {
    const previousCount = previousCollapsedCountRef.current;
    previousCollapsedCountRef.current = collapsedItems.length;

    if (collapsedItems.length !== 0 || !open || previousCount === 0) return;

    visibleContainerRef.current
      ?.querySelector<HTMLElement>('button:not(:disabled), a[href]')
      ?.focus();
    if (overflowDropdownProps?.open === undefined) setInnerOpen(false);
    onOpenChangeRef.current?.(false, { source: 'trigger' });
  }, [collapsedItems.length, open, overflowDropdownProps?.open]);

  useEffect(() => {
    if (!measurementReady || !onVisibleChange) return;

    const previous = lastLayoutRef.current;
    if (
      previous &&
      areArraysEqual(previous.visibleKeys, layout.visibleKeys) &&
      areArraysEqual(previous.collapsedKeys, layout.collapsedKeys)
    ) {
      return;
    }

    lastLayoutRef.current = layout;
    onVisibleChange([...layout.visibleKeys], [...layout.collapsedKeys]);
  }, [layout, measurementReady, onVisibleChange]);

  const handleOpenChange = useCallback<
    NonNullable<DropdownProps['onOpenChange']>
  >(
    (nextOpen, info) => {
      // 菜单项点击的收起动作由 handleOverflowItemClick 精确接管（支持异步 loading 保持展开）
      if (!nextOpen && info?.source === 'menu') {
        return;
      }
      if (overflowDropdownProps?.open === undefined) setInnerOpen(nextOpen);
      onOpenChangeRef.current?.(nextOpen, info);
    },
    [overflowDropdownProps?.open],
  );

  const renderItemButton = useCallback(
    (item: ResponsiveButtonGroupItem, measuring = false) => {
      const loading = item.loading || loadingKeys.has(item.key);
      const currentButtonProps = measuring
        ? measurementButtonProps
        : buttonProps;
      const currentItemButtonProps = measuring
        ? measurementItemButtonProps.get(item.key)
        : item.buttonProps;

      return (
        <Button
          key={item.key}
          {...currentButtonProps}
          {...currentItemButtonProps}
          autoLoading={false}
          throttle={0}
          disabled={item.disabled}
          danger={item.danger}
          loading={loading}
          tooltip={measuring ? undefined : item.tooltip}
          icon={item.icon}
          tabIndex={
            measuring ? -1 : item.buttonProps?.tabIndex ?? buttonProps?.tabIndex
          }
          onClick={
            measuring
              ? undefined
              : (event) => executeItemAction(item, 'button', event)
          }
        >
          {item.label}
        </Button>
      );
    },
    [
      buttonProps,
      executeItemAction,
      loadingKeys,
      measurementButtonProps,
      measurementItemButtonProps,
    ],
  );

  const renderOverflowTrigger = useCallback(
    (
      currentCollapsedItems: readonly ResponsiveButtonGroupItem[],
      currentOpen: boolean,
      measuring = false,
    ) => {
      const count = currentCollapsedItems.length;
      const currentOverflowButtonProps = measuring
        ? measurementOverflowButtonProps
        : overflowButtonProps;
      const ariaLabel = locale.moreActions(count);
      const defaultNode = (
        <Button
          {...currentOverflowButtonProps}
          className={clsx(
            e('overflow-trigger'),
            currentOverflowButtonProps?.className,
          )}
          tabIndex={measuring ? -1 : overflowButtonProps?.tabIndex}
          icon={overflowIcon}
          aria-haspopup="menu"
          aria-expanded={currentOpen}
          aria-label={overflowButtonProps?.['aria-label'] ?? ariaLabel}
        >
          <span className={e('overflow-label')}>{overflowText}</span>
          {showOverflowCount && (
            <span className={e('overflow-count')}>{count}</span>
          )}
          <DownOutlined className={e('overflow-arrow')} />
        </Button>
      );
      const renderInfo: ResponsiveButtonGroupOverflowRenderInfo = {
        collapsedItems: currentCollapsedItems,
        count,
        open: currentOpen,
        defaultNode,
      };
      if (!renderOverflowButton) return defaultNode;

      const content = renderOverflowButton(renderInfo);
      return React.isValidElement(content) ? (
        content
      ) : (
        <span className={e('overflow-trigger')}>{content}</span>
      );
    },
    [
      e,
      locale,
      measurementOverflowButtonProps,
      overflowButtonProps,
      overflowIcon,
      overflowText,
      renderOverflowButton,
      showOverflowCount,
    ],
  );

  const handleOverflowItemClick = useCallback(
    async (
      item: ResponsiveButtonGroupItem,
      event: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>,
    ) => {
      const result = executeItemAction(item, 'overflow', event);
      if (isThenable(result)) {
        try {
          await result;
        } finally {
          if (overflowDropdownProps?.open === undefined) {
            setInnerOpen(false);
          }
          onOpenChangeRef.current?.(false, { source: 'trigger' });
        }
      } else {
        if (overflowDropdownProps?.open === undefined) {
          setInnerOpen(false);
        }
        onOpenChangeRef.current?.(false, { source: 'menu' });
      }
    },
    [executeItemAction, overflowDropdownProps?.open],
  );

  const overflowNode =
    collapsedItems.length > 0 ? (
      <OverflowMenu
        prefixCls={prefixCls}
        items={collapsedItems}
        loadingKeys={loadingKeys}
        dropdownProps={overflowDropdownProps}
        menuProps={overflowMenuProps}
        open={open}
        onOpenChange={handleOpenChange}
        onItemClick={handleOverflowItemClick}
      >
        {renderOverflowTrigger(collapsedItems, open)}
      </OverflowMenu>
    ) : null;

  return wrapSSR(
    withNativeProps(
      props,
      <div
        ref={setContainerRef}
        className={clsx(prefixCls, hashId)}
        role="group"
        dir={direction}
      >
        <div
          ref={visibleContainerRef}
          className={clsx(e('visible'), hashId)}
          style={{ gap }}
        >
          {visibleItems.map((item) => renderItemButton(item))}
          {overflowNode}
        </div>

        {mode === 'responsive' && items.length > 0 && (
          <div className={clsx(e('measure'), hashId)} aria-hidden="true">
            {items.map((item) => (
              <span
                key={`item-${String(item.key)}`}
                ref={getItemMeasureRef(item.key)}
                className={clsx(e('measure-item'), hashId)}
              >
                {renderItemButton(item, true)}
              </span>
            ))}
            {measuredCollapsedItems.map((currentMeasuredItems, index) => {
              const count = index + 1;
              return (
                <span
                  key={`overflow-${count}`}
                  ref={getOverflowMeasureRef(count)}
                  className={clsx(e('measure-item'), hashId)}
                >
                  {renderOverflowTrigger(currentMeasuredItems, false, true)}
                </span>
              );
            })}
          </div>
        )}
      </div>,
    ),
  );
};

export default memo(ResponsiveButtonGroup);
