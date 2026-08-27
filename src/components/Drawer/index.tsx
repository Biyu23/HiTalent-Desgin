import { MinusOutlined } from '@ant-design/icons';
import { Drawer as AntdDrawer, Button, Flex } from 'antd';
import React, {
  forwardRef,
  memo,
  useCallback,
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

  const panelRef = useRef<HTMLDivElement | null>(null);
  const [manualSizes, setManualSizes] = useState<ManualSizes>({});
  const { isMinimized, minimize, restore, reset } = useMinimizeState({
    minimized: controlledMinimized,
    onMinimizeChange,
  });
  const { styles: drawerStyles, cx } = useStyles(prefixCls);

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
    const wrapperClass = cx(
      drawerStyles.wrapper,
      isResizing && drawerStyles.wrapperResizing,
      axis === 'horizontal'
        ? drawerStyles.wrapperHorizontal
        : drawerStyles.wrapperVertical,
    );

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
      wrapper: cx(classNames.wrapper, wrapperClass),
    };
  }, [axis, classNames, cx, drawerStyles, isResizing]);

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
        <Flex gap={8} align="center" className={drawerStyles.headerActions}>
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
      drawerStyles.headerActions,
      extra,
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
      return <span className={drawerStyles.emptyTitle} aria-hidden />;
    }
    return title;
  }, [drawerStyles.emptyTitle, minimizable, title]);

  const finalDrawerRender = useCallback(
    (drawerNode: React.ReactNode) => (
      <>
        {!!resizable && !!open && !isMinimized && (
          <DrawerResizeHandle
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
      isMinimized,
      isResizing,
      open,
      placement,
      resizable,
      userDrawerRender,
    ],
  );

  return (
    <>
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
        maskClosable={maskClosable}
        destroyOnClose={isMinimized ? false : destroyOnClose}
        destroyOnHidden={isMinimized ? false : destroyOnHidden}
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
        locale={drawerLocale}
        onRestore={restore}
        onClose={handleClose}
      />
    </>
  );
});

export default memo(Drawer);
