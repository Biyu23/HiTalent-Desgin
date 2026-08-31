import type { MinimizeStack } from '../type';

export const DEFAULT_STACK_THRESHOLD = 3;
export const NOTIFICATION_STACK_OFFSET = 8;
export const NOTIFICATION_STACK_LAYERS = 3;
export const MIN_STACK_SCALE = 0.72;

export interface NormalizedMinimizeStack {
  enabled: boolean;
  threshold: number;
}

export const normalizeMinimizeStack = (
  stack?: MinimizeStack,
): NormalizedMinimizeStack => {
  if (stack === false) {
    return { enabled: false, threshold: DEFAULT_STACK_THRESHOLD };
  }

  const threshold =
    stack && typeof stack === 'object' ? stack.threshold : undefined;
  if (threshold === undefined) {
    return { enabled: true, threshold: DEFAULT_STACK_THRESHOLD };
  }

  if (
    !Number.isFinite(threshold) ||
    !Number.isInteger(threshold) ||
    threshold < 1
  ) {
    return { enabled: true, threshold: DEFAULT_STACK_THRESHOLD };
  }

  return { enabled: true, threshold };
};

export const shouldCollapseStack = (
  count: number,
  stack?: MinimizeStack,
): boolean => {
  const config = normalizeMinimizeStack(stack);
  return config.enabled && count > config.threshold;
};

export const getStackBadgeCount = (
  count: number,
  isTopCard: boolean,
): number | undefined => (isTopCard && count > 1 ? count : undefined);

export const getCollapsedStackScale = (
  latestWidth: number,
  currentWidth: number,
  layer: number,
): number => {
  if (latestWidth <= 0 || currentWidth <= 0) return 1;
  const visibleLayer = Math.min(layer, NOTIFICATION_STACK_LAYERS);
  const targetWidth =
    latestWidth - NOTIFICATION_STACK_OFFSET * 2 * visibleLayer;
  return Math.max(targetWidth / currentWidth, MIN_STACK_SCALE);
};
