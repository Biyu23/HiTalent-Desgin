import { createStyles, css, keyframes } from 'antd-style';

const minimizeDockIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const NOTIFICATION_STACK_OFFSET = 8;
const MIN_STACK_SCALE = 0.72;

export const useStackStyles = createStyles(({ token }) => ({
  stackWrapper: css`
    position: relative;
    isolation: isolate;
    width: ${token.controlHeight * 7}px;
    flex: 0 0 auto;
    overflow: visible;
    background: transparent;
    pointer-events: auto;
    transition: height ${token.motionDurationSlow} cubic-bezier(0.16, 1, 0.3, 1);

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
    display: flex;
    width: 100%;
    flex-direction: column;
    gap: ${token.margin}px;
    background: transparent;
  `,
  canvasBottom: css`
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    flex-direction: column-reverse;
  `,
  cardItem: css`
    width: 100%;
    flex: 0 0 auto;
  `,
  latestCard: css`
    position: relative;
    isolation: isolate;
    z-index: 1;
  `,
  latestCardStackTop: css`
    &::before,
    &::after {
      position: absolute;
      inset: 0;
      background: ${token.colorBgElevated};
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: ${token.lineWidth}px solid ${token.colorBorderSecondary};
      border-radius: ${token.borderRadiusLG}px;
      box-shadow: ${token.boxShadowSecondary};
      pointer-events: none;
      content: '';
      transition: transform ${token.motionDurationSlow}, backdrop-filter 0s;
      will-change: transform, opacity;
    }

    &::before {
      z-index: -1;
      transform: translateY(${NOTIFICATION_STACK_OFFSET}px)
        scaleX(
          ${Math.max(
            (token.controlHeight * 7 - NOTIFICATION_STACK_OFFSET * 2) /
              (token.controlHeight * 7),
            MIN_STACK_SCALE,
          )}
        );
    }

    &::after {
      z-index: -2;
      transform: translateY(${NOTIFICATION_STACK_OFFSET * 2}px)
        scaleX(
          ${Math.max(
            (token.controlHeight * 7 - NOTIFICATION_STACK_OFFSET * 4) /
              (token.controlHeight * 7),
            MIN_STACK_SCALE,
          )}
        );
    }
  `,
  latestCardStackBottom: css`
    &::before,
    &::after {
      position: absolute;
      inset: 0;
      background: ${token.colorBgElevated};
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: ${token.lineWidth}px solid ${token.colorBorderSecondary};
      border-radius: ${token.borderRadiusLG}px;
      box-shadow: ${token.boxShadowSecondary};
      pointer-events: none;
      content: '';
      transition: transform ${token.motionDurationSlow}, backdrop-filter 0s;
      will-change: transform, opacity;
    }

    &::before {
      z-index: -1;
      transform: translateY(-${NOTIFICATION_STACK_OFFSET}px)
        scaleX(
          ${Math.max(
            (token.controlHeight * 7 - NOTIFICATION_STACK_OFFSET * 2) /
              (token.controlHeight * 7),
            MIN_STACK_SCALE,
          )}
        );
    }

    &::after {
      z-index: -2;
      transform: translateY(-${NOTIFICATION_STACK_OFFSET * 2}px)
        scaleX(
          ${Math.max(
            (token.controlHeight * 7 - NOTIFICATION_STACK_OFFSET * 4) /
              (token.controlHeight * 7),
            MIN_STACK_SCALE,
          )}
        );
    }
  `,
  stackCard: css`
    position: relative;
    z-index: 1;
    width: 100%;
    overflow: hidden;
    background: transparent;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: ${token.lineWidth}px solid ${token.colorBorderSecondary};
    border-radius: ${token.borderRadiusLG}px;
    box-shadow: none;
    animation: ${minimizeDockIn} ${token.motionDurationSlow}
      cubic-bezier(0.16, 1, 0.3, 1);
    transition: box-shadow ${token.motionDurationMid}
        cubic-bezier(0.16, 1, 0.3, 1),
      border-color ${token.motionDurationFast} ease;

    &:hover,
    &:focus-within {
      border-color: ${token.colorPrimaryBorder};
    }
  `,
  stackCardElevated: css`
    background: ${token.colorBgElevated};
    box-shadow: ${token.boxShadowSecondary};

    &:hover,
    &:focus-within {
      box-shadow: ${token.boxShadow};
    }
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
