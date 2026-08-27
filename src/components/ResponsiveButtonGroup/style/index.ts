import { createStyles, css } from 'antd-style';

export const useStyles = createStyles(({ token }) => {
  return {
    root: css`
      position: relative;
      box-sizing: border-box;
      display: flex;
      width: 100%;
      min-width: 0;
    `,
    visible: css`
      display: flex;
      flex: 0 0 auto;
      flex-wrap: nowrap;
      align-items: center;
      min-width: max-content;
    `,
    overflowTrigger: css`
      display: inline-flex;
      align-items: center;
      flex: 0 0 auto;
    `,
    overflowLabel: css`
      display: inline-flex;
      align-items: center;
    `,
    overflowCount: css`
      margin-inline-start: ${token.sizeXXS}px;
    `,
    overflowArrow: css`
      margin-inline-start: ${token.sizeXXS}px;
      font-size: ${token.fontSizeSM - token.lineWidthBold}px;
    `,
    measure: css`
      position: absolute;
      top: 0;
      left: 0;
      z-index: -1;
      display: flex;
      width: 0;
      max-width: 0;
      height: 0;
      overflow: hidden;
      visibility: hidden;
      pointer-events: none;
      contain: strict;
    `,
    measureItem: css`
      display: inline-flex;
      flex: 0 0 auto;
    `,
    popup: css`
      /* 下拉弹层容器 */
    `,
    menuItemContent: css`
      display: inline-flex;
      align-items: center;
      gap: ${token.sizeSM}px;
      width: 100%;
    `,
    menuItemIcon: css`
      display: inline-flex;
      align-items: center;
      flex: 0 0 auto;
    `,
    menuItemLabel: css`
      min-width: 0;
    `,
  };
});
