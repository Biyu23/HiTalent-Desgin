import { createStyles, css } from 'antd-style';

export const useStyles = createStyles(({ token }, prefixCls?: string) => {
  return {
    root: css`
      display: inline-block;
      max-width: 100%;
    `,
    selectorBtn: css`
      display: flex;
      gap: ${token.paddingXS}px;
      align-items: center;
      justify-content: space-between;
      width: 100%;
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
    `,
    selectorText: css`
      flex: 1;
      min-width: 0;
      overflow: hidden;
      color: inherit;
      line-height: inherit;
      text-align: start;
      white-space: nowrap;
      text-overflow: ellipsis;

      .ant-typography {
        margin: 0;
        padding: 0;
      }

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
      position: relative;
      display: inline-flex;
      flex-shrink: 0;
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
    selectorClear: css`
      z-index: 1;
      flex-shrink: 0;
      color: ${token.colorTextQuaternary};
      font-size: ${token.fontSizeSM}px;
      cursor: pointer;
      transition: color ${token.motionDurationMid},
        opacity ${token.motionDurationMid};

      ${prefixCls
        ? `&.${prefixCls}-selector-clear-overlay {
          position: absolute;
          top: 50%;
          right: 0;
          transform: translateY(-50%);
          opacity: 0;
          pointer-events: none;
        }`
        : ''}

      &:hover {
        color: ${token.colorTextTertiary};
      }
    `,
    popover: css`
      .ant-popover-inner {
        padding: ${token.paddingXXS}px !important;
      }
    `,
    dropdown: css`
      display: flex;
      flex-direction: column;
      width: 100%;
      min-width: ${Math.max(150, token.controlHeight * 4)}px;
    `,
    menu: css`
      display: flex;
      flex: 1;
      flex-direction: column;
    `,
    menuScroll: css`
      overflow-y: auto;
    `,
    menuRadio: css`
      display: flex;
      align-items: center;
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
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    `,
    menuItemText: css`
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    `,
    search: css`
      padding: ${token.paddingXS}px ${token.paddingXS}px 0;

      .ant-input-affix-wrapper .anticon {
        color: ${token.colorTextQuaternary};
      }
    `,
    selectAll: css`
      padding: ${token.paddingXXS}px ${token.paddingSM}px;
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
      padding: ${token.paddingSM}px;
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
        fontsize: ${token.fontSizeSM}px;
      }
    `,
  };
});
