import { createStyles, css } from 'antd-style';

export const useStyles = createStyles(({ token }) => {
  const handleGripSize = token.lineWidthBold * 2; // ~4px
  const handleHitOffset = -(token.marginXXS - token.lineWidth); // ~ -3px

  return {
    root: css`
      /* 抽屉根样式 */
    `,
    headerActions: css`
      button {
        color: ${token.colorTextSecondary};

        &:hover {
          color: ${token.colorText};
        }
      }
    `,
    emptyTitle: css`
      display: inline-block;
    `,
    wrapper: css`
      /* 抽屉面板基础样式 */
    `,
    wrapperResizing: css`
      transition: none !important;
    `,
    wrapperHorizontal: css`
      will-change: width;
    `,
    wrapperVertical: css`
      will-change: height;
    `,
    resizeHandle: css`
      position: absolute;
      z-index: 2;
      box-sizing: border-box;
      background: transparent;
      pointer-events: auto;
      user-select: none;
      touch-action: none;

      &::after {
        content: '';
        position: absolute;
        background: transparent;
        transition: background-color ${token.motionDurationMid}
            ${token.motionEaseInOut},
          opacity ${token.motionDurationMid} ${token.motionEaseInOut};
      }

      &:hover::after {
        background: ${token.colorPrimary};
        opacity: 0.2;
      }
    `,
    resizeHandleResizing: css`
      &::after {
        background: ${token.colorPrimary} !important;
        opacity: 0.3 !important;
      }
    `,
    resizeHandleLeft: css`
      top: 0;
      right: 0;
      bottom: 0;
      width: ${handleGripSize}px;
      cursor: col-resize;

      &::after {
        top: 0;
        right: ${handleHitOffset}px;
        bottom: 0;
        left: ${handleHitOffset}px;
      }
    `,
    resizeHandleRight: css`
      top: 0;
      bottom: 0;
      left: 0;
      width: ${handleGripSize}px;
      cursor: col-resize;

      &::after {
        top: 0;
        right: ${handleHitOffset}px;
        bottom: 0;
        left: ${handleHitOffset}px;
      }
    `,
    resizeHandleTop: css`
      right: 0;
      bottom: 0;
      left: 0;
      height: ${handleGripSize}px;
      cursor: row-resize;

      &::after {
        top: ${handleHitOffset}px;
        right: 0;
        bottom: ${handleHitOffset}px;
        left: 0;
      }
    `,
    resizeHandleBottom: css`
      top: 0;
      right: 0;
      left: 0;
      height: ${handleGripSize}px;
      cursor: row-resize;

      &::after {
        top: ${handleHitOffset}px;
        right: 0;
        bottom: ${handleHitOffset}px;
        left: 0;
      }
    `,
  };
});
