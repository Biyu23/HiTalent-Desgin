import { MinusOutlined } from '@ant-design/icons';
import { Drawer as AntdDrawer, Button, Flex } from 'antd';
import React, {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useLocale } from '../../configProvider/useLocale';
import { usePrefixCls } from '../../configProvider/usePrefixCls';
import { useMinimizeState } from '../../hooks';
import { isNullOrBlank, setRef } from '../../utils';
import MinimizedDock from '../_util/minimize/MinimizedDock';
import DrawerResizeHandle from './components/DrawerResizeHandle';
import { useDrawerPointerResize } from './hooks/useDrawerPointerResize';
import { useStyles } from './style';
import type {
  DrawerProps,
  DrawerRef,
  DrawerResizableConfig,
  ManualSizes,
} from './type';
import { getDrawerAxis, resolveMinimizableClosable } from './utils/placement';
import { DEFAULT_DRAWER_SIZE, resolveDrawerSize } from './utils/resize';

const Drawer = forwardRef<DrawerRef, DrawerProps>((props, ref) => {
  const {
    prefixCls: customPrefixCls,
    placement = 'right',
    size,
    defaultSize,
    minSize,
    maxSize,
    resizable = false,
    minimizable = false,
    minimized: controlledMinimized,
    minimizePosition = 'bottom-right',
    minimizeStack,
    onMinimizeChange,
    width,
    height,
    open,
    title,
    extra,
    closable,
    closeIcon,
    maskClosable,
    destroyOnClose,
    destroyOnHidden,
    onClose,
    rootClassName,
    classNames,
    styles,
    panelRef: forwardedPanelRef,
    drawerRender: userDrawerRender,
    rootStyle,
    ...restProps
  } = props;

  const prefixCls = usePrefixCls('drawer', customPrefixCls);
  const drawerLocale = useLocale('Drawer');
  const { styles: drawerStyles, cx } = useStyles(prefixCls);

  const panelRef = useRef<HTMLDivElement | null>(null);
  const [manualSizes, setManualSizes] = useState<ManualSizes>({});
  const { isMinimized, minimize, restore, reset } = useMinimizeState({
    minimized: controlledMinimized,
    onMinimizeChange,
  });

  const axis = getDrawerAxis(placement);
  const legacySize = axis === 'horizontal' ? width : height;
  const controlledSize = size !== undefined ? size : legacySize;
  const isControlled = controlledSize !== undefined;
  const currentSize = resolveDrawerSize(
    isControlled
      ? controlledSize
      : manualSizes[axis] ?? defaultSize ?? DEFAULT_DRAWER_SIZE,
  );
  const resizeConfig: DrawerResizableConfig =
    typeof resizable === 'object' ? resizable : {};

  const panelOpen = !!open && !isMinimized;
  const resizeEnabled = panelOpen && !!resizable;
  const previousOpenRef = useRef(open);

  useEffect(() => {
    const wasOpen = previousOpenRef.current;
    previousOpenRef.current = open;
    if (!open) {
      // 仅在实际关闭后退出最小化，关闭请求被拦截时保持当前状态。
      if (wasOpen && isMinimized) restore();
      reset();
    }
  }, [open, isMinimized, reset, restore]);

  const handleClose = useCallback(
    (event?: React.MouseEvent<Element> | React.KeyboardEvent<Element>) => {
      onClose?.(event);
    },
    [onClose],
  );

  useImperativeHandle(
    ref,
    () => ({
      get nativeElement() {
        return panelRef.current;
      },
      minimize,
      restore,
    }),
    [minimize, restore],
  );

  const handlePanelRef = useCallback(
    (node: HTMLDivElement | null) => {
      panelRef.current = node;
      setRef(forwardedPanelRef, node);
    },
    [forwardedPanelRef],
  );

  const handleSizeChange = useCallback(
    (nextSize: number) => {
      if (isControlled) return;
      setManualSizes((current) =>
        current[axis] === nextSize ? current : { ...current, [axis]: nextSize },
      );
    },
    [axis, isControlled],
  );

  const { isResizing, handlePointerDown } = useDrawerPointerResize({
    placement,
    minSize,
    maxSize,
    active: resizeEnabled,
    config: resizeConfig,
    currentSize,
    onSizeChange: handleSizeChange,
  });

  const { minimizedDockClassName, mergedClassNames } = useMemo(() => {
    const wrapperClass = cx(
      drawerStyles.wrapper,
      isResizing && drawerStyles.wrapperResizing,
      axis === 'horizontal'
        ? drawerStyles.wrapperHorizontal
        : drawerStyles.wrapperVertical,
    );

    const { minimizedDock, ...antdClassNames } = classNames ?? {};

    return {
      minimizedDockClassName: minimizedDock,
      mergedClassNames: {
        ...antdClassNames,
        wrapper: cx(antdClassNames.wrapper, wrapperClass),
      },
    };
  }, [axis, classNames, cx, drawerStyles, isResizing]);

  const { minimizedDockStyle, mergedStyles } = useMemo(() => {
    const resizingStyle: React.CSSProperties = isResizing
      ? { transition: 'none' }
      : {};

    const baseWrapperStyle: React.CSSProperties = {
      ...(axis === 'horizontal' ? { maxWidth: '100%' } : { maxHeight: '100%' }),
      ...resizingStyle,
    };

    const { minimizedDock, ...antdStyles } = styles ?? {};

    return {
      minimizedDockStyle: minimizedDock,
      mergedStyles: {
        ...antdStyles,
        wrapper: {
          ...baseWrapperStyle,
          ...antdStyles.wrapper,
        },
      },
    };
  }, [styles, axis, isResizing]);

  const mergedExtra = useMemo(
    () =>
      minimizable ? (
        <Flex gap={8} align="center" className={drawerStyles.headerActions}>
          {extra}
          <Button
            size="small"
            type="text"
            onClick={minimize}
            icon={<MinusOutlined />}
          />
        </Flex>
      ) : (
        extra
      ),
    [drawerStyles.headerActions, extra, minimizable, minimize],
  );

  const mergedClosable = minimizable
    ? resolveMinimizableClosable(closable, closeIcon)
    : closable;
  const mergedTitle =
    title !== null && minimizable && isNullOrBlank(title) ? (
      <span className={drawerStyles.emptyTitle} />
    ) : (
      title
    );

  const finalDrawerRender = useCallback(
    (drawerNode: React.ReactNode) => (
      <>
        {resizeEnabled && (
          <DrawerResizeHandle
            placement={placement}
            resizing={isResizing}
            onPointerDown={handlePointerDown}
          />
        )}
        {userDrawerRender ? userDrawerRender(drawerNode) : drawerNode}
      </>
    ),
    [handlePointerDown, isResizing, placement, resizeEnabled, userDrawerRender],
  );

  return (
    <>
      <AntdDrawer
        {...restProps}
        open={panelOpen}
        placement={placement}
        width={axis === 'horizontal' ? currentSize : undefined}
        height={axis === 'vertical' ? currentSize : undefined}
        title={mergedTitle}
        extra={mergedExtra}
        closable={mergedClosable}
        closeIcon={closeIcon}
        maskClosable={maskClosable}
        destroyOnHidden={
          open && isMinimized ? false : destroyOnHidden ?? destroyOnClose
        }
        onClose={handleClose}
        rootClassName={cx(prefixCls, drawerStyles.root, rootClassName)}
        rootStyle={rootStyle}
        classNames={mergedClassNames}
        styles={mergedStyles}
        panelRef={handlePanelRef}
        drawerRender={finalDrawerRender}
      />
      <MinimizedDock
        open={open}
        minimized={isMinimized}
        title={title}
        position={minimizePosition}
        className={minimizedDockClassName}
        style={minimizedDockStyle}
        stack={minimizeStack}
        locale={drawerLocale}
        onRestore={restore}
        onClose={handleClose}
      />
    </>
  );
});

export default memo(Drawer);
