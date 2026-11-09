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
import type { DrawerAxis, DrawerProps, DrawerRef } from './type';
import { getDrawerAxis } from './utils/placement';
import { DEFAULT_DRAWER_SIZE, LARGE_DRAWER_SIZE } from './utils/resize';

const Drawer = forwardRef<DrawerRef, DrawerProps>((props, ref) => {
  const {
    prefixCls: customPrefixCls,
    placement = 'right',
    size,
    defaultSize = DEFAULT_DRAWER_SIZE,
    minSize,
    maxSize,
    resizable = false,
    minimizable = false,
    minimized: controlledMinimized,
    minimizePosition = 'bottom-right',
    minimizeStack,
    onMinimizeChange,
    open,
    title,
    extra,
    closable,
    closeIcon,
    destroyOnHidden,
    onClose,
    rootClassName,
    classNames,
    styles,
    panelRef: forwardedPanelRef,
    drawerRender: userDrawerRender,
    ...restProps
  } = props;

  const prefixCls = usePrefixCls('drawer', customPrefixCls);
  const drawerLocale = useLocale('Drawer');
  const { styles: drawerStyles, cx } = useStyles();

  const panelRef = useRef<HTMLDivElement | null>(null);
  const [manualSizes, setManualSizes] = useState<
    Partial<Record<DrawerAxis, number>>
  >({});
  const { isMinimized, minimize, restore, reset } = useMinimizeState({
    minimized: controlledMinimized,
    onMinimizeChange,
  });

  const axis = getDrawerAxis(placement);
  const isControlled = size !== undefined;
  const requestedSize = size ?? manualSizes[axis] ?? defaultSize;
  const currentSize =
    requestedSize === 'default'
      ? DEFAULT_DRAWER_SIZE
      : requestedSize === 'large'
      ? LARGE_DRAWER_SIZE
      : requestedSize;

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
    config: typeof resizable === 'object' ? resizable : undefined,
    currentSize,
    onSizeChange: handleSizeChange,
  });

  const { minimizedDockClassName, mergedClassNames } = useMemo(() => {
    const { minimizedDock, ...antdClassNames } = classNames ?? {};

    return {
      minimizedDockClassName: minimizedDock,
      mergedClassNames: {
        ...antdClassNames,
        wrapper: cx(
          antdClassNames.wrapper,
          isResizing && drawerStyles.wrapperResizing,
          axis === 'horizontal'
            ? drawerStyles.wrapperHorizontal
            : drawerStyles.wrapperVertical,
        ),
      },
    };
  }, [axis, classNames, cx, drawerStyles, isResizing]);

  const { minimizedDockStyle, mergedStyles } = useMemo(() => {
    const { minimizedDock, ...antdStyles } = styles ?? {};

    return {
      minimizedDockStyle: minimizedDock,
      mergedStyles: {
        ...antdStyles,
        wrapper: {
          [axis === 'horizontal' ? 'maxWidth' : 'maxHeight']: '100%',
          ...antdStyles.wrapper,
        },
      },
    };
  }, [styles, axis]);

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

  let mergedClosable = closable;
  if (minimizable) {
    mergedClosable =
      closable === false || closeIcon === false || closeIcon === null
        ? false
        : {
            ...(typeof closable === 'object' ? closable : {}),
            placement: 'end',
          };
  }
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
        destroyOnHidden={open && isMinimized ? false : destroyOnHidden}
        onClose={onClose}
        rootClassName={cx(prefixCls, rootClassName)}
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
        onClose={onClose}
      />
    </>
  );
});

export default memo(Drawer);
