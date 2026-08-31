import { createStyles, css } from 'antd-style';

export const useStyles = createStyles(({ token }) => {
  return {
    root: css`
      display: flex;
      flex-direction: column;
      gap: ${token.marginSM}px;
      width: 100%;
    `,

    inlineForm: css`
      width: 100%;
    `,

    inlineFieldsWrapper: css`
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0;
      width: 100%;
    `,

    inlineFieldItem: css`
      display: inline-flex;
      align-items: center;
      padding: ${token.paddingXXS}px 0;
    `,

    fieldDivider: css`
      height: 14px;
      margin: 0 ${token.marginXS}px;
    `,

    fieldTrigger: css`
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: ${token.paddingXXS}px ${token.paddingXS}px;
      border-radius: ${token.borderRadiusSM}px;
      font-size: ${token.fontSize}px;
      color: ${token.colorText};
      cursor: pointer;
      user-select: none;
      transition: all ${token.motionDurationMid};

      &:hover {
        background-color: ${token.colorFillTertiary};
        color: ${token.colorPrimary};
      }
    `,

    fieldTriggerActive: css`
      background-color: ${token.colorFillAlter};
      color: ${token.colorPrimary};
      font-weight: 500;
    `,

    fieldTriggerHasValue: css`
      color: ${token.colorPrimary};
      font-weight: 500;
    `,

    fieldTriggerArrow: css`
      font-size: 10px;
      transition: transform ${token.motionDurationMid};
      color: ${token.colorTextDescription};
    `,

    fieldTriggerArrowOpen: css`
      transform: rotate(180deg);
      color: ${token.colorPrimary};
    `,

    popoverPanel: css`
      min-width: 240px;
      display: flex;
      flex-direction: column;
      gap: ${token.marginXS}px;
    `,

    popoverPanelContent: css`
      padding-top: ${token.paddingXXS}px;

      .ant-form-item {
        margin-bottom: 0;
      }
    `,

    popoverPanelFooter: css`
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: ${token.marginXS}px;
      padding-top: ${token.paddingXS}px;
      border-top: 1px solid ${token.colorBorderSecondary};
      margin-top: ${token.marginXXS}px;
    `,

    actionsWrapper: css`
      display: inline-flex;
      align-items: center;
      gap: ${token.marginXS}px;
      padding: ${token.paddingXXS}px 0;
    `,

    toggleButton: css`
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 0 ${token.paddingXS}px;
      color: ${token.colorPrimary};
      font-size: ${token.fontSizeSM}px;
      cursor: pointer;
      user-select: none;
      transition: color ${token.motionDurationMid};

      &:hover {
        color: ${token.colorPrimaryHover};
      }
    `,

    toggleButtonArrow: css`
      display: inline-flex;
      align-items: center;
      font-size: 10px;
      transition: transform ${token.motionDurationMid} ${token.motionEaseInOut};
      will-change: transform;
    `,

    toggleButtonArrowExpanded: css`
      transform: rotate(180deg);
    `,

    activeFiltersBar: css`
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: ${token.marginSM}px;
      padding: ${token.paddingXS}px ${token.paddingSM}px;
      background-color: ${token.colorFillAlter};
      border: 1px dashed ${token.colorBorderSecondary};
      border-radius: ${token.borderRadiusSM}px;
    `,

    activeFiltersLeft: css`
      display: flex;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: ${token.marginXS}px;
      flex: 1;
      min-width: 0;
    `,

    activeFiltersTitle: css`
      display: inline-flex;
      align-items: center;
      height: 24px;
      color: ${token.colorTextSecondary};
      font-size: ${token.fontSizeSM}px;
      white-space: nowrap;
      margin-right: ${token.marginXXS}px;
    `,

    filterTag: css`
      display: inline-flex;
      align-items: center;
      max-width: 280px;
      margin-inline-end: 0;
      font-size: ${token.fontSizeSM}px;

      .ant-tag-close-icon {
        margin-inline-start: 4px;
        color: ${token.colorTextDescription};
        transition: color ${token.motionDurationMid};

        &:hover {
          color: ${token.colorText};
        }
      }
    `,

    filterTagContent: css`
      display: inline-block;
      max-width: 240px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      vertical-align: bottom;
    `,

    clearAllBtn: css`
      font-size: ${token.fontSizeSM}px;
      padding: 0 ${token.paddingXS}px;
      height: 24px;
      line-height: 24px;
    `,

    drawerBody: css`
      display: flex;
      flex-direction: column;
      gap: ${token.marginMD}px;
      padding-bottom: 64px;
    `,

    quickFiltersSection: css`
      padding-bottom: ${token.paddingSM}px;
      border-bottom: 1px solid ${token.colorBorderSecondary};
    `,

    quickFiltersTitle: css`
      font-weight: 600;
      font-size: ${token.fontSizeSM}px;
      color: ${token.colorTextSecondary};
      margin-bottom: ${token.marginXS}px;
    `,

    quickFiltersList: css`
      display: flex;
      flex-direction: column;
      gap: ${token.marginXS}px;
    `,

    groupsAccordion: css`
      .ant-collapse-header {
        font-weight: 500;
        font-size: ${token.fontSize}px;
      }

      .ant-collapse-content-box {
        display: flex;
        flex-direction: column;
        gap: ${token.marginSM}px;
      }
    `,

    drawerFooter: css`
      position: absolute;
      right: 0;
      bottom: 0;
      left: 0;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: ${token.marginXS}px;
      padding: ${token.paddingSM}px ${token.padding}px;
      background: ${token.colorBgElevated};
      border-top: 1px solid ${token.colorBorderSecondary};
      box-shadow: ${token.boxShadowSecondary};
      z-index: 10;
    `,

    // === Menu 模式专属样式 ===
    menuContainer: css`
      display: flex;
      flex-direction: column;
      gap: ${token.marginSM}px;
      width: 100%;
      background-color: ${token.colorBgContainer};
    `,

    menuCollapse: css`
      background: transparent !important;
      border: none !important;

      > .ant-collapse-item {
        border-bottom: 1px solid ${token.colorBorderSecondary} !important;

        &:last-child {
          border-bottom: none !important;
        }

        > .ant-collapse-header {
          padding: ${token.paddingSM}px 0 !important;
          font-weight: 600;
          font-size: ${token.fontSize}px;
          color: ${token.colorTextHeading};
        }

        > .ant-collapse-content {
          border-top: none !important;

          > .ant-collapse-content-box {
            padding: 0 0 ${token.paddingSM}px 0 !important;
            display: flex;
            flex-direction: column;
            gap: ${token.marginXS}px;
          }
        }
      }
    `,

    menuFieldWrapper: css`
      padding: ${token.paddingXXS}px 0;
      border-bottom: 1px dashed ${token.colorBorderSecondary};

      &:last-child {
        border-bottom: none;
      }
    `,

    menuSubCollapse: css`
      background: transparent !important;
      border: none !important;

      > .ant-collapse-item {
        border: none !important;

        > .ant-collapse-header {
          padding: 6px 0 !important;
          align-items: flex-start !important;
          cursor: pointer;
          user-select: none;

          .ant-collapse-header-text {
            flex: 1;
            min-width: 0;
          }

          .ant-collapse-expand-icon {
            padding-inline-start: 8px !important;
            padding-top: 3px;
            font-size: 12px;
            color: ${token.colorTextDescription};
            transition: color ${token.motionDurationMid};

            &:hover {
              color: ${token.colorPrimary};
            }
          }
        }

        > .ant-collapse-content {
          border-top: none !important;

          > .ant-collapse-content-box {
            padding: 4px 0 10px 0 !important;
          }
        }
      }
    `,

    menuFieldHeaderWrapper: css`
      display: flex;
      flex-direction: column;
      gap: 6px;
      width: 100%;
    `,

    menuFieldLabelRow: css`
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: ${token.colorText};
      font-size: ${token.fontSizeSM}px;
      transition: color ${token.motionDurationMid};

      &:hover {
        color: ${token.colorPrimary};
      }
    `,

    menuFieldLabel: css`
      font-weight: 500;
      line-height: 20px;
    `,

    menuFieldTagsWrapper: css`
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 4px;
      width: 100%;
    `,

    menuFieldTag: css`
      display: inline-flex;
      align-items: center;
      max-width: 100%;
      margin-inline-end: 0;
      font-size: ${token.fontSizeSM - 1}px;
      line-height: 20px;
      padding: 0 6px;
      border-radius: ${token.borderRadiusSM}px;
      background-color: ${token.colorFillTertiary};
      border: 1px solid ${token.colorBorderSecondary};
      color: ${token.colorText};

      .ant-tag-close-icon {
        margin-inline-start: 4px;
        font-size: 10px;
        color: ${token.colorTextDescription};
        cursor: pointer;

        &:hover {
          color: ${token.colorError};
        }
      }
    `,

    menuFieldTagMore: css`
      display: inline-flex;
      align-items: center;
      cursor: pointer;
      font-size: ${token.fontSizeSM - 1}px;
      color: ${token.colorPrimary};
      padding: 0 4px;
      user-select: none;
    `,

    menuFieldControlBox: css`
      .ant-form-item {
        margin-bottom: 0;
      }
    `,
  };
});
