export const clampScrollOffset = (
  offset: number,
  maxScroll: number,
): number => {
  const safeMaxScroll = Number.isFinite(maxScroll) ? Math.max(0, maxScroll) : 0;
  const safeOffset = Number.isFinite(offset) ? offset : 0;
  return Math.min(safeMaxScroll, Math.max(0, safeOffset));
};
