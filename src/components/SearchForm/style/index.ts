import { createStyles, css } from 'antd-style';

export const useStyles = createStyles(({ token }) => {
  return {
    root: css`
      display: flex;
      flex-direction: column;
      gap: ${token.marginSM}px;
      width: 100%;
      min-width: 0;
    `,

    inlineForm: css`
      width: 100%;
      min-width: 0;
    `,

    inlineFieldsWrapper: css`
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: ${token.marginXS}px;
      width: 100%;
      min-width: 0;
    `,

    inlineFieldItem: css`
      display: flex;
      min-width: 0;
      max-width: 100%;
    `,

    inlineGrid: css`
      display: grid;
      gap: ${token.marginSM}px ${token.margin}px;
      min-width: 0;
    `,
    inlineControl: css`
      min-width: 0;
      .ant-form-item {
        margin-bottom: 0;
      }
      .ant-form-item-row {
        flex-direction: column;
      }
      .ant-form-item-label {
        text-align: start;
        padding-bottom: ${token.paddingXXS}px;
      }
      .ant-form-item-control {
        width: 100%;
        min-width: 0;
      }
      .ant-select,
      .ant-picker,
      .ant-input-number {
        width: 100%;
        max-width: 100%;
      }
    `,
    fieldTriggerLabel: css`
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    `,
    fieldTriggerSummary: css`
      max-width: 160px;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-weight: 500;
    `,
    searchActions: css`
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: ${token.marginXS}px;
      flex-shrink: 0;
    `,
    menuActions: css`
      padding: ${token.paddingSM}px ${token.padding}px;
      border-top: 1px solid ${token.colorBorderSecondary};
      > .ant-btn {
        flex: 1;
      }
    `,
    inlineActions: css`
      justify-content: flex-end;
      margin-top: ${token.marginSM}px;
    `,
    menuQuickFields: css`
      display: flex;
      flex-direction: column;
      gap: ${token.marginXS}px;
      padding: ${token.paddingSM}px ${token.padding}px;
      .ant-form-item {
        margin-bottom: 0;
      }
    `,
    menuFieldDisabled: css`
      .ant-collapse-header-text,
      .ant-collapse-header-text * {
        color: ${token.colorTextDisabled};
      }
      .ant-collapse-item > .ant-collapse-header {
        cursor: not-allowed;
      }
    `,
    menuFieldTagText: css`
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    `,

    fieldTrigger: css`
      display: inline-flex;
      align-items: center;
      gap: ${token.marginXS}px;
      min-height: ${token.controlHeight}px;
      max-width: 100%;
      padding: ${token.paddingXXS}px ${token.paddingSM}px;
      border: 1px solid ${token.colorBorderSecondary};
      border-radius: ${token.borderRadius}px;
      background: ${token.colorBgContainer};
      font: inherit;
      font-size: ${token.fontSize}px;
      color: ${token.colorText};
      cursor: pointer;
      transition: border-color ${token.motionDurationMid},
        background-color ${token.motionDurationMid};
      &:hover:not(:disabled) {
        background: ${token.colorPrimaryBg};
        border-color: ${token.colorPrimaryBorder};
        color: ${token.colorPrimary};
      }
      &:focus-visible {
        outline: 2px solid ${token.colorPrimary};
        outline-offset: 2px;
      }
      &:disabled {
        cursor: not-allowed;
        color: ${token.colorTextDisabled};
        background: ${token.colorFillTertiary};
      }
    `,

    fieldTriggerActive: css`
      border-color: ${token.colorPrimary};
      background: ${token.colorPrimaryBg};
      color: ${token.colorPrimary};
    `,

    fieldTriggerHasValue: css`
      border-color: ${token.colorPrimaryBorder};
      background: ${token.colorPrimaryBg};
      color: ${token.colorPrimary};
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
      width: 280px;
      max-width: calc(100vw - 48px);
      display: flex;
      flex-direction: column;
      gap: ${token.marginXS}px;
    `,

    popoverPanelContent: css`
      padding-top: ${token.paddingXXS}px;
      min-width: 0;
      .ant-form-item {
        margin-bottom: 0;
      }
      .ant-select,
      .ant-picker,
      .ant-input-number {
        width: 100%;
        max-width: 100%;
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
      flex-wrap: wrap;
      align-items: center;
      gap: ${token.marginXS}px;
      min-height: ${token.controlHeight}px;
    `,

    toggleButton: css`
      display: inline-flex;
      align-items: center;
      gap: 4px;
      min-height: ${token.controlHeight}px;
      padding: 0 ${token.paddingXS}px;
      border: 0;
      border-radius: ${token.borderRadius}px;
      background: transparent;
      font: inherit;
      font-size: ${token.fontSize}px;
      color: ${token.colorPrimary};
      cursor: pointer;
      &:hover:not(:disabled) {
        background: ${token.colorFillTertiary};
      }
      &:focus-visible {
        outline: 2px solid ${token.colorPrimary};
        outline-offset: 2px;
      }
      &:disabled {
        cursor: not-allowed;
        color: ${token.colorTextDisabled};
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
      flex-wrap: wrap;
      align-items: flex-start;
      justify-content: space-between;
      gap: ${token.marginXS}px;
      padding: ${token.paddingXS}px ${token.paddingSM}px;
      background: ${token.colorFillAlter};
      border-radius: ${token.borderRadius}px;
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
      max-width: min(280px, 100%);
      min-width: 0;
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
      min-width: 0;
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
      position: sticky;
      bottom: 0;
      padding: ${token.paddingSM}px 0;
      background: ${token.colorBgElevated};
      border-top: 1px solid ${token.colorBorderSecondary};
      z-index: 1;
    `,

    // === Menu 模式专属样式 ===
    menuContainer: css`
      display: flex;
      flex-direction: column;
      min-width: 0;
      width: 100%;
    `,

    menuCollapse: css`
      background: transparent;
      border: none;
      border-radius: 0;
      > .ant-collapse-item:last-child > .ant-collapse-header {
        border-radius: 0;
      }
      > .ant-collapse-item {
        border-bottom: none;
        > .ant-collapse-header {
          padding: ${token.paddingSM}px ${token.padding}px;
          border-radius: 0;
          background: ${token.colorPrimaryBg};
          align-items: center;
          font-weight: 500;
          color: ${token.colorText};
          .ant-collapse-expand-icon {
            color: ${token.colorTextSecondary};
          }
          .ant-collapse-header-text {
            min-width: 0;
            overflow-wrap: anywhere;
          }
        }
        > .ant-collapse-content > .ant-collapse-content-box {
          padding: ${token.paddingXXS}px 0;
        }
      }
    `,

    menuFieldWrapper: css`
      min-width: 0;
    `,

    menuSubCollapse: css`
      background: transparent;
      border: none;
      > .ant-collapse-item {
        border: none;
        > .ant-collapse-header {
          padding: ${token.paddingSM}px ${token.padding}px;
          align-items: flex-start;
          border-radius: ${token.borderRadiusSM}px;
          cursor: pointer;
          user-select: none;
          &:hover {
            background: ${token.colorFillAlter};
          }
          .ant-collapse-header-text {
            flex: 1;
            min-width: 0;
          }
          .ant-collapse-expand-icon {
            padding-inline-start: ${token.paddingXS}px;
            font-size: 12px;
            color: ${token.colorTextDescription};
          }
        }
        > .ant-collapse-content > .ant-collapse-content-box {
          padding: 0 ${token.padding}px ${token.paddingSM}px;
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
      font-size: ${token.fontSize}px;
    `,

    menuFieldLabel: css`
      font-weight: 400;
      line-height: ${token.lineHeight};
      overflow-wrap: anywhere;
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
      border: 0;
      background: ${token.colorPrimaryBg};
      border-radius: ${token.borderRadiusSM}px;
      font: inherit;
      font-size: ${token.fontSizeSM}px;
      color: ${token.colorPrimary};
      padding: 0 6px;
      line-height: 22px;
      cursor: pointer;
      &:focus-visible {
        outline: 2px solid ${token.colorPrimary};
      }
    `,

    menuFieldControlBox: css`
      min-width: 0;
      .ant-form-item {
        margin-bottom: 0;
      }
      .ant-select,
      .ant-picker,
      .ant-input-number {
        width: 100%;
        max-width: 100%;
      }
    `,
  };
});
