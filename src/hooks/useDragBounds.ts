import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import type { DraggableData } from 'react-draggable';

export type DragStartHandler = (
  event: unknown,
  data: Pick<DraggableData, 'x' | 'y'>,
) => void;

export interface StrictDraggableBounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface UseDragBoundsReturn {
  dragRef: React.RefObject<HTMLDivElement>;
  bounds: StrictDraggableBounds;
  boundsRef: React.MutableRefObject<StrictDraggableBounds>;
  onStart: DragStartHandler;
  updateBounds: (currentPos?: {
    x: number;
    y: number;
  }) => StrictDraggableBounds;
}

/**
 * 依据目标节点在视口中的位置计算拖拽移动边界，确保节点始终被限制在当前视口内。
 */
export const computeDragBounds = (
  target: HTMLElement,
  currentPosition?: { x: number; y: number },
): StrictDraggableBounds => {
  const clientWidth = document.documentElement.clientWidth || window.innerWidth;
  const clientHeight =
    document.documentElement.clientHeight || window.innerHeight;
  const targetRect = target.getBoundingClientRect();
  if (
    !targetRect ||
    !Number.isFinite(targetRect.width) ||
    !Number.isFinite(targetRect.height)
  ) {
    return { left: 0, top: 0, right: 0, bottom: 0 };
  }

  const posX = currentPosition?.x ?? 0;
  const posY = currentPosition?.y ?? 0;

  // 计算无位移时的基准左上角坐标
  const baseLeft = targetRect.left - posX;
  const baseTop = targetRect.top - posY;

  // 计算视口限制下的合法位移范围
  const minX = Math.ceil(-baseLeft);
  const maxX = Math.floor(clientWidth - baseLeft - targetRect.width);
  const minY = Math.ceil(-baseTop);
  const maxY = Math.floor(clientHeight - baseTop - targetRect.height);

  return {
    left: Math.min(minX, maxX),
    right: Math.max(minX, maxX),
    top: Math.min(minY, maxY),
    bottom: Math.max(minY, maxY),
  };
};

/**
 * 计算拖拽节点在当前视口内的移动边界。
 *
 * measureRef 用于包装节点和实际可视节点不一致的场景，例如 Modal 的
 * react-draggable 节点包裹了 Ant Design 的定位层；不传时沿用 dragRef。
 */
const useDragBounds = (
  measureRef?: React.RefObject<HTMLElement>,
): UseDragBoundsReturn => {
  const dragRef = useRef<HTMLDivElement>(null);
  const [bounds, setBounds] = useState<StrictDraggableBounds>({
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
  });
  const boundsRef = useRef<StrictDraggableBounds>(bounds);
  boundsRef.current = bounds;

  const updateBounds = useCallback(
    (currentPos?: { x: number; y: number }): StrictDraggableBounds => {
      const target = measureRef?.current || dragRef.current;
      if (!target) return boundsRef.current;
      const nextBounds = computeDragBounds(target, currentPos);
      boundsRef.current = nextBounds;
      setBounds(nextBounds);
      return nextBounds;
    },
    [measureRef],
  );

  const onStart: DragStartHandler = useCallback(
    (_event, uiData) => {
      updateBounds({ x: uiData.x, y: uiData.y });
    },
    [updateBounds],
  );

  useLayoutEffect(() => {
    updateBounds();
  }, [updateBounds]);

  useEffect(() => {
    const handleResize = () => {
      updateBounds();
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [updateBounds]);

  return { dragRef, bounds, boundsRef, onStart, updateBounds };
};

export default useDragBounds;
