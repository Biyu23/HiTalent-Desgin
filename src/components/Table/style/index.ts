import { createStyles, css } from 'antd-style';

export const useStyles = createStyles(({ token }) => ({
  wrapper: css`
    position: relative;
  `,
  root: css`
    .ant-table-thead > tr > .ant-table-cell-fix-left,
    .ant-table-thead > tr > .ant-table-cell-fix-right {
      z-index: 4;
      background: linear-gradient(
          ${token.colorFillAlter},
          ${token.colorFillAlter}
        ),
        ${token.colorBgContainer};
      background-clip: padding-box;
    }

    &.zebra .ant-table-tbody > tr.ant-table-row:nth-child(even) > td {
      background-color: ${token.colorFillQuaternary};
    }

    &.zebra .ant-table-tbody > tr.ant-table-row:hover > td {
      background-color: ${token.colorFillTertiary};
    }

    &.no-hover .ant-table-tbody > tr.ant-table-row:hover > td {
      background-color: inherit;
    }

    .row-drag-over-before > td {
      box-shadow: inset 0 2px 0 ${token.colorPrimary};
    }
    .row-drag-over-after > td,
    .row-drag-over-inside > td {
      box-shadow: inset 0 -2px 0 ${token.colorPrimary};
    }
    .row-drag-over-inside {
      opacity: 0.5;
    }

    [data-table-tree-cell] {
      display: flex;
      align-items: center;
      min-width: 0;
    }
    [data-table-tree-cell] > .ant-table-row-indent,
    [data-table-tree-cell] > .ant-table-row-expand-icon {
      flex: none;
    }
    [data-table-tree-content] {
      flex: 1;
      min-width: 0;
      overflow-wrap: anywhere;
    }

    &.row-drag-tree .ant-table-tbody .ant-table-row-indent {
      --tree-indent-size: var(--table-tree-indent-size, 24px);
      position: relative;
      height: calc(1em + ${token.padding * 2}px);
      margin-block: -${token.padding}px;
      background-image: repeating-linear-gradient(
        to right,
        transparent 0,
        transparent calc(var(--tree-indent-size) / 2 - 0.5px),
        ${token.colorFillSecondary} calc(var(--tree-indent-size) / 2 - 0.5px),
        ${token.colorFillSecondary} calc(var(--tree-indent-size) / 2 + 0.5px),
        transparent calc(var(--tree-indent-size) / 2 + 0.5px),
        transparent var(--tree-indent-size)
      );
    }

    @media (prefers-reduced-motion: reduce) {
      .ant-table-tbody > tr {
        transition: none !important;
      }
    }
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
  columnSettingPopover: css`
    .ant-popover-inner {
      padding: 0;
    }
  `,
  columnSettingPopoverBody: css`
    padding: 0;

    .ant-popover-title {
      margin-bottom: 0;
      padding: ${token.sizeXS}px ${token.size}px;
      border-bottom: ${token.lineWidth}px solid ${token.colorSplit};
      font-size: ${token.fontSize}px;
      font-weight: 400;
    }
  `,
  columnSettingList: css`
    width: 100%;
    max-height: ${token.controlHeight * 7.5}px;
    overflow-y: auto;
    padding: ${token.sizeXXS}px 0;
  `,
  columnSettingItem: css`
    padding: ${token.sizeXS}px ${token.size}px;

    &:hover {
      background-color: ${token.colorFillTertiary};
    }

    .ant-checkbox-wrapper {
      width: 100%;
    }
  `,
  columnSettingFooter: css`
    display: flex;
    justify-content: flex-end;
    gap: ${token.size}px;
    padding: ${token.sizeXS}px ${token.size}px;
    border-top: ${token.lineWidth}px solid ${token.colorBorderSecondary};
  `,
  resizableHeader: css`
    &&::before {
      display: none;
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
  resizeHandle: css`
    position: absolute;
    top: 0;
    inset-inline-end: 0;
    bottom: 0;
    z-index: 10;
    width: ${token.sizeMS - token.sizeXXS}px;
    cursor: col-resize;

    &::after {
      position: absolute;
      top: 50%;
      inset-inline-end: 0;
      width: ${token.lineWidth}px;
      height: 1.6em;
      background: ${token.colorBorderSecondary};
      transform: translateY(-50%);
      content: '';
    }

    &:hover::after {
      width: ${token.lineWidthBold}px;
      height: 100%;
      background: ${token.colorPrimary};
    }
  `,
  resizeHandleActive: css`
    &::after {
      width: ${token.lineWidthBold}px;
      height: 100%;
      background: ${token.colorPrimary};
    }
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
    color: ${token.colorTextTertiary};
    cursor: grab;

    &:hover {
      color: ${token.colorPrimary};
    }

    &:active {
      cursor: grabbing;
    }
  `,
  rowDragHandleDisabled: css`
    color: ${token.colorTextDisabled};
    cursor: not-allowed;
  `,
  rowTreeParent: css`
    position: relative;
  `,
}));
