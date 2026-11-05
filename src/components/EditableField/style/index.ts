import { createStyles, css } from 'antd-style';

export const useStyles = createStyles(({ token }) => ({
  root: css`
    --editable-field-hover-bg: ${token.colorFillTertiary};
    --editable-field-action-bg: ${token.colorBgContainer};
    position: relative;
    min-width: 0;
    border-radius: ${token.borderRadiusSM}px;
    /* 只改变背景，不通过 padding、边框或尺寸变化制造悬停效果。 */
    transition: background-color ${token.motionDurationMid}
      ${token.motionEaseOut};
    &[data-editable='true']:hover,
    &[data-editing='true'] {
      background-color: var(--editable-field-hover-bg);
    }
    &[data-editable='true']:hover > [data-edit-action],
    &[data-action-visible='true'] > [data-edit-action] {
      opacity: 1;
      visibility: visible;
      transform: translateY(-50%) translateX(0);
      pointer-events: auto;
      transition-delay: 0s;
    }
    @media (hover: none) {
      &[data-editable='true'] > [data-edit-action] {
        opacity: 1;
        visibility: visible;
        transform: translateY(-50%);
        pointer-events: auto;
      }
    }
  `,
  action: css`
    && {
      position: absolute;
      inset-inline-end: ${token.paddingXXS}px;
      top: 50%;
      z-index: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: ${token.controlHeightSM}px;
      height: ${token.controlHeightSM}px;
      padding: 0;
      color: ${token.colorTextSecondary};
      border-radius: ${token.borderRadiusSM}px;
      background: var(--editable-field-action-bg);
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      transform: translateY(-50%) translateX(3px);
      transition: opacity ${token.motionDurationMid} ${token.motionEaseOut},
        transform ${token.motionDurationMid} ${token.motionEaseOut},
        visibility 0s linear ${token.motionDurationMid};
    }
    &&:hover {
      color: ${token.colorText};
      background: var(--editable-field-action-bg);
    }
  `,
  editor: css`
    display: flex;
    flex-direction: column;
    gap: ${token.marginSM}px;
    min-width: 0;
    /* 不继承只读行可能设置的大行高，保持输入区和按钮的紧凑节奏。 */
    color: ${token.colorText};
    font-size: ${token.fontSize}px;
    line-height: ${token.lineHeight};
    &[data-mode='inline'] {
      animation: editable-field-enter ${token.motionDurationMid}
        ${token.motionEaseOut};
    }
    /* 浮层使用 Popover 自带动画，避免两层位移动画叠加。 */
    @keyframes editable-field-enter {
      from {
        opacity: 0;
        transform: translateY(3px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `,
  footer: css`
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: ${token.marginXS}px;
    flex-wrap: wrap;
  `,
}));
