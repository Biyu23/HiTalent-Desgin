import { createStyles, css } from 'antd-style';

export const useStyles = createStyles(({ token }) => {
  return {
    wrapper: css`
      position: relative;
    `,
    toolbar: css`
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: ${token.sizeXS}px;
      margin-bottom: ${token.sizeSM}px;
    `,
    toolbarExtra: css`
      display: flex;
      align-items: center;
      gap: ${token.sizeXS}px;
      flex: 1;
    `,
    toolbarSetting: css`
      display: flex;
      align-items: center;
    `,
    root: css`
      &.zebra {
        .ant-table-tbody > tr.ant-table-row:nth-child(even) > td {
          background-color: ${token.colorFillQuaternary};
        }
        .ant-table-tbody > tr.ant-table-row:hover > td {
          background-color: ${token.colorFillTertiary};
        }
      }

      &.no-hover {
        .ant-table-tbody > tr.ant-table-row:hover > td {
          background-color: inherit;
        }
      }

      .resizable-th {
        &&::before {
          display: none;
        }
      }

      .row-drag-over-before > td {
        border-top: ${token.lineWidthBold}px solid ${token.colorPrimary};
      }

      .row-drag-over-after > td {
        border-bottom: ${token.lineWidthBold}px solid ${token.colorPrimary};
      }

      .row-drag-over-inside > td {
        background-color: ${token.colorPrimaryBg};
        border-top: ${token.lineWidth}px dashed ${token.colorPrimary};
        border-bottom: ${token.lineWidth}px dashed ${token.colorPrimary};

        &:first-child {
          border-inline-start: ${token.lineWidth}px dashed ${token.colorPrimary};
        }

        &:last-child {
          border-inline-end: ${token.lineWidth}px dashed ${token.colorPrimary};
        }
      }
    `,
    resizeHandle: css`
      position: absolute;
      top: 0;
      inset-inline-end: 0;
      bottom: 0;
      width: ${token.sizeMS - token.sizeXXS}px;
      cursor: col-resize;
      z-index: 10;
      background: transparent;
      transition: background-color ${token.motionDurationMid};

      &::after {
        content: '';
        position: absolute;
        top: 50%;
        inset-inline-end: 0;
        width: ${token.lineWidth}px;
        height: 1.6em;
        transform: translateY(-50%);
        background-color: ${token.colorBorderSecondary};
        transition: all ${token.motionDurationMid};
      }

      &:hover::after {
        width: ${token.lineWidthBold}px;
        height: 100%;
        background-color: ${token.colorPrimary};
      }
    `,
    resizeHandleActive: css`
      &::after {
        width: ${token.lineWidthBold}px !important;
        height: 100% !important;
        background-color: ${token.colorPrimary} !important;
      }
    `,
    headerCell: css`
      display: flex;
      align-items: center;
      width: 100%;
      height: 100%;
      overflow: hidden;
    `,
    headerCellTitle: css`
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    `,
    dragContainer: css`
      display: flex;
      align-items: center;
      width: 100%;
      height: 100%;
    `,
    rowDragHandleWrapper: css`
      display: flex;
      align-items: center;
      justify-content: center;
    `,
    rowDragHandle: css`
      cursor: grab;
      color: ${token.colorTextTertiary};
      font-size: ${token.fontSize}px;
      transition: color ${token.motionDurationMid};

      &:hover {
        color: ${token.colorPrimary};
      }

      &:active {
        cursor: grabbing;
      }
    `,
    rowDragHandleDisabled: css`
      cursor: not-allowed;
      color: ${token.colorTextDisabled} !important;
    `,
    columnSettingPopover: css`
      .ant-popover-inner {
        padding: 0;
      }
    `,
    columnSettingPopoverBody: css`
      padding: 0;

      .ant-popover-title {
        font-weight: 400;
        margin-bottom: 0;
        font-size: ${token.fontSize}px;
        color: ${token.colorText};
        padding: ${token.sizeXS}px ${token.size}px;
        border-bottom: ${token.lineWidth}px solid ${token.colorSplit};
      }
    `,
    columnSettingList: css`
      width: 100%;
      max-height: ${token.controlHeight * 7.5}px;
      overflow-x: hidden;
      overflow-y: auto;
      border-bottom: ${token.lineWidth}px solid ${token.colorSplit};
      padding: ${token.sizeXXS}px 0;
      display: flex;
      flex-direction: column;

      .ant-checkbox-group {
        padding: ${token.sizeXXS}px 0;
        display: flex;
        flex-direction: column;
      }

      .ant-checkbox-wrapper {
        width: 100%;
        padding: ${token.sizeXXS}px ${token.size}px;
        color: ${token.colorText};

        &:hover {
          background-color: ${token.colorPrimaryBg};
        }
      }
    `,
    columnSettingItem: css`
      width: 100%;
      padding: ${token.sizeXS}px ${token.size}px;
      color: ${token.colorText};
      cursor: pointer;
      transition: background-color ${token.motionDurationMid};
      overflow: hidden;

      &:hover {
        background-color: ${token.colorFillTertiary};
      }

      .ant-checkbox-wrapper {
        width: 100%;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    `,
    columnSettingFooter: css`
      display: flex;
      justify-content: flex-end;
      gap: ${token.size}px;
      padding: ${token.sizeXS}px ${token.size}px;
      border-top: ${token.lineWidth}px solid ${token.colorBorderSecondary};
    `,
    dragOverlay: css`
      table {
        border-collapse: collapse;
        background: ${token.colorBgElevated};
        border: ${token.lineWidth}px dashed ${token.colorPrimary};
        box-shadow: ${token.boxShadowSecondary};
      }

      th,
      td {
        padding: ${token.sizeXS}px ${token.size}px;
        background: ${token.colorBgElevated};
      }
    `,
  };
});
