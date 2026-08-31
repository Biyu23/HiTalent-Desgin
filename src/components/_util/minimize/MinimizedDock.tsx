import React, {
  memo,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { usePrefixCls } from '../../../configProvider/usePrefixCls';
import DockStack from './components/DockStack';
import { acquireDockContainer } from './dockRegistry';
import useDockId from './hooks/useDockId';
import useDockItems from './hooks/useDockItems';
import { dockStore } from './store/dockStore';
import { useContainerStyles } from './style';
import type { DockItem, MinimizedDockProps } from './type';

const MinimizedDockInner = memo<MinimizedDockProps>(
  ({
    id: propId,
    title,
    position: dockPosition,
    className,
    style,
    stack,
    locale,
    onRestore,
    onClose,
  }) => {
    const dockPrefixCls = usePrefixCls('minimize');
    const { styles: containerStyles, cx } = useContainerStyles();
    const dockId = useDockId(propId);
    const items = useDockItems(dockPosition);
    const [scrollWrapperEl, setScrollWrapperEl] = useState<HTMLElement | null>(
      null,
    );
    const positionClassName = {
      'top-left': containerStyles.topLeft,
      'top-right': containerStyles.topRight,
      top: containerStyles.top,
      'bottom-left': containerStyles.bottomLeft,
      'bottom-right': containerStyles.bottomRight,
      bottom: containerStyles.bottom,
      left: containerStyles.left,
      right: containerStyles.right,
    }[dockPosition];
    const scrollWrapperClassName = cx(
      containerStyles.scrollWrapper,
      positionClassName,
    );

    const item = useMemo<DockItem>(
      () => ({
        id: dockId,
        title,
        position: dockPosition,
        className,
        style,
        stack,
        locale,
        onRestore,
        onClose,
      }),
      [
        className,
        dockId,
        dockPosition,
        locale,
        onClose,
        onRestore,
        stack,
        style,
        title,
      ],
    );
    const itemRef = useRef(item);
    itemRef.current = item;
    useEffect(
      () => dockStore.register(itemRef.current),
      [dockId, dockPosition],
    );

    useEffect(() => {
      dockStore.update(item);
    }, [item]);

    useLayoutEffect(() => {
      const entry = acquireDockContainer({
        dockPrefixCls,
        containerClassName: containerStyles.container,
        scrollWrapperClassName,
        position: dockPosition,
      });
      setScrollWrapperEl(entry.scrollWrapper);
      return entry.release;
    }, [
      containerStyles.container,
      dockPosition,
      dockPrefixCls,
      scrollWrapperClassName,
    ]);

    // 每个位置由最早注册的承载容器
    const isLeader = items.length > 0 && items[0].id === dockId;
    if (!scrollWrapperEl || !isLeader) return null;

    return createPortal(
      <DockStack
        items={items}
        position={dockPosition}
        dockPrefixCls={dockPrefixCls}
      />,
      scrollWrapperEl,
    );
  },
);

const MinimizedDock = memo<MinimizedDockProps>((props) => {
  if (!props.open || !props.minimized) return null;
  return <MinimizedDockInner {...props} />;
});

export default MinimizedDock;
