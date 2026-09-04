import { createStyles, css } from 'antd-style';

export const useStyles = createStyles(({ token }) => {
  return {
    root: css`
      display: inline-block;
      max-width: 100%;
      box-sizing: border-box;
    `,
    selectorBtn: css`
      display: flex;
      gap: ${token.paddingXS}px;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      max-width: 100%;
      box-sizing: border-box;
      padding: ${token.paddingXXS}px ${token.paddingSM}px;
      color: ${token.colorText};
      text-align: left;
      background-color: transparent;
      border: ${token.lineWidth}px solid transparent;
      border-radius: ${token.borderRadiusXS}px;
      transition: color ${token.motionDurationMid} ${token.motionEaseInOut},
        background-color ${token.motionDurationMid} ${token.motionEaseInOut},
        border-color ${token.motionDurationMid} ${token.motionEaseInOut};

      &:hover {
        background-color: ${token.colorFillTertiary};
      }
    `,
    selectorBtnActive: css`
      color: ${token.colorPrimary};
      background-color: ${token.colorPrimaryBg};
      border: ${token.lineWidth}px solid ${token.colorPrimaryBorder};
    `,
    selectorBtnOpen: css`
      background-color: ${token.colorFillTertiary};
    `,
    selectorBtnDisabled: css`
      color: ${token.colorTextDisabled};
      cursor: not-allowed;
      background-color: transparent;
      border: ${token.lineWidth}px solid transparent;

      &:hover {
        color: ${token.colorTextDisabled};
        background-color: transparent;
        border-color: transparent;
      }
    `,
    selectorText: css`
      flex: 1;
      min-width: 0;
      color: inherit;
      line-height: inherit;
      text-align: start;

      .ant-typography {
        margin: 0;
        padding: 0;
      }
    `,
    selectorTextEllipsis: css`
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;

      > span {
        display: inline-block;
        max-width: 100%;
        overflow: hidden;
        vertical-align: bottom;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    `,
    selectorActions: css`
      display: inline-flex;
      flex-shrink: 0;
      gap: ${token.marginXXS}px;
      align-items: center;
      justify-content: center;
      min-width: ${token.fontSizeSM}px;
      height: ${token.fontSizeSM}px;
      font-size: ${token.fontSizeSM}px;
      line-height: 1;
    `,
    selectorArrow: css`
      flex-shrink: 0;
      color: ${token.colorTextQuaternary};
      font-size: ${token.fontSizeSM}px;
      transition: transform ${token.motionDurationMid} ${token.motionEaseInOut},
        opacity ${token.motionDurationMid};
    `,
    selectorArrowOpen: css`
      transform: rotate(180deg);
    `,
    selectorClear: css`
      flex-shrink: 0;
      color: ${token.colorTextQuaternary};
      font-size: ${token.fontSizeSM}px;
      cursor: pointer;
      transition: color ${token.motionDurationMid};

      &:hover {
        color: ${token.colorTextTertiary};
      }
    `,
    popover: css`
      max-width: calc(100vw - ${token.marginSM * 2}px);

      .ant-popover-inner {
        padding: 0 !important;
        overflow: hidden;
      }
    `,
    dropdown: css`
      display: flex;
      flex-direction: column;
      width: 100%;
      min-width: ${Math.max(150, token.controlHeight * 4)}px;
      max-width: 100%;
      box-sizing: border-box;
      overflow: hidden;
    `,
    menu: css`
      display: flex;
      flex: 1;
      flex-direction: column;
      min-width: 0;
      padding-block: ${token.paddingXXS}px;
    `,
    menuScroll: css`
      overflow-x: hidden;
      overflow-y: auto;
    `,
    menuItemVirtual: css`
      height: var(--popover-select-item-height, ${token.controlHeight}px);
      overflow: hidden;

      > span:last-child {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    `,
    menuRadio: css`
      display: flex;
      align-items: center;
      width: 100%;
      box-sizing: border-box;
      padding: ${token.paddingXXS}px ${token.paddingSM}px;
      cursor: pointer;
      color: ${token.colorText};
      transition: background-color ${token.motionDurationMid};
      user-select: none;
      border-radius: ${token.borderRadiusSM}px;

      &:hover {
        background-color: ${token.colorFillTertiary};
      }
    `,
    menuRadioActive: css`
      color: ${token.colorPrimary} !important;
      background-color: ${token.colorPrimaryBg} !important;

      &:hover {
        background-color: ${token.colorPrimaryBgHover ||
        token.colorPrimaryBg} !important;
      }
    `,
    menuRadioDisabled: css`
      color: ${token.colorTextDisabled} !important;
      cursor: not-allowed !important;

      &:hover {
        background-color: transparent !important;
      }
    `,
    menuCheckbox: css`
      display: flex;
      align-items: center;
      width: 100%;
      box-sizing: border-box;
      margin: 0;
      padding: ${token.paddingXXS}px ${token.paddingSM}px;
      color: ${token.colorText};
      transition: background-color ${token.motionDurationMid};
      border-radius: ${token.borderRadiusSM}px;

      &:hover {
        background-color: ${token.colorFillTertiary};
      }

      &.ant-checkbox-wrapper-disabled,
      &[disabled] {
        cursor: not-allowed;

        &:hover {
          background-color: transparent;
        }
      }

      > span:last-child {
        flex: 1;
        min-width: 0;
      }
    `,
    menuItemText: css`
      display: block;
      flex: 1;
      min-width: 0;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    `,
    search: css`
      padding: ${token.paddingXS}px ${token.paddingSM}px ${token.paddingXXS}px;

      .ant-input-affix-wrapper .anticon {
        color: ${token.colorTextQuaternary};
      }
    `,
    selectAll: css`
      padding: ${token.paddingXS}px ${token.paddingSM}px;
      border-bottom: ${token.lineWidth}px solid ${token.colorBorderSecondary};

      .ant-checkbox-wrapper {
        display: flex;
        align-items: center;
        width: 100%;
        margin: 0;

        > span:first-child {
          flex-shrink: 0;
        }

        > span:last-child {
          flex: 1;
          min-width: 0;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
      }
    `,
    footer: css`
      display: flex;
      justify-content: flex-end;
      padding: ${token.paddingXS}px ${token.paddingSM}px;
      border-top: ${token.lineWidth}px solid ${token.colorBorderSecondary};
    `,
    empty: css`
      padding: ${token.paddingLG}px ${token.paddingSM}px;
      text-align: center;

      .ant-empty-image {
        height: ${token.controlHeightLG}px;
        margin-bottom: ${token.marginXS}px;

        .ant-empty-img-simple {
          width: ${token.controlHeightLG}px;
          height: ${token.controlHeightLG}px;
        }
      }

      .ant-empty-description {
        color: ${token.colorText};
        font-size: ${token.fontSizeSM}px;
      }
    `,
  };
});
