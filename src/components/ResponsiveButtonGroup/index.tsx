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
  calculateLayout,
  normalizeGap,
  normalizeMinVisibleCount,
} from './utils/layout';

interface OpenChangeInfo {
  source?: 'trigger' | 'menu';
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
  const previousKeysRef = useRef<{
    visible: string[];
    collapsed: string[];
  }>();

  const isResponsive = mode === 'responsive';
  const {
    containerWidth,
    itemWidths,
    overflowWidth,
    setContainerRef,
    getItemRef,
    setOverflowRef,
  } = useResponsiveMeasurements(isResponsive);

  // 合并内部 container ref 与外部 forwarded ref
  const setMergedRef = useCallback(
    (node: HTMLDivElement | null) => {
      setContainerRef(node);
      setRef(ref, node);
    },
    [ref, setContainerRef],
  );

  const open = overflowDropdownProps?.open ?? innerOpen;

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

  /**
   * 响应式测量就绪标志：
   * 1. 非 responsive 模式时无需等待测量。
   * 2. responsive 模式下：
   *    - 容器宽度已获取
   *    - 所有平铺按钮在离屏区均已测量出宽度
   *    - 若产生了折叠项，还需要“更多”按钮的宽度也已就绪
   * 只有当上述条件齐备后，排版结果才稳定，方可向外触发 onVisibleChange，避免初始化过程中的频闪通知。
   */
  const measurementReady =
    !isResponsive ||
    (containerWidth !== null &&
      items.every((item) => itemWidths.has(item.key)) &&
      (layout.collapsedItems.length === 0 || overflowWidth !== null));

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
    if (layout.collapsedItems.length === 0 && open) {
      if (overflowDropdownProps?.open === undefined) setInnerOpen(false);
      overflowDropdownProps?.onOpenChange?.(false, { source: 'trigger' });
    }
  }, [layout.collapsedItems.length, open, overflowDropdownProps]);

  /**
   * 统一执行操作项点击事件：
   * 1. 拦截 disabled / loading 状态项
   * 2. 按顺序执行单项的 item.onClick 与全局的 onItemClick
   * 3. 若返回 Promise，由 useKeyedActionRunner 接管异步 Loading 状态，并在 throttle 周期内防抖节流
   */
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
      return run(item.key, action, [info], item.buttonProps?.throttle);
    },
    [onItemClick, run],
  );

  /**
   * 渲染单个平铺按钮：
   * @param item 按钮配置项
   * @param measuring 是否处于离屏隐藏测量区（measuring 为 true 时剥离事件、Tooltip 与 tabIndex 以保证纯净测宽）
   */
  const renderItemButton = useCallback(
    (item: ResponsiveButtonGroupItem, measuring = false) => (
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
    [execute, onActionError, pendingKeys],
  );

  /**
   * 渲染“更多”触发器按钮：
   * @param collapsed 当前被折叠收起的所有项
   * @param measuring 是否处于离屏隐藏测量区
   */
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
      buttonGroupStyles.overflowArrow,
      buttonGroupStyles.overflowCount,
      buttonGroupStyles.overflowLabel,
      buttonGroupStyles.overflowTrigger,
      classNames?.overflowTrigger,
      cx,
      locale.more,
      open,
      overflowButtonProps,
      overflowIcon,
      overflowLabel,
      renderOverflowButton,
      showOverflowCount,
      styles?.overflowTrigger,
    ],
  );

  /**
   * 构造折叠下拉菜单的 Menu 项：
   * - 支持自定义渲染 renderCollapsedItem
   * - 当配置了 tooltip 时包裹 Tooltip 组件（设置 overlayStyle pointerEvents: 'none' 保证点击穿透）
   */
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
    [
      buttonGroupStyles.menuItemContent,
      buttonGroupStyles.menuItemIcon,
      buttonGroupStyles.menuItemLabel,
      classNames?.menuItem,
      cx,
      layout.collapsedItems,
      pendingKeys,
    ],
  );

  const itemMap = useMemo(
    () => new Map(layout.collapsedItems.map((item) => [item.key, item])),
    [layout.collapsedItems],
  );

  /**
   * 点击下拉菜单项：
   * - 若为异步操作，保持下拉菜单处于 open 状态并展示 spin Loading
   * - 异步执行完成或出错后，自动收起下拉面板
   */
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

  /**
   * 处理 Dropdown 展开与收起变化：
   * 在点击菜单项触发异步操作期间，阻断菜单的立即收起行为，等待 Promise resolve
   */
  const handleOpenChange: NonNullable<DropdownProps['onOpenChange']> = (
    nextOpen,
    info,
  ) => {
    const openInfo = info as OpenChangeInfo | undefined;
    // 异步操作期间阻止点击菜单项立即关闭
    if (!nextOpen && openInfo?.source === 'menu') return;

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

  /**
   * 测量溢出按钮时使用的候选折叠项：
   * - 若当前已有折叠项，使用实际折叠项测量以反映当前真实折叠数字（如 "更多 3"）
   * - 若尚未产生折叠项，使用首个项作为占位，预先测出带数字徽标时的按钮宽度
   */
  const overflowMeasureItems = useMemo(
    () =>
      layout.collapsedItems.length > 0
        ? layout.collapsedItems
        : items.length > 0
        ? items.slice(0, 1)
        : [],
    [items, layout.collapsedItems],
  );

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
      dir={direction}
    >
      <div
        className={cx(buttonGroupStyles.visible, classNames?.visible)}
        style={{ ...styles?.visible, gap }}
      >
        {layout.visibleItems.map((item) => renderItemButton(item))}
        {overflowNode}
      </div>
      {isResponsive && items.length > 0 && (
        <div className={buttonGroupStyles.measure}>
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
            {renderOverflowTrigger(overflowMeasureItems, true)}
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

export default ResponsiveButtonGroup;

export type * from './type';
