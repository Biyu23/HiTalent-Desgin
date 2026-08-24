import { MinusOutlined } from '@ant-design/icons';
import { Drawer as AntdDrawer, Button, Flex } from 'antd';
import clsx from 'clsx';
import React, {
  forwardRef,
  memo,
  useCallback,
  useContext,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ConfigContext } from '../../configProvider/context';
import { useLocale } from '../../configProvider/useLocale';
import { usePrefixCls } from '../../configProvider/usePrefixCls';
import { isNullOrBlank, setRef } from '../../util';
import MinimizedDock from '../_util/minimize/MinimizedDock';
import { useMinimizeState } from '../_util/minimize/useMinimizeState';
import {
  ComponentNamespaceProvider,
  useResolvedComponentNamespace,
} from '../_util/namespace';
import DrawerResizeHandle from './components/DrawerResizeHandle';
import { useDrawerPointerResize } from './hooks/useDrawerPointerResize';
import { useStyle } from './style';
import type { DrawerProps, DrawerRef, DrawerResizableConfig } from './type';
import { getDrawerAxis } from './utils/placement';
import { DEFAULT_DRAWER_SIZE, resolveDrawerSize } from './utils/resize';

interface ManualSizes {
  horizontal?: number;
  vertical?: number;
}

/**
 * 解析抽屉最小化模式下的 closable 配置，保证关闭按钮靠右对齐 (placement: 'end')
 */
const resolveMinimizableClosable = (
  closable: DrawerProps['closable'],
  closeIcon: DrawerProps['closeIcon'],
): DrawerProps['closable'] => {
  if (closable === false || closeIcon === false || closeIcon === null) {
    return false;
  }
  if (typeof closable === 'object') {
    return { ...closable, placement: 'end' };
  }
  return { placement: 'end' };
};

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
    onMinimizeChange,
    width,
    height,
    open,
    title,
    extra,
    closable,
    closeIcon,
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
  const { antdPrefixCls } = useContext(ConfigContext);
  const drawerLocale = useLocale('Drawer');
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [manualSizes, setManualSizes] = useState<ManualSizes>({});
  const { isMinimized, minimize, restore, reset } = useMinimizeState({
    minimized: controlledMinimized,
    onMinimizeChange,
  });
  const { wrapSSR, hashId } = useStyle(prefixCls, antdPrefixCls);
  const namespace = useResolvedComponentNamespace(
    'drawer',
    customPrefixCls,
    hashId,
  );
  const { element: e, elementModifier: em } = namespace;

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

  const handleClose = useCallback(
    (event?: React.MouseEvent<Element> | React.KeyboardEvent<Element>) => {
      if (isMinimized) restore();
      reset();
      onClose?.(event);
    },
    [isMinimized, onClose, reset, restore],
  );

  useImperativeHandle(ref, () => ({ minimize, restore }), [minimize, restore]);

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
    active: !!open && !isMinimized && !!resizable,
    config: resizeConfig,
    panelRef,
    currentSize,
    onSizeChange: handleSizeChange,
  });

  const draggerClassName = classNames?.dragger;
  const minimizeButtonClassName = classNames?.minimizeButton;
  const minimizedDockClassName = classNames?.minimizedDock;
  const draggerStyle = styles?.dragger;
  const minimizedDockStyle = styles?.minimizedDock;

  const mergedClassNames = useMemo(() => {
    const wrapperClass = clsx(e('wrapper'), hashId, {
      [em('wrapper', 'resizing')]: isResizing,
      [em('wrapper', 'horizontal')]: axis === 'horizontal',
      [em('wrapper', 'vertical')]: axis === 'vertical',
    });

    if (!classNames) {
      return {
        wrapper: wrapperClass,
      };
    }

    const antdClassNames = { ...classNames } as Record<
      string,
      string | undefined
    >;
    delete antdClassNames.dragger;
    delete antdClassNames.minimizeButton;
    delete antdClassNames.minimizedDock;

    return {
      ...antdClassNames,
      wrapper: clsx(classNames.wrapper, wrapperClass),
    };
  }, [classNames, axis, e, em, hashId, isResizing]);

  const mergedStyles = useMemo(() => {
    const resizingStyle: React.CSSProperties = isResizing
      ? { transition: 'none' }
      : {};

    const baseWrapperStyle: React.CSSProperties = {
      ...(axis === 'horizontal' ? { maxWidth: '100%' } : { maxHeight: '100%' }),
      ...resizingStyle,
    };

    if (!styles) {
      return {
        wrapper: baseWrapperStyle,
      };
    }

    const antdStyles = { ...styles } as Record<
      string,
      React.CSSProperties | undefined
    >;
    delete antdStyles.dragger;
    delete antdStyles.minimizedDock;

    return {
      ...antdStyles,
      wrapper: {
        ...baseWrapperStyle,
        ...styles.wrapper,
      },
    };
  }, [styles, axis, isResizing]);

  const mergedExtra = useMemo(
    () =>
      minimizable ? (
        <Flex
          gap={8}
          align="center"
          className={clsx(e('header-actions'), hashId)}
        >
          {extra}
          <Button
            size="small"
            type="text"
            className={minimizeButtonClassName}
            onClick={minimize}
            icon={<MinusOutlined />}
            aria-label={drawerLocale.minimize}
          />
        </Flex>
      ) : (
        extra
      ),
    [
      drawerLocale.minimize,
      e,
      extra,
      hashId,
      minimizable,
      minimize,
      minimizeButtonClassName,
    ],
  );

  const mergedClosable = useMemo(
    () =>
      minimizable ? resolveMinimizableClosable(closable, closeIcon) : closable,
    [closable, closeIcon, minimizable],
  );

  const mergedTitle = useMemo(() => {
    if (title === null) return null;
    if (minimizable && isNullOrBlank(title)) {
      return <span className={clsx(e('empty-title'), hashId)} aria-hidden />;
    }
    return title;
  }, [e, hashId, minimizable, title]);

  const finalDrawerRender = useCallback(
    (drawerNode: React.ReactNode) => (
      <>
        {!!resizable && !!open && !isMinimized && (
          <DrawerResizeHandle
            prefixCls={prefixCls}
            hashId={hashId}
            placement={placement}
            className={draggerClassName}
            style={draggerStyle}
            resizing={isResizing}
            onPointerDown={handlePointerDown}
          />
        )}
        {userDrawerRender ? userDrawerRender(drawerNode) : drawerNode}
      </>
    ),
    [
      draggerClassName,
      draggerStyle,
      handlePointerDown,
      hashId,
      isMinimized,
      isResizing,
      open,
      placement,
      prefixCls,
      resizable,
      userDrawerRender,
    ],
  );

  return wrapSSR(
    <ComponentNamespaceProvider value={namespace}>
      <AntdDrawer
        {...restProps}
        open={open && !isMinimized}
        placement={placement}
        width={axis === 'horizontal' ? currentSize : undefined}
        height={axis === 'vertical' ? currentSize : undefined}
        title={mergedTitle}
        extra={mergedExtra}
        closable={mergedClosable}
        closeIcon={closeIcon}
        destroyOnClose={isMinimized ? false : destroyOnClose}
        destroyOnHidden={isMinimized ? false : destroyOnHidden}
        onClose={handleClose}
        rootClassName={clsx(prefixCls, hashId, rootClassName)}
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
        locale={drawerLocale}
        onRestore={restore}
        onClose={handleClose}
      />
    </ComponentNamespaceProvider>,
  );
});

export default memo(Drawer);
