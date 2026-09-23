import { createStyles, css, keyframes } from 'antd-style';

const minimizeDockIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(var(--dock-enter-offset, 16px));
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const useStackStyles = createStyles(({ token }) => ({
  stackWrapper: css`
    position: relative;
    isolation: isolate;
    width: ${token.controlHeight * 7}px;
    flex: 0 0 auto;
    overflow: visible;
    background: transparent;
    pointer-events: auto;
    transition: height ${token.motionDurationSlow} ${token.motionEaseOutCirc};

    @media (prefers-reduced-motion: reduce) {
      transition: none;
    }

    &::after {
      position: absolute;
      z-index: 0;
      top: -${token.margin}px;
      right: 0;
      bottom: -${token.margin}px;
      left: 0;
      pointer-events: auto;
      content: '';
    }
  `,
  viewport: css`
    position: relative;
    z-index: 1;
    width: 100%;
    height: 100%;
    overflow: visible;
    background: transparent;
  `,
  viewportExpanded: css`
    overflow: hidden;
  `,
  viewportScrollable: css`
    overscroll-behavior: contain;
    touch-action: none;
  `,
  canvas: css`
    position: relative;
    --dock-enter-offset: -16px;
    width: 100%;
    background: transparent;
  `,
  canvasBottom: css`
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    --dock-enter-offset: 16px;
  `,
  cardItem: css`
    position: absolute;
    width: 100%;
    transition: transform ${token.motionDurationSlow} ${token.motionEaseOutCirc},
      opacity ${token.motionDurationMid};

    @media (prefers-reduced-motion: reduce) {
      transition: none;
    }
  `,
  stackCard: css`
    position: relative;
    z-index: 1;
    width: 100%;
    overflow: hidden;
    background: ${token.colorBgElevated};
    border: ${token.lineWidth}px solid ${token.colorBorderSecondary};
    border-radius: ${token.borderRadiusLG}px;
    box-shadow: ${token.boxShadowTertiary};
    animation: ${minimizeDockIn} ${token.motionDurationSlow}
      ${token.motionEaseOutCirc} both;

    @media (prefers-reduced-motion: reduce) {
      animation: none;
    }
    transition: box-shadow ${token.motionDurationMid}
        cubic-bezier(0.16, 1, 0.3, 1),
      border-color ${token.motionDurationFast} ease;

    &:hover,
    &:focus-within {
      border-color: ${token.colorPrimaryBorder};
    }
  `,
  stackCardElevated: css`
    box-shadow: ${token.boxShadowSecondary};

    &:hover,
    &:focus-within {
      box-shadow: ${token.boxShadow};
    }
  `,
  cardContentHidden: css`
    opacity: 0;
    transition: opacity ${token.motionDurationMid};
  `,
  header: css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${token.sizeSM}px ${token.size}px;
    cursor: grab;
    touch-action: none;
    user-select: none;

    &:active {
      cursor: grabbing;
    }
  `,
  headerStatic: css`
    cursor: default;
    touch-action: auto;

    &:active {
      cursor: default;
    }
  `,
  title: css`
    min-width: 0;
    flex: 1;
    overflow: hidden;
    margin-inline-end: ${token.sizeSM}px;
  `,
  titleText: css`
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  `,
  actions: css`
    flex-shrink: 0;

    button {
      color: ${token.colorTextSecondary};

      &:hover {
        color: ${token.colorText};
      }
    }
  `,
  badge: css`
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    height: 16px;
    padding: 0 5px;
    margin-inline-start: ${token.marginXS}px;
    color: ${token.colorWhite};
    font-weight: 600;
    font-size: ${Math.max(token.fontSizeSM - 2, 10)}px;
    line-height: 16px;
    background: ${token.colorPrimary};
    border-radius: 8px;
  `,
}));
