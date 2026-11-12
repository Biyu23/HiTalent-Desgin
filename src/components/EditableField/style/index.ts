import { createStyles, css } from 'antd-style';

export const useStyles = createStyles(
  ({ token }, prefixCls: string = 'htd-editable-field') => ({
    root: css`
      --editable-field-hover-bg: ${token.colorFillTertiary};
      --editable-field-action-bg: ${token.colorBgContainer};
      position: relative;
      min-width: 0;
      border-radius: ${token.borderRadiusSM}px;
      transition: background-color ${token.motionDurationMid};
      &.${prefixCls}-editable:hover, &.${prefixCls}-editing {
        background: var(--editable-field-hover-bg);
      }
      &:hover
        > .${prefixCls}-action,
        &.${prefixCls}-action-visible
        > .${prefixCls}-action {
        opacity: 1;
        pointer-events: auto;
        transform: translateY(-50%);
      }
      > [hidden] {
        display: none;
      }
      @media (hover: none) {
        > .${prefixCls}-action {
          opacity: 1;
          pointer-events: auto;
          transform: translateY(-50%);
        }
      }
    `,
    value: css`
      min-width: 0;
      &.${prefixCls}-value-trigger {
        cursor: pointer;
      }
    `,
    action: css`
      position: absolute;
      inset-inline-end: ${token.paddingXXS}px;
      top: 50%;
      z-index: 1;
      display: inline-flex;
      align-items: center;
      border-radius: ${token.borderRadiusSM}px;
      background: var(--editable-field-action-bg);
      opacity: 0;
      pointer-events: none;
      transform: translateY(-50%) translateX(3px);
      transition: opacity ${token.motionDurationMid},
        transform ${token.motionDurationMid};
    `,
    editor: css`
      min-width: 0;
      color: ${token.colorText};
      font-size: ${token.fontSize}px;
      line-height: ${token.lineHeight};
    `,
  }),
);
