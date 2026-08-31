import { theme } from 'antd';
import React, { memo, useLayoutEffect, useMemo, useRef } from 'react';
import useDragBounds from '../../../../hooks/useDragBounds';
import DraggablePointerContainer from '../../DraggablePointerContainer';
import useDockDragOffset from '../hooks/useDockDragOffset';
import useDockExpansion from '../hooks/useDockExpansion';
import useDockMetrics from '../hooks/useDockMetrics';
import useTransformScroll from '../hooks/useTransformScroll';
import useViewportHeight from '../hooks/useViewportHeight';
import { useStackStyles } from '../style';
import type { DockItem, MinimizePosition } from '../type';
import {
  getCollapsedStackScale,
  getStackBadgeCount,
  NOTIFICATION_STACK_LAYERS,
  NOTIFICATION_STACK_OFFSET,
  shouldCollapseStack,
} from '../utils/layout';
import { getStackTransformOrigin, isBottomPosition } from '../utils/position';
import DockCard from './DockCard';

export interface DockStackProps {
  items: DockItem[];
  position: MinimizePosition;
  dockPrefixCls: string;
}

const DEFAULT_CARD_HEIGHT = 48;

export const DockStack = memo<DockStackProps>(
  ({ items, position, dockPrefixCls }) => {
    const { token } = theme.useToken();
    const { styles, cx } = useStackStyles();
    const { dragRef, bounds, onStart, updateBounds } = useDragBounds();
    const [dragOffset, setDragOffset] = useDockDragOffset(position);
    const dragOffsetRef = useRef(dragOffset);
    dragOffsetRef.current = dragOffset;

    const viewportRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const viewportHeight = useViewportHeight();

    const displayItems = useMemo(() => [...items].reverse(), [items]);
    const itemIds = useMemo(
      () => displayItems.map((item) => item.id),
      [displayItems],
    );
    const itemRevision = useMemo(() => itemIds.join('|'), [itemIds]);
    const totalCount = displayItems.length;
    const latestItem = displayItems[0];
    const collapsible = shouldCollapseStack(totalCount, latestItem?.stack);
    const expansion = useDockExpansion({
      rootRef: dragRef,
      collapsible,
      revision: itemRevision,
    });
    const expanded = expansion.expanded;
    const anchorBottom = isBottomPosition(position);
    const transformOrigin = getStackTransformOrigin(position);
    const metrics = useDockMetrics({
      contentRef,
      itemIds,
      revision: itemRevision,
      fallbackHeight: DEFAULT_CARD_HEIGHT,
    });

    const maxAllowedHeight = Math.max(
      metrics.latestHeight,
      viewportHeight - token.sizeLG * 2,
    );
    const isScrollable = expanded && metrics.contentHeight > maxAllowedHeight;
    const containerHeight = expanded
      ? Math.min(metrics.contentHeight, maxAllowedHeight)
      : metrics.latestHeight;
    const maxScroll = Math.max(0, metrics.contentHeight - maxAllowedHeight);

    useTransformScroll({
      viewportRef,
      contentRef,
      scrollable: isScrollable,
      maxScroll,
      alignEnd: anchorBottom,
    });

    useLayoutEffect(() => {
      updateBounds(dragOffsetRef.current);
    }, [containerHeight, position, updateBounds, viewportHeight]);

    const latestMetrics = metrics.cards.get(latestItem.id);
    const hasMeasuredCards = metrics.cards.size === totalCount;
    const draggable = !collapsible;

    return (
      <DraggablePointerContainer
        key={`${dockPrefixCls}-${position}`}
        nodeRef={dragRef}
        bounds={bounds}
        disabled={collapsible}
        position={dragOffset}
        onStart={onStart}
        onDrag={setDragOffset}
        handle={`.${styles.header}`}
        className={cx(styles.stackWrapper)}
        style={{ height: containerHeight, maxHeight: maxAllowedHeight }}
        onMouseEnter={expansion.onMouseEnter}
        onMouseLeave={expansion.onMouseLeave}
        onFocusCapture={expansion.onFocusCapture}
        onBlurCapture={expansion.onBlurCapture}
      >
        <div
          ref={viewportRef}
          className={cx(
            styles.viewport,
            isScrollable && styles.viewportExpanded,
            isScrollable && styles.viewportScrollable,
          )}
        >
          <div
            ref={contentRef}
            className={cx(styles.canvas, anchorBottom && styles.canvasBottom)}
          >
            {displayItems.map((item, index) => {
              const cardMetrics = metrics.cards.get(item.id);
              const interactive = expanded || index === 0;
              const visible =
                expanded ||
                index === 0 ||
                (hasMeasuredCards && index < NOTIFICATION_STACK_LAYERS);
              let transform = 'translateY(0) scaleX(1)';

              if (!expanded && latestMetrics && cardMetrics) {
                const targetTop = anchorBottom
                  ? latestMetrics.top +
                    latestMetrics.height -
                    cardMetrics.height -
                    index * NOTIFICATION_STACK_OFFSET
                  : latestMetrics.top + index * NOTIFICATION_STACK_OFFSET;
                const offsetY = targetTop - cardMetrics.top;
                const scaleX = getCollapsedStackScale(
                  latestMetrics.width,
                  cardMetrics.width,
                  index,
                );
                transform = `translateY(${offsetY}px) scaleX(${scaleX})`;
              }

              const itemStyle: React.CSSProperties = {
                transform,
                transformOrigin,
                opacity: visible ? 1 : 0,
                zIndex: totalCount - index,
                pointerEvents: interactive ? 'auto' : 'none',
              };

              return (
                <div
                  key={item.id}
                  ref={metrics.getCardRef(item.id)}
                  className={styles.cardItem}
                  style={itemStyle}
                >
                  <DockCard
                    item={item}
                    interactive={interactive}
                    draggable={draggable}
                    elevated={!expanded && index < NOTIFICATION_STACK_LAYERS}
                    count={getStackBadgeCount(totalCount, index === 0)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </DraggablePointerContainer>
    );
  },
);

export default DockStack;
