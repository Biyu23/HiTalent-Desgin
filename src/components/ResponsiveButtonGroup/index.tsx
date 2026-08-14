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
import { usePrefixCls } from '../../configProvider/usePrefixCls';
import { areArraysEqual, withNativeProps } from '../../util';
import Button from '../Button';
import OverflowMenu from './components/OverflowMenu';
import { useItemAction } from './hooks/useItemAction';
import { useItemMeasurements } from './hooks/useItemMeasurements';
import './index.less';
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
  const prefixCls = usePrefixCls('responsive-button-group');
  const locale = useLocale('ResponsiveButtonGroup');
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
  const visibleKeySet = useMemo(
    () => new Set(layout.visibleKeys),
    [layout.visibleKeys],
  );
  const collapsedKeySet = useMemo(
    () => new Set(layout.collapsedKeys),
    [layout.collapsedKeys],
  );
  const visibleItems = useMemo(
    () => items.filter((item) => visibleKeySet.has(item.key)),
    [items, visibleKeySet],
  );
  const collapsedItems = useMemo(
    () => items.filter((item) => collapsedKeySet.has(item.key)),
    [items, collapsedKeySet],
  );
  const maxCollapsedCount = items.length - minVisibleCount;
  const measuredCollapsedItems = useMemo(() => {
    const collapseOrder = getCollapseOrder(items, direction);

    return Array.from({ length: maxCollapsedCount }, (_, index) => {
      const collapsedIndexes = new Set(collapseOrder.slice(0, index + 1));
      return items.filter((_, itemIndex) => collapsedIndexes.has(itemIndex));
    });
  }, [items, maxCollapsedCount, direction]);
  const measurementReady =
    mode !== 'responsive' ||
    (containerWidth !== null &&
      items.every((item) => itemWidths.has(item.key)) &&
      Array.from({ length: maxCollapsedCount }, (_, index) => index + 1).every(
        (count) => overflowWidths.has(count),
      ));

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    const keys = new Set<string>();
    items.forEach((item) => {
      const normalizedKey = String(item.key);
      if (keys.has(normalizedKey)) {
        console.warn(
          `[ResponsiveButtonGroup] item key “${String(
            item.key,
          )}” 重复，key 必须唯一。`,
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
    overflowDropdownProps?.onOpenChange?.(false, { source: 'trigger' });
  }, [
    collapsedItems.length,
    open,
    overflowDropdownProps?.open,
    overflowDropdownProps?.onOpenChange,
  ]);

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
      if (overflowDropdownProps?.open === undefined) setInnerOpen(nextOpen);
      overflowDropdownProps?.onOpenChange?.(nextOpen, info);
    },
    [overflowDropdownProps],
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
            `${prefixCls}-overflow-trigger`,
            currentOverflowButtonProps?.className,
          )}
          tabIndex={measuring ? -1 : overflowButtonProps?.tabIndex}
          icon={overflowIcon}
          aria-haspopup="menu"
          aria-expanded={currentOpen}
          aria-label={overflowButtonProps?.['aria-label'] ?? ariaLabel}
        >
          <span className={`${prefixCls}-overflow-label`}>{overflowText}</span>
          {showOverflowCount && (
            <span className={`${prefixCls}-overflow-count`}>{count}</span>
          )}
          <DownOutlined className={`${prefixCls}-overflow-arrow`} />
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
        <span className={`${prefixCls}-overflow-trigger`}>{content}</span>
      );
    },
    [
      locale,
      measurementOverflowButtonProps,
      overflowButtonProps,
      overflowIcon,
      overflowText,
      prefixCls,
      renderOverflowButton,
      showOverflowCount,
    ],
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
        onItemClick={(item, event) =>
          executeItemAction(item, 'overflow', event)
        }
      >
        {renderOverflowTrigger(collapsedItems, open)}
      </OverflowMenu>
    ) : null;

  return withNativeProps(
    props,
    <div
      ref={setContainerRef}
      className={prefixCls}
      role="group"
      dir={direction}
    >
      <div
        ref={visibleContainerRef}
        className={`${prefixCls}-visible`}
        style={{ gap }}
      >
        {visibleItems.map((item) => (
          <React.Fragment key={item.key}>
            {renderItemButton(item)}
          </React.Fragment>
        ))}
        {overflowNode}
      </div>

      {mode === 'responsive' && items.length > 0 && (
        <div className={`${prefixCls}-measure`} aria-hidden="true">
          {items.map((item) => (
            <span
              key={`item-${String(item.key)}`}
              ref={getItemMeasureRef(item.key)}
              className={`${prefixCls}-measure-item`}
            >
              {renderItemButton(item, true)}
            </span>
          ))}
          {Array.from({ length: maxCollapsedCount }, (_, index) => {
            const count = index + 1;
            const currentMeasuredItems = measuredCollapsedItems[index];
            return (
              <span
                key={`overflow-${count}`}
                ref={getOverflowMeasureRef(count)}
                className={`${prefixCls}-measure-item`}
              >
                {renderOverflowTrigger(currentMeasuredItems, open, true)}
              </span>
            );
          })}
        </div>
      )}
    </div>,
  );
};

export default memo(ResponsiveButtonGroup);
