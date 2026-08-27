import { createStyles, css, keyframes } from 'antd-style';

const minimizeDockIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

export const useStyles = createStyles(({ token }, prefixCls?: string) => {
  return {
    container: css`
      position: fixed;
      z-index: ${token.zIndexPopupBase ? token.zIndexPopupBase + 100 : 1000};
      display: flex;
      pointer-events: none;

      &.${prefixCls}-container-bottom-right {
        right: 0;
        bottom: 0;
        .${prefixCls}-scroll-wrapper {
          align-items: flex-end;
          flex-direction: column-reverse;
          mask-image: linear-gradient(
            to bottom,
            transparent,
            black 28px,
            black 100%
          );
        }
      }
      &.${prefixCls}-container-bottom-left {
        bottom: 0;
        left: 0;
        .${prefixCls}-scroll-wrapper {
          align-items: flex-start;
          flex-direction: column-reverse;
          mask-image: linear-gradient(
            to bottom,
            transparent,
            black 28px,
            black 100%
          );
        }
      }
      &.${prefixCls}-container-bottom {
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        .${prefixCls}-scroll-wrapper {
          align-items: center;
          flex-direction: column-reverse;
          mask-image: linear-gradient(
            to bottom,
            transparent,
            black 28px,
            black 100%
          );
        }
      }
      &.${prefixCls}-container-top-right {
        top: 0;
        right: 0;
        .${prefixCls}-scroll-wrapper {
          align-items: flex-end;
          flex-direction: column;
          mask-image: linear-gradient(
            to bottom,
            black,
            black calc(100% - 28px),
            transparent
          );
        }
      }
      &.${prefixCls}-container-top-left {
        top: 0;
        left: 0;
        .${prefixCls}-scroll-wrapper {
          align-items: flex-start;
          flex-direction: column;
          mask-image: linear-gradient(
            to bottom,
            black,
            black calc(100% - 28px),
            transparent
          );
        }
      }
      &.${prefixCls}-container-top {
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        .${prefixCls}-scroll-wrapper {
          align-items: center;
          flex-direction: column;
          mask-image: linear-gradient(
            to bottom,
            black,
            black calc(100% - 28px),
            transparent
          );
        }
      }
      &.${prefixCls}-container-left {
        top: 50%;
        left: 0;
        transform: translateY(-50%);
        .${prefixCls}-scroll-wrapper {
          align-items: flex-start;
          flex-direction: column;
          mask-image: linear-gradient(
            to bottom,
            black,
            black calc(100% - 28px),
            transparent
          );
        }
      }
      &.${prefixCls}-container-right {
        top: 50%;
        right: 0;
        transform: translateY(-50%);
        .${prefixCls}-scroll-wrapper {
          align-items: flex-end;
          flex-direction: column;
          mask-image: linear-gradient(
            to bottom,
            black,
            black calc(100% - 28px),
            transparent
          );
        }
      }
    `,
    scrollWrapper: css`
      box-sizing: border-box;
      display: flex;
      width: 100vw;
      min-width: 100vw;
      height: 100vh;
      min-height: 100vh;
      flex-shrink: 0;
      gap: ${token.sizeSM}px;
      padding: ${token.sizeLG}px;
      overflow-y: auto;
      pointer-events: none;
      scrollbar-width: none;
      -ms-overflow-style: none;

      &::-webkit-scrollbar {
        display: none;
      }
    `,
    dock: css`
      width: ${token.controlHeight * 7}px;
      overflow: hidden;
      flex-shrink: 0;
      pointer-events: auto;
      background: ${token.colorBgElevated};
      border: ${token.lineWidth}px solid ${token.colorBorderSecondary};
      border-radius: ${token.borderRadiusSM}px;
      box-shadow: ${token.boxShadow};
      animation: ${minimizeDockIn} ${token.motionDurationSlow}
        cubic-bezier(0.16, 1, 0.3, 1);
    `,
    header: css`
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: ${token.sizeSM}px ${token.size}px;
      cursor: grab;
      &:active {
        cursor: grabbing;
      }
    `,
    title: css`
      flex: 1;
      overflow: hidden;
      margin-inline-end: ${token.sizeSM}px;
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
  };
});
