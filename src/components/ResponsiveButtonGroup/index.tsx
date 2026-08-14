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
import { withNativeProps } from '../../util';
import Button from '../Button';
import OverflowMenu from './components/OverflowMenu';
import { useItemMeasurements } from './hooks/useItemMeasurements';
import './index.less';
import type {
  ResponsiveButtonGroupClickInfo,
  ResponsiveButtonGroupItem,
  ResponsiveButtonGroupItemSource,
  ResponsiveButtonGroupOverflowRenderInfo,
  ResponsiveButtonGroupProps,
} from './type';
import {
  getCollapseOrder,
  getResponsiveLayout,
  normalizeGap,
  normalizeMinVisibleCount,
} from './utils/layout';

function keysEqual(left: readonly React.Key[], right: readonly React.Key[]) {
  return (
    left.length === right.length &&
    left.every((key, index) => key === right[index])
  );
}

function isThenable(value: unknown): value is PromiseLike<unknown> {
  return (
    (typeof value === 'object' || typeof value === 'function') &&
    value !== null &&
    'then' in value &&
    typeof (value as PromiseLike<unknown>).then === 'function'
  );
}

const MEASUREMENT_IGNORED_PROPS = new Set([
  'id',
  'name',
  'form',
  'htmlType',
  'href',
  'target',
  'download',
  'tabIndex',
  'tooltip',
]);

function getMeasurementButtonProps<Props extends object>(
  buttonProps?: Props,
): Props | undefined {
  if (!buttonProps) return undefined;

  const measurementProps: Record<string, unknown> = {};
  Object.entries(buttonProps).forEach(([key, value]) => {
    if (MEASUREMENT_IGNORED_PROPS.has(key) || /^on[A-Z]/.test(key)) {
      return;
    }
    measurementProps[key] = value;
  });

  return measurementProps as Props;
}

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
  const [loadingKeys, setLoadingKeys] = useState<Set<React.Key>>(new Set());
  const loadingKeysRef = useRef<Set<React.Key>>(new Set());
  const throttleTimersRef = useRef(
    new Map<React.Key, ReturnType<typeof setTimeout>>(),
  );
  const operationIdsRef = useRef(new Map<React.Key, number>());
  const nextOperationIdRef = useRef(0);
  const [innerOpen, setInnerOpen] = useState(false);
  const visibleContainerRef = useRef<HTMLDivElement | null>(null);
  const itemMeasureCallbacksRef = useRef(
    new Map<React.Key, (node: HTMLElement | null) => void>(),
  );
  const overflowMeasureCallbacksRef = useRef(
    new Map<number, (node: HTMLElement | null) => void>(),
  );
  const mountedRef = useRef(true);
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
    setItemMeasureRef,
    setOverflowMeasureRef,
  } = useItemMeasurements();

  const getItemMeasureRef = useCallback(
    (key: React.Key) => {
      const cached = itemMeasureCallbacksRef.current.get(key);
      if (cached) return cached;

      const callback = (node: HTMLElement | null) =>
        setItemMeasureRef(key, node);
      itemMeasureCallbacksRef.current.set(key, callback);
      return callback;
    },
    [setItemMeasureRef],
  );
  const getOverflowMeasureRef = useCallback(
    (count: number) => {
      const cached = overflowMeasureCallbacksRef.current.get(count);
      if (cached) return cached;

      const callback = (node: HTMLElement | null) =>
        setOverflowMeasureRef(count, node);
      overflowMeasureCallbacksRef.current.set(count, callback);
      return callback;
    },
    [setOverflowMeasureRef],
  );

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
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      throttleTimersRef.current.forEach((timer) => clearTimeout(timer));
      throttleTimersRef.current.clear();
    };
  }, []);

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
    const currentKeys = new Set(items.map((item) => item.key));
    const nextLoadingKeys = new Set(
      Array.from(loadingKeysRef.current).filter((key) => currentKeys.has(key)),
    );
    if (nextLoadingKeys.size !== loadingKeysRef.current.size) {
      loadingKeysRef.current = nextLoadingKeys;
      setLoadingKeys(nextLoadingKeys);
    }

    throttleTimersRef.current.forEach((timer, key) => {
      if (!currentKeys.has(key)) {
        clearTimeout(timer);
        throttleTimersRef.current.delete(key);
      }
    });
    operationIdsRef.current.forEach((_, key) => {
      if (!currentKeys.has(key)) operationIdsRef.current.delete(key);
    });
    itemMeasureCallbacksRef.current.forEach((_, key) => {
      if (!currentKeys.has(key)) itemMeasureCallbacksRef.current.delete(key);
    });
    overflowMeasureCallbacksRef.current.forEach((_, count) => {
      if (count > maxCollapsedCount) {
        overflowMeasureCallbacksRef.current.delete(count);
      }
    });
  }, [items, maxCollapsedCount]);

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
      keysEqual(previous.visibleKeys, layout.visibleKeys) &&
      keysEqual(previous.collapsedKeys, layout.collapsedKeys)
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

  const handleItemClick = useCallback(
    (
      item: ResponsiveButtonGroupItem,
      source: ResponsiveButtonGroupItemSource,
      event: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>,
    ) => {
      if (
        item.disabled ||
        item.loading ||
        loadingKeysRef.current.has(item.key) ||
        throttleTimersRef.current.has(item.key)
      ) {
        return;
      }

      const throttle = item.buttonProps?.throttle ?? buttonProps?.throttle ?? 0;
      if (Number.isFinite(throttle) && throttle > 0) {
        const timer = setTimeout(() => {
          throttleTimersRef.current.delete(item.key);
        }, throttle);
        throttleTimersRef.current.set(item.key, timer);
      }

      const info: ResponsiveButtonGroupClickInfo = {
        key: item.key,
        item,
        source,
        event,
      };
      const results: unknown[] = [];
      let itemCallbackSucceeded = true;

      try {
        if (item.onClick) results.push(item.onClick(info));
      } catch (error) {
        itemCallbackSucceeded = false;
        results.push(Promise.reject(error));
      }

      if (itemCallbackSucceeded && onItemClick) {
        try {
          results.push(onItemClick(info));
        } catch (error) {
          results.push(Promise.reject(error));
        }
      }

      const promises = results.filter(isThenable);
      if (promises.length === 0) return;

      const operationId = nextOperationIdRef.current + 1;
      nextOperationIdRef.current = operationId;
      operationIdsRef.current.set(item.key, operationId);

      const nextLoadingKeys = new Set(loadingKeysRef.current);
      nextLoadingKeys.add(item.key);
      loadingKeysRef.current = nextLoadingKeys;
      setLoadingKeys(nextLoadingKeys);

      return Promise.all(
        promises.map((promise) =>
          Promise.resolve(promise).then(
            () => ({ rejected: false as const, error: undefined }),
            (error: unknown) => ({ rejected: true as const, error }),
          ),
        ),
      ).then((results) => {
        if (
          mountedRef.current &&
          operationIdsRef.current.get(item.key) === operationId
        ) {
          operationIdsRef.current.delete(item.key);
          const next = new Set(loadingKeysRef.current);
          next.delete(item.key);
          loadingKeysRef.current = next;
          setLoadingKeys(next);
        }

        const rejectedResult = results.find((result) => result.rejected);
        if (rejectedResult?.rejected) throw rejectedResult.error;
      });
    },
    [buttonProps?.throttle, onItemClick],
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
              : (event) => handleItemClick(item, 'button', event)
          }
        >
          {item.label}
        </Button>
      );
    },
    [
      buttonProps,
      handleItemClick,
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
        onItemClick={(item, event) => handleItemClick(item, 'overflow', event)}
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
