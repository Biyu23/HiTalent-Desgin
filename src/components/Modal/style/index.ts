import { createStyles, css } from 'antd-style';

export const useStyles = createStyles(({ token }) => {
  const handleSize = token.controlHeightSM / 2 + token.lineWidthBold * 2;
  const handleIconSize = token.sizeXS - token.lineWidth;
  const handleOffset = token.marginXXS - token.lineWidth;

  return {
    wrapConstrained: css`
      overflow: hidden;
    `,
    root: css`
      .ant-modal-content {
        position: relative;
      }

      &.draggable,
      &.resizable,
      &.manual-size {
        padding-bottom: 0;
      }

      &.transition-active {
        transition: width ${token.motionDurationSlow} ${token.motionEaseInOut},
          height ${token.motionDurationSlow} ${token.motionEaseInOut},
          top ${token.motionDurationSlow} ${token.motionEaseInOut};

        .ant-modal-content {
          transition: all ${token.motionDurationSlow} ${token.motionEaseInOut};
        }
      }

      &.resizing,
      &.resizing .ant-modal-content {
        transition: none !important;
      }

      &.draggable {
        .ant-modal-footer {
          cursor: move;

          button,
          a,
          input,
          textarea,
          select,
          [contenteditable],
          [data-modal-no-drag] {
            cursor: auto;
          }
        }
      }

      &.manual-size {
        box-sizing: border-box;
        max-width: none;

        .ant-modal-content {
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .ant-modal-header,
        .ant-modal-footer {
          flex-shrink: 0;
        }

        .ant-modal-body {
          flex: 1;
          min-height: 0;
          overflow: auto;
        }
      }

      &.maximized {
        top: 0 !important;
        width: 100% !important;
        height: 100vh !important;
        max-width: 100vw !important;
        margin: 0 !important;
        padding-bottom: 0 !important;

        .ant-modal-content {
          height: 100vh !important;
          display: flex;
          flex-direction: column;
          border-radius: 0;
        }

        .ant-modal-header,
        .ant-modal-footer {
          flex-shrink: 0;
        }

        .ant-modal-body {
          flex: 1;
          min-height: 0;
          overflow: auto;
        }
      }
    `,
    header: css`
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      gap: ${token.size}px;
    `,
    headerDraggable: css`
      cursor: move;
    `,
    title: css`
      flex: 1;
      overflow: hidden;
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
    resizeHandle: css`
      position: absolute;
      right: 0;
      bottom: 0;
      z-index: 2;
      width: ${handleSize}px;
      height: ${handleSize}px;
      cursor: nwse-resize;
      touch-action: none;

      &::after {
        content: '';
        position: absolute;
        right: ${handleOffset}px;
        bottom: ${handleOffset}px;
        width: ${handleIconSize}px;
        height: ${handleIconSize}px;
        border-color: currentColor;
        border-style: solid;
        border-width: 0 ${token.lineWidth}px ${token.lineWidth}px 0;
        opacity: 0.35;
        transition: color ${token.motionDurationMid},
          opacity ${token.motionDurationMid};
      }

      &:hover::after {
        color: ${token.colorPrimary};
        opacity: 1;
      }
    `,
  };
});
