import { createStyles, css } from 'antd-style';

export const useContainerStyles = createStyles(({ token }) => ({
  container: css`
    position: fixed;
    inset: 0;
    z-index: ${token.zIndexPopupBase ? token.zIndexPopupBase + 100 : 1000};
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    background: transparent;
    pointer-events: none;
  `,
  scrollWrapper: css`
    position: absolute;
    inset: 0;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    padding: ${token.sizeLG}px;
    overflow: visible;
    background: transparent;
    pointer-events: none;
  `,
  topLeft: css`
    align-items: flex-start;
    justify-content: flex-start;
  `,
  topRight: css`
    align-items: flex-end;
    justify-content: flex-start;
  `,
  top: css`
    align-items: center;
    justify-content: flex-start;
  `,
  bottomLeft: css`
    align-items: flex-start;
    justify-content: flex-end;
  `,
  bottomRight: css`
    align-items: flex-end;
    justify-content: flex-end;
  `,
  bottom: css`
    align-items: center;
    justify-content: flex-end;
  `,
  left: css`
    align-items: flex-start;
    justify-content: center;
  `,
  right: css`
    align-items: flex-end;
    justify-content: center;
  `,
}));
